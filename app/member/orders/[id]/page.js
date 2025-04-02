'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
// 取得用戶
import { useAuth } from '@/app/context/AuthContext'
// 引入樣式
import styles from './order_id.module.css'
import { MdOutlinePets } from 'react-icons/md'
// components
import Alert from '@/app/_components/alert'
import { usePageTitle } from '@/app/context/TitleContext'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function OrderIdPage(props) {
  // 獲取用戶信息
  const { user } = useAuth()
  const userId = user?.id

  // 從網址上得到動態路由參數
  const params = useParams()
  const oid = params?.id

  const router = useRouter()
  const searchParams = useSearchParams()

  const [reviews, setReviews] = useState({})
  const [hoverRating, setHoverRating] = useState({})

  // 滑動至商品區塊
  useEffect(() => {
    const scrollToProducts = searchParams.get('scrollTo') === 'products'
    if (scrollToProducts) {
      const scrollToElement = () => {
        const productsElement = document.getElementById('products')
        if (productsElement) {
          productsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      // 延迟执行滚动
      setTimeout(scrollToElement, 200)
    }
  }, [searchParams])

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error, mutate } = useSWR(`/api/shop/orders/${oid}`, fetcher)
  usePageTitle('訂單')
  // 处理加载状态
  if (!data) return <div>Loading...</div>
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const order = data.order
  const products = data.products
  order.created_at = new Date(order.created_at).toLocaleDateString()
  order.shipped_at = order.shipped_at
    ? new Date(order.shipped_at).toLocaleDateString()
    : '-'
  order.finish_at = order.finish_at
    ? new Date(order.finish_at).toLocaleDateString()
    : '-'

  // 評價狀態-------------

  // 紀錄評價星星hover狀態
  const handleHover = (productId, variantId, star) => {
    setHoverRating((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: star,
    }))
  }

  // 評價星星點擊事件
  const handleRating = (productId, variantId, rating) => {
    setReviews((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: {
        ...prev[`${productId}-${variantId}`],
        rating,
      },
    }))
    setHoverRating((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: 0,
    }))
  }

  // 評價內容改變事件
  const handleReviewChange = (productId, variantId, text) => {
    setReviews((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: {
        ...prev[`${productId}-${variantId}`],
        review: text,
      },
    }))
  }

  // 提交評價
  const submitReview = async (orderItemId, productId, variantId) => {
    const review = reviews[`${productId}-${variantId}`]
    if (!review || !review.rating) {
      Alert({
        title: '請選擇評分',
        showconfirmBtn: true,
        confirmBtnText: 'ok',
      })
      return
    }

    try {
      const response = await fetch(`/api/shop/orders/${oid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItemId,
          productId,
          variantId,
          userId,
          rating: review.rating,
          reviewText: review.review || '',
        }),
      })

      if (response.ok) {
        Alert({
          title: '評價提交成功！',
          timer: 2000,
          icon: 'success',
          showCloseButton: true,
        })
        await mutate(undefined, { revalidate: true })
      } else {
        const errorData = await response.json()
        Alert({
          title: `評價提交失敗：${errorData.error}`,
          showconfirmBtn: true,
          confirmBtnText: 'ok',
        })
      }
    } catch (error) {
      console.error('提交評價時發生錯誤：', error)
      Alert({
        title: '發生錯誤，請稍後再試。',
        showconfirmBtn: true,
        confirmBtnText: 'ok',
      })
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <button
          className={styles.btn}
          onClick={() => router.push('/member/orders')}
        >
          返回訂單紀錄
        </button>
        訂單 {oid}
      </div>
      {/* 電腦 */}
      <div className={styles.container}>
        <div className={styles.reviewContainer}>
          <div className={styles.containTitle}>
            <h1>資訊欄</h1>
          </div>
          <div className={styles.containBody}>
            <div className={styles.group}>
              <div>
                <MdOutlinePets />
                <h1>訂單狀態</h1>
              </div>
              <div className={styles.groupTitle}>
                <div>成立時間</div>
                <div>訂單狀態</div>
                <div>出貨時間</div>
                <div>完成時間</div>
              </div>
              <div className={styles.groupBody}>
                <div>{order?.created_at}</div>
                <div>{order?.order_status}</div>
                <div>{order?.shipped_at ? order?.shipped_at : '- -'}</div>
                <div>{order?.finish_at ? order?.finish_at : '- -'}</div>
              </div>
            </div>
            <div className={styles.group}>
              <div>
                <MdOutlinePets />
                <h1>付款資訊</h1>
              </div>
              <div className={styles.groupTitle}>
                <div>付款方式</div>
                <div>金額</div>
                <div>付款狀態</div>
                <div>發票</div>
              </div>
              <div className={styles.groupBody}>
                <div>{order?.payment_method}</div>
                <div>$ {order.total_price}<br/> 
                {order?.shipping_fee || order?.shipping_fee!==0
                ?`(含運費$ ${order?.shipping_fee })`
                :null}</div>
                <div>{order.payment_status}</div>
                <div>
                  {order?.invoice_method == '紙本' && order?.invoice_method}
                  {(order?.invoice_method == '載具' ||
                    order?.invoice_method == '手機載具') &&
                    order?.invoice_method + order?.mobile_barcode}
                  {order?.invoice_method == '統編' &&
                    order?.invoice_method + order?.taxID_number}
                  {/* {order?.invoice_method +
                            order?.taxID_number +
                            order?.mobile_barcode} */}
                </div>
              </div>
            </div>
            <div className={styles.group}>
              <div>
                <MdOutlinePets />
                <h1>配送資訊</h1>
              </div>
              <div className={styles.groupTitle}>
                <div>配送編號</div>
                <div>配送方式</div>
                <div>配送地址</div>
              </div>
              <div className={styles.groupBody}>
                <div>
                  {order?.tracking_number ? order?.tracking_number : '-'}
                </div>
                <div>{order?.shipping_method}</div>
                <div>{order?.shipping_address}</div>
              </div>
            </div>
            <div className={styles.group}>
              <div>
                <MdOutlinePets />
                <h1>收件人資訊</h1>
              </div>
              <div className={styles.groupTitle}>
                <div>姓名</div>
                <div>電話</div>
                <div>電子信箱</div>
              </div>
              <div className={styles.groupBody}>
                <div>{order?.recipient_name}</div>
                <div>{order?.recipient_phone}</div>
                <div>{order?.recipient_email}</div>
              </div>
            </div>
            <div className={styles.group}>
              <div>
                <MdOutlinePets />
                <h1>備註</h1>
              </div>
              <div className={styles.remark}>{order?.remark}</div>
            </div>
          </div>
        </div>

        {/* 商品列表 */}
        <div id="products" className={styles.productContainer}>
          <div className={styles.containTitle}>
            <div>#</div>
            <div>商品</div>
            <div>款式</div>
            <div>單價</div>
            <div>數量</div>
            <div>價格</div>
          </div>
          <div className={styles.containBody}>
            {products?.map((product, index) => {
              return (
                <React.Fragment key={index}>
                  {/* 商品資訊 */}
                  <div>
                    <div>{index + 1}</div>
                    <div className={styles.image}>
                      <Link href={`/shop/${product.product_id}`}>
                        <Image
                          src={
                            product.image_url || '/images/default_no_pet.jpg'
                          }
                          alt={product.product_name}
                          width={100}
                          height={100}
                        />
                      </Link>

                      <Link href={`/shop/${product.product_id}`}>
                        {product.product_name}
                      </Link>
                    </div>
                    <div>{product.variant_name}</div>
                    <div>${product.price}</div>
                    <div>{product.quantity}</div>
                    <div>${product.price * product.quantity}</div>
                  </div>
                  {/* 評價區塊 */}
                  {order?.order_status == '已完成' ? (
                    <div className={styles.reviewSection}>
                      <div>
                        <div className={styles.rating}>
                          <div>
                            <span>評分：</span>
                            {product?.rating
                              ? Array.from(
                                  { length: Math.floor(product?.rating) },
                                  (_, i) => (
                                    <span key={i} style={{ color: '#ffcc00' }}>
                                      ★
                                    </span>
                                  )
                                )
                              : [1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    className={styles.star}
                                    style={{
                                      color:
                                        hoverRating[
                                          `${product.product_id}-${product.variant_id}`
                                        ] >= star ||
                                        reviews[
                                          `${product.product_id}-${product.variant_id}`
                                        ]?.rating >= star
                                          ? '#ffcc00'
                                          : '#bebbb8',
                                    }}
                                    onClick={() =>
                                      handleRating(
                                        product.product_id,
                                        product.variant_id,
                                        star
                                      )
                                    }
                                    onMouseEnter={() =>
                                      handleHover(
                                        product.product_id,
                                        product.variant_id,
                                        star
                                      )
                                    }
                                    onMouseLeave={() =>
                                      handleHover(
                                        product.product_id,
                                        product.variant_id,
                                        0
                                      )
                                    }
                                  >
                                    ★
                                  </button>
                                ))}
                          </div>
                          {product?.rating ? (
                            <div
                              className={styles.submitBtn}
                              style={{
                                backgroundColor: '#8FBC8F',
                                cursor: 'text',
                              }}
                            >
                              已評論
                            </div>
                          ) : (
                            <button
                              className={styles.submitBtn}
                              onClick={() =>
                                submitReview(
                                  product.order_item_id,
                                  product.product_id,
                                  product.variant_id
                                )
                              }
                            >
                              提交
                            </button>
                          )}
                        </div>
                        {product?.rating ? (
                          product?.review_text ? (
                            <textarea
                              className={styles.reviewInput}
                              value={product?.review_text}
                              readOnly
                            />
                          ) : null
                        ) : (
                          <textarea
                            className={styles.reviewInput}
                            placeholder="請留下您的評論..."
                            onChange={(e) =>
                              handleReviewChange(
                                product.product_id,
                                product.variant_id,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                  ) : null}
                  {index < products.length - 1 && <hr />}{' '}
                  {/* 添加水平线，但不包括最后一个产品后 */}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* 手機 */}
      <div className={styles.checkoutMobileContainer}>
        {/* 資訊欄 */}
        <div className={styles.reviewContainer}>
          <h1 className={styles.title}>資訊欄</h1>

          {/* 訂單資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>訂單狀態</h2>
            </div>
            <div className={styles.infoBody}>
              <p>
                <strong>成立時間：</strong>
                {order?.created_at}
              </p>
              <p>
                <strong>訂單狀態：</strong>
                {order.order_status}
              </p>
              <p>
                <strong>出貨時間：</strong>{' '}
                {order?.shipped_at ? order?.shipped_at : '- -'}{' '}
              </p>
              <p>
                <strong>出貨時間：</strong>
                {order?.finish_at ? order?.finish_at : '- -'}{' '}
              </p>
            </div>
          </div>

          {/* 付款資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>付款資訊</h2>
            </div>
            <div className={styles.infoBody}>
              <p>
                <strong>付款方式：</strong>
                {order?.payment_method}
              </p>
              <p>
                <strong>金額：</strong>
                $ {order.total_price} {order?.shipping_fee || order?.shipping_fee!==0
                ?`(含運費$ ${order?.shipping_fee })`
                :null}
              </p>
              <p>
                <strong>付款狀態：</strong>
                {order.payment_status}
              </p>
              <p>
                <strong>發票：</strong>
                {order?.invoice_method == '紙本' && order?.invoice_method}
                {(order?.invoice_method == '載具' ||
                  order?.invoice_method == '手機載具') &&
                  order?.invoice_method + order?.mobile_barcode}
                {order?.invoice_method == '統編' &&
                  order?.invoice_method + order?.taxID_number}
              </p>
            </div>
          </div>

          {/* 配送資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>配送資訊</h2>
            </div>
            <div className={styles.infoBody}>
              <p>
                <strong>配送編號：</strong>
                {order?.tracking_number ? order?.tracking_number : '-'}
              </p>
              <p>
                <strong>配送方式：</strong>
                {order?.shipping_method}
              </p>
              <p>
                <strong>配送地址：</strong>
                {order?.shipping_address}
              </p>
            </div>
          </div>

          {/* 收件人資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>收件人資訊</h2>
            </div>
            <div className={styles.infoBody}>
              <p>
                <strong>姓名：</strong>
                {order?.recipient_name}
              </p>
              <p>
                <strong>電話：</strong>
                {order?.recipient_phone}
              </p>
              <p>
                <strong>電子信箱：</strong>
                {order?.recipient_email}
              </p>
            </div>
          </div>

          {/* 備註 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>備註</h2>
            </div>
            <p className={styles.remark}>{order?.remark}</p>
          </div>
        </div>

        {/* 商品資訊 */}
        <div className={styles.productContainer}>
          <h1 className={styles.title}>購物明細</h1>
          <div className={styles.productList}>
            {products?.map((product, index) => (
              <div key={index} className={styles.productItem}>
                <div className={styles.product}>
                  <Link href={`/shop/${product.product_id}`}>
                    <Image
                      src={product.image_url || '/images/default_no_pet.jpg'}
                      alt={product.product_name}
                      width={80}
                      height={80}
                    />
                  </Link>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.product_name}</p>
                    <p>
                      <strong>款式：</strong>
                      {product.variant_name}
                    </p>
                    <p>
                      <strong>單價：</strong>${product.price}
                    </p>
                    <p>
                      <strong>數量：</strong>
                      {product.quantity}
                    </p>
                    <p>
                      <strong>價格：</strong>${product.price * product.quantity}
                    </p>
                  </div>
                </div>
                {/* 評價區塊 */}
                {order?.order_status == '已完成' ? (
                  <div className={styles.reviewSection}>
                    <div>
                      <div className={styles.rating}>
                        <div>
                          <span>評分：</span>
                          {product?.rating
                            ? Array.from(
                                { length: Math.floor(product?.rating) },
                                (_, i) => (
                                  <span key={i} style={{ color: '#ffcc00' }}>
                                    ★
                                  </span>
                                )
                              )
                            : [1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  className={styles.star}
                                  style={{
                                    color:
                                      hoverRating[
                                        `${product.product_id}-${product.variant_id}`
                                      ] >= star ||
                                      reviews[
                                        `${product.product_id}-${product.variant_id}`
                                      ]?.rating >= star
                                        ? '#ffcc00'
                                        : '#bebbb8',
                                  }}
                                  onClick={() =>
                                    handleRating(
                                      product.product_id,
                                      product.variant_id,
                                      star
                                    )
                                  }
                                  onMouseEnter={() =>
                                    handleHover(
                                      product.product_id,
                                      product.variant_id,
                                      star
                                    )
                                  }
                                  onMouseLeave={() =>
                                    handleHover(
                                      product.product_id,
                                      product.variant_id,
                                      0
                                    )
                                  }
                                >
                                  ★
                                </button>
                              ))}
                        </div>
                        {product?.rating ? (
                          <div
                            className={styles.submitBtn}
                            style={{
                              backgroundColor: '#8FBC8F',
                              cursor: 'text',
                            }}
                          >
                            已評論
                          </div>
                        ) : (
                          <button
                            className={styles.submitBtn}
                            onClick={() =>
                              submitReview(
                                product.order_item_id,
                                product.product_id,
                                product.variant_id
                              )
                            }
                          >
                            提交
                          </button>
                        )}
                      </div>
                      {product?.rating ? (
                        product?.review_text ? (
                          <textarea
                            className={styles.reviewInput}
                            value={product?.review_text}
                            readOnly
                          />
                        ) : null
                      ) : (
                        <textarea
                          className={styles.reviewInput}
                          placeholder="請留下您的評論..."
                          onChange={(e) =>
                            handleReviewChange(
                              product.product_id,
                              product.variant_id,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

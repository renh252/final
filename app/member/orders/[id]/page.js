'use client'

import React, { useState, useEffect } from 'react'
import { useRouter,useParams } from 'next/navigation'
import Image from 'next/image'
// 引入樣式
// import styles from '@/app/shop/checkout/review/review.module.css'
import styles from './order_id.module.css'
import { MdOutlinePets } from 'react-icons/md'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function OrderIdPage(props) {

  // 從網址上得到動態路由參數
  const params = useParams()
  const oid = params?.id

  const router = useRouter()

  const [reviews, setReviews] = useState({});
  const [hoverRating, setHoverRating] = useState({});



  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR(`/api/shop/orders/${oid}`, fetcher)
  // 处理加载状态
  if (!data) return <div>Loading...</div>
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const order = data.order
  const products = data.products
  order.created_at = new Date(order.created_at).toLocaleDateString()
  order.shipped_at = order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : '-'
  order.finish_at = order.finish_at ? new Date(order.finish_at).toLocaleDateString() : '-'

  // 評價狀態

  const handleHover = (productId, variantId, star) => {
    setHoverRating(prev => ({
      ...prev,
      [`${productId}-${variantId}`]: star
    }));
  };



const handleRating = (productId, variantId, rating) => {
  setReviews((prev) => ({
    ...prev,
    [`${productId}-${variantId}`]: { ...prev[`${productId}-${variantId}`], rating },
  }));
  setHoverRating(prev => ({
    ...prev,
    [`${productId}-${variantId}`]: 0
  }));
};

const handleReviewChange = (productId,variantId, text) => {
  setReviews((prev) => ({
    ...prev,
    [`${productId}-${variantId}`]: { ...prev[`${productId}-${variantId}`], review: text },
  }));
};

const submitReview = (productId) => {
  console.log("提交評價：", reviews[productId]);
  // 這裡可以將數據發送到後端 API
};
  
  return (
    <div className={styles.main}>
      <div className={styles.header}>
      <button 
      className={styles.btn}
      onClick={() => router.push('/member/orders')}>返回訂單紀錄</button>

      訂單 {oid}
      </div>
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
                    <div>
                      {order?.shipped_at
                      ? order?.shipped_at
                      : '- -'}
                    </div>
                    <div>
                      {order?.finish_at
                      ? order?.finish_at
                      : '- -'}
                    </div>
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
                    <div>$ {order.total_price}</div>
                    <div>{order.payment_status}</div>
                    <div>
                      {order?.invoice_method +
                        order?.taxID_number +
                        order?.mobile_barcode}
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
                    {order?.tracking_number
                    ?order?.tracking_number
                    :'-'}</div>
                    <div>{order?.shipping_method}</div>
                    <div>
                      {order?.shipping_address}
                    </div>
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

      <div className={styles.productContainer}>
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
                      <div>
                        <div>{index + 1}</div>
                        <div className={styles.image}>
                          <Image
                            src={
                              product.image_url || '/images/default_no_pet.jpg'
                            }
                            alt={product.product_name}
                            width={100}
                            height={100}
                          />
                          {product.product_name}
                        </div>
                        <div>{product.variant_name}</div>
                        <div>
                          {product?.promotion ? (
                            <p>
                              $
                              {Math.ceil(
                                (product.price *
                                  (100 -
                                    product.promotion.discount_percentage)) /
                                  100
                              )}
                            </p>
                          ) : (
                            <p className={styles.h2}>${product.price}</p>
                          )}
                        </div>
                        <div>{product.quantity}</div>
                        <div>
                          {product?.promotion ? (
                            <p>
                              $
                              {Math.ceil(
                                (product.price *
                                  (100 -
                                    product.promotion.discount_percentage)) /
                                  100
                              ) * product.quantity}
                            </p>
                          ) : (
                            <p>${product.price * product.quantity}</p>
                          )}
                        </div>
                      </div>
                      {/* 評價區塊 */}
                      <div className={styles.reviewSection}>
                        <div>
                          <div className={styles.rating}>
                          <div>
                            <span>評分：</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star} 
                                className={styles.star}
                                style={{ 
                                  color: (hoverRating[`${product.product_id}-${product.variant_id}`] >= star || 
                                          reviews[`${product.product_id}-${product.variant_id}`]?.rating >= star) 
                                          ? '#ffcc00' 
                                          : '#cda274' 
                                }}
                                onClick={() => handleRating(product.product_id, product.variant_id, star)}
                                onMouseEnter={() => handleHover(product.product_id, product.variant_id, star)}
                                onMouseLeave={() => handleHover(product.product_id, product.variant_id, 0)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                            <button className={styles.submitBtn} onClick={() => submitReview(product.id)}>提交</button>
                          </div>
                          <textarea
                            className={styles.reviewInput}
                            placeholder="請留下您的評論..."
                            onChange={(e) => handleReviewChange(product.id, e.target.value)}
                          />
                          
                        </div>
                      </div>
                      {index < products.length - 1 && <hr />}{' '}
                      {/* 添加水平线，但不包括最后一个产品后 */}
                    </React.Fragment>
                  )
                })}
              </div>
      </div>
    </div>
  )
}

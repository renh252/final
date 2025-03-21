'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
// 引入樣式
import styles from '@/app/shop/checkout/review/review.module.css'
import { MdOutlinePets } from 'react-icons/md'
import RecordPage from '@/app/member/_components/RecordPage'
import StatusBadge from '@/app/member/_components/StatusBadge'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function IdPage(props) {

  // 從網址上得到動態路由參數
  const params = useParams()
  const oid = params?.id


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
  

  return (
    <div className={styles.main}>
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
                    {order?.shipping_method=='宅配'
                    ?order?.tracking_number
                    :'--'}</div>
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

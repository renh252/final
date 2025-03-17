// FILEPATH: c:/iSpan/final/app/shop/checkout/review/page.js
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './review.module.css'  // 假设您有一个对应的 CSS 模块

function ReviewPage() {
  const [checkoutData, setCheckoutData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutData')
    if (storedData) {
      setCheckoutData(JSON.parse(storedData))
    } else {
      // 如果没有数据，重定向回 checkout 页面
      router.push('/shop/checkout')
    }
  }, [router])

  if (!checkoutData) {
    return <div>加載中...</div>
  }

  return (
    <div className={styles.reviewContainer}>
      <h1>訂單確認</h1>
      <div className={styles.orderDetails}>
        <h2>配送方式: {checkoutData.delivery}</h2>
        {checkoutData.delivery !== 'home' && (
          <div>
            <p>門市名稱: {checkoutData.storeName}</p>
            <p>門市代號: {checkoutData.storeId}</p>
          </div>
        )}
        <p>收件人: {checkoutData.recipient_name}</p>
        <p>手機: {checkoutData.recipient_phone}</p>
        <p>電子信箱: {checkoutData.recipient_email}</p>
        <p>備註: {checkoutData.remark}</p>
        <p>付款方式: {checkoutData.payment_method}</p>
        <p>發票: {checkoutData.invoice_method}</p>
        {checkoutData.invoice_method === 'mobile' && (
          <p>手機條碼: {checkoutData.mobile_barcode}</p>
        )}
        {checkoutData.invoice_method === 'taxID_number' && (
          <p>統編: {checkoutData.taxID_number}</p>
        )}
      </div>
      <div className={styles.buttons}>
        <button onClick={() => router.push('/shop/checkout')}>修改訂單</button>
        <button onClick={() => {
          // 这里可以添加提交订单的逻辑
          alert('訂單已提交！')
          localStorage.removeItem('checkoutData')  // 清除存储的数据
          router.push('/shop/order-complete')  // 导航到订单完成页面
        }}>確認訂單</button>
      </div>
    </div>
  )
}

export default ReviewPage
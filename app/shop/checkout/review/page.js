// FILEPATH: c:/iSpan/final/app/shop/checkout/review/page.js
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './review.module.css' 

export default function ReviewPage() {
  const [checkoutData, setCheckoutData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleModifyOrder = (e) => {
    e.preventDefault()
    console.log('Modifying order...')
    // setIsProcessing(true)
    router.push('/shop/checkout')
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault()
    setIsProcessing(true)
    // 这里可以添加提交订单的逻辑
    alert('訂單已提交！')
    localStorage.removeItem('checkoutData')  // 清除存储的数据
    router.push('/shop/summary')  // 导航到订单完成页面
  }

  // 在组件卸载时检查是否需要删除数据
  useEffect(() => {
    return () => {
      if (!isProcessing) {
        // 如果不是正在处理订单，则删除数据
        localStorage.removeItem('checkoutData');
      }
    };
  }, [isProcessing]);

  if (!checkoutData) {
    return <div>加載中...</div>
  }


  return (
    <form className={styles.main}>
      <div className={styles.reviewContainer}>
        <div className={styles.containTitle}>
          <h1>訂單明細</h1>
        </div>
        <div className={styles.containBody}>
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
      </div>

      <div className={styles.reviewContainer}>
        <div className={styles.containTitle}></div>
        <div className={styles.containBody}>

        </div>
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={handleModifyOrder}>修改訂單</button>
        <button type="button" onClick={handleSubmitOrder}>前往付款</button>
      </div>

    </form>
  )
}


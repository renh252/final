'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './summary.module.css'
import { BsPatchCheckFill } from 'react-icons/bs'

import { usePageTitle } from '@/app/context/TitleContext'
import { MdOutlinePets } from 'react-icons/md'

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') // 從 URL 讀取 `orderId`
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productPrice, setProductPrice] = useState({
    totalOriginalPrice: 0,
    totalDiscount: 0,
    shippingFee: 0,
    totalAmount: 0,
  })
  const [notificationSent, setNotificationSent] = useState(false)
  usePageTitle('結帳')

  // 發送付款成功通知
  const sendPaymentNotification = async (orderInfo) => {
    try {
      // 避免重複發送通知
      if (notificationSent) return

      // 檢查付款狀態為"已付款"才發送通知
      if (orderInfo.paymentStatus !== '已付款') return

      console.log('開始發送付款成功通知')

      // 檢查用戶ID是否存在
      const userId = orderInfo.userId || localStorage.getItem('userId')
      if (!userId) {
        console.error('無法發送用戶通知: 找不到用戶ID')
        return
      }

      try {
        // 發送給訂購人的通知
        const userResponse = await fetch('/api/notifications/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            type: 'shop',
            title: '訂單付款成功',
            message: `您的訂單 ${orderId} 已付款成功，總金額 NT$${orderInfo.totalAmount}。我們將盡快為您安排出貨。`,
            link: `/member/orders/${orderId}`,
          }),
        })

        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(
            `發送用戶通知失敗: ${errorData.message || userResponse.statusText}`
          )
        }

        console.log('用戶通知發送成功')
      } catch (userError) {
        console.error('發送用戶通知出錯:', userError)
      }

      try {
        // 發送給管理員的通知
        const adminResponse = await fetch('/api/notifications/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_id: 6, // 管理員ID
            type: 'shop',
            title: '收到新訂單',
            message: `收到一筆新訂單 ${orderId}，金額 NT$${orderInfo.totalAmount}，請盡快處理。`,
            link: `/admin/shop/orders/${orderId}`,
          }),
        })

        if (!adminResponse.ok) {
          const errorData = await adminResponse.json()
          throw new Error(
            `發送管理員通知失敗: ${
              errorData.message || adminResponse.statusText
            }`
          )
        }

        console.log('管理員通知發送成功')
      } catch (adminError) {
        console.error('發送管理員通知出錯:', adminError)
      }

      setNotificationSent(true)
      console.log('通知處理完畢')
    } catch (err) {
      console.error('發送付款成功通知時發生錯誤:', err)
    }
  }

  useEffect(() => {
    // 🔹 讀取 `localStorage` 內的金額資訊
    const storedPrice = localStorage.getItem('productPrice')
    if (storedPrice) {
      setProductPrice(JSON.parse(storedPrice))
    }

    if (!orderId) {
      setError('找不到訂單編號')
      setIsLoading(false)
      return
    }

    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/shop/checkout/summary/${orderId}`)
        if (!response.ok) {
          throw new Error('無法獲取訂單資料')
        }
        const data = await response.json()
        setOrderData(data)

        // 發送付款成功通知
        if (data && data.paymentStatus === '已付款') {
          await sendPaymentNotification(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId])

  if (isLoading) return <div>載入中...</div>
  if (error) return <div>錯誤: {error}</div>
  if (!orderData) return <div>找不到訂單資料</div>

  return (
    <>
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          {/* 訂單成功標誌 */}
          <div>
            <BsPatchCheckFill className={styles.successIcon} />
            <h1 className={styles.title}>訂購完成</h1>
          </div>
          {/* 按鈕區塊 */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              onClick={() => (window.location.href = '/member/orders')}
            >
              查看訂單
            </button>
            <button
              className={styles.button}
              onClick={() => (window.location.href = '/shop')}
            >
              繼續逛逛
            </button>
          </div>
        </div>

        {/* 收件人資訊表格 */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>收件人</th>
                <th>電話</th>
                <th>Email</th>
                <th>備註</th>
                <th>總額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{orderData.recipientName}</td>
                <td>{orderData.recipientPhone}</td>
                <td>{orderData.recipientEmail}</td>
                <td>{orderData.remark || '無'}</td>
                <td>${orderData.totalAmount || '無'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 手機 */}
      <div className={styles.checkoutMobileContainer}>
        {/* 訂單成功標誌 */}
        <div className={styles.success}>
          <BsPatchCheckFill className={styles.successIcon} />
          <h1 className={styles.successTitle}>訂購完成</h1>
        </div>
        {/* 按鈕 */}
        <div className={styles.buttonGroup}>
          <button onClick={() => (window.location.href = '/member/orders')}>
            查看訂單
          </button>
          <button onClick={() => (window.location.href = '/shop')}>
            繼續逛逛
          </button>
        </div>
        {/* 資訊欄 */}
        <div className={styles.reviewContainer}>
          <h1 className={styles.title}>資訊欄</h1>

          {/* 收件人資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>收件人資訊</h2>
            </div>
            <div className={styles.infoBody}>
              <p>
                <strong>姓名：</strong>
                {orderData.recipientName}
              </p>
              <p>
                <strong>電話：</strong>
                {orderData?.recipientPhone}
              </p>
              <p>
                <strong>電子信箱：</strong>
                {orderData?.recipientEmail}
              </p>
            </div>
          </div>

          {/* 備註 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}>
              <MdOutlinePets />
              <h2>備註</h2>
            </div>
            <p className={styles.remark}>{orderData?.remark}</p>
          </div>
        </div>

        {/* 總計 */}
        <div className={styles.summaryContainer}>
          <div className={styles.summaryTotal}>
            <span>合計：</span>
            <span>${orderData?.totalAmount}</span>
          </div>
        </div>
      </div>
    </>
  )
}

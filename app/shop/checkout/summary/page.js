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
  const [isMounted, setIsMounted] = useState(false)
  usePageTitle('結帳')

  // 確保組件已掛載
  useEffect(() => {
    setIsMounted(true)
    
    // 僅在客戶端執行 localStorage 相關操作
    if (typeof window !== 'undefined') {
      // 🔹 讀取 `localStorage` 內的金額資訊
      const storedPrice = localStorage.getItem('productPrice')
      if (storedPrice) {
        setProductPrice(JSON.parse(storedPrice))
      }
    }
    
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {

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
        console.log('訂單資料:', data)
        setOrderData(data)

        // 確保組件已掛載且通知未發送過才發送通知
        if (isMounted && !notificationSent) {
          // 等待一小段時間確保 NotificationBell 已掛載
          setTimeout(async () => {
            await sendPaymentNotification(data)
          }, 500)
        }
      } catch (err) {
        console.error('獲取或處理訂單資料時發生錯誤:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId, isMounted])

  // 發送付款成功通知
  const sendPaymentNotification = async (orderInfo) => {
    try {
      // 避免重複發送通知
      if (notificationSent) {
        console.log('通知已發送過，跳過')
        return
      }

      console.log('開始發送訂購完成通知')

      // 檢查用戶ID是否存在
      let userId = orderInfo.userId
      // 僅在客戶端環境中使用 localStorage
      if (typeof window !== 'undefined' && !userId) {
        userId = localStorage.getItem('userId')
      }
      console.log('用戶ID:', userId)

      if (!userId || typeof window === 'undefined') {
        console.error('無法發送用戶通知: 找不到用戶ID或非客戶端環境')
        return
      }

      try {
        // 發送給訂購人的通知
        console.log('準備發送用戶通知，參數:', {
          user_id: userId,
          type: 'shop',
          title: '訂單已成立',
          message: `您的訂單 ${orderId} 已成立，總金額 NT$${orderInfo.totalAmount}。`,
          link: `/member/orders/${orderId}`,
        })

        const userResponse = await fetch('/api/notifications/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            type: 'shop',
            title: '訂單已成立',
            message: `您的訂單 ${orderId} 已成立，總金額 NT$${orderInfo.totalAmount}。`,
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
            admin_id: 6, // 超級管理員
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

        // 立即更新通知鈴鐺
        const updateEvent = new CustomEvent('updateNotifications')
        document.dispatchEvent(updateEvent)
        console.log('已觸發通知更新事件')
      } catch (adminError) {
        console.error('發送管理員通知出錯:', adminError)
      }

      setNotificationSent(true)
      console.log('通知處理完畢')
    } catch (err) {
      console.error('發送訂購完成通知時發生錯誤:', err)
    }
  }

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

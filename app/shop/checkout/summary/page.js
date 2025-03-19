'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './summary.module.css'
import { MdCheckCircle } from 'react-icons/md'

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') // 從 URL 讀取 `orderId`
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('找不到訂單編號')
      setIsLoading(false)
      return
    }

    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/shop/checkout/order/${orderId}`)
        if (!response.ok) {
          throw new Error('無法獲取訂單資料')
        }
        const data = await response.json()
        setOrderData(data)
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
    <div className={styles.container}>
      {/* 訂單成功標誌 */}
      <MdCheckCircle className={styles.successIcon} />
      <h1 className={styles.title}>訂單完成</h1>

      {/* 訂單資訊 */}
      <div className={styles.orderInfo}>
        <p>
          <strong>訂單編號：</strong>
          {orderData.orderId}
        </p>
        <p>
          <strong>總金額：</strong>${orderData.totalAmount}
        </p>
        <p>
          <strong>付款方式：</strong>
          {orderData.paymentMethod}
        </p>
        <p>
          <strong>配送方式：</strong>
          {orderData.shippingMethod}
        </p>
        <p>
          <strong>付款狀態：</strong>
          {orderData.paymentStatus}
        </p>
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
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{orderData.recipientName}</td>
              <td>{orderData.recipientPhone}</td>
              <td>{orderData.recipientEmail}</td>
              <td>{orderData.remark || '無'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 按鈕區塊 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => (window.location.href = '/orders')}
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
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './summary.module.css'
import { MdCheckCircle, MdCancel } from 'react-icons/md'

export default function SummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('order') // 從 URL 取得訂單號
  const paymentStatus = searchParams.get('status') // 取得付款狀態

  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderNo) {
      setIsLoading(false)
      return
    }

    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNo}`)
        if (!response.ok) throw new Error('無法獲取訂單資訊')

        const order = await response.json()
        setOrderData(order)
      } catch (error) {
        console.error('❌ 獲取訂單資訊失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [orderNo])

  if (isLoading) {
    return <div className={styles.container}>載入中...</div>
  }

  return (
    <div className={styles.container}>
      {paymentStatus === 'success' ? (
        <>
          <MdCheckCircle className={styles.successIcon} />
          <h1 className={styles.title}>訂單完成</h1>
        </>
      ) : (
        <>
          <MdCancel className={styles.errorIcon} />
          <h1 className={styles.title}>付款失敗</h1>
        </>
      )}

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => router.push('/orders')}
        >
          查看訂單
        </button>
        <button className={styles.button} onClick={() => router.push('/shop')}>
          繼續逛逛
        </button>
      </div>

      {orderData && (
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
          <div className={styles.summaryContainer}>
            <div className={styles.summaryRow}>
              <span>小計</span>
              <span>${orderData.totalOriginalPrice}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>優惠</span>
              <span>- ${orderData.totalDiscount}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>運費</span>
              <span>${orderData.shippingFee}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>合計</span>
              <span>${orderData.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

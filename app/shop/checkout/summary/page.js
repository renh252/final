'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import styles from './summary.module.css'
import { MdCheckCircle } from 'react-icons/md'

export default function SummaryPage({ orderData }) {
  const router = useRouter()

  return (
    <div className={styles.container}>
      {/* 訂單成功標誌 */}
      <MdCheckCircle className={styles.successIcon} />
      <h1 className={styles.title}>訂單完成</h1>

      {/* 按鈕區塊 */}
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

      {/* 收件人資訊表格 */}
      <div className={styles.tableContainer}>
        {orderData && (
          <>
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
            {/* 訂單金額明細 */}
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
          </>
        )}
      </div>
    </div>
  )
}

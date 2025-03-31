'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './summary.module.css'
import { MdCheckCircle } from 'react-icons/md'
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
  usePageTitle('結帳')

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
          <MdCheckCircle className={styles.successIcon} />
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

      {/* 訂單金額明細（從 localStorage 取得） */}
      <div className={styles.summaryContainer}>
        <div className={styles.summaryRow}>
          <span>小計</span>
          <span>${productPrice.totalOriginalPrice}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>優惠</span>
          <span>- ${productPrice.totalDiscount}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>運費</span>
          <span>${productPrice.shippingFee}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>合計</span>
          <span>${orderData.totalAmount}</span>
        </div>
      </div>
    </div>

    {/* 手機 */}
    <div className={styles.checkoutMobileContainer}>
    {/* 訂單成功標誌 */}
    <div className={styles.success}>
          <MdCheckCircle className={styles.successIcon} />
          <h1 className={styles.successTitle}>訂購完成</h1>
        </div>
     {/* 按鈕 */}
        <div className={styles.buttonGroup}>
        <button
            onClick={() => (window.location.href = '/member/orders')}
          >
            查看訂單
          </button>
          <button
            onClick={() => (window.location.href = '/shop')}
          >
            繼續逛逛
          </button>
        </div>
        {/* 資訊欄 */}
        <div className={styles.reviewContainer}>
          <h1 className={styles.title}>資訊欄</h1>

          {/* 收件人資訊 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}><MdOutlinePets /><h2>收件人資訊</h2></div>
            <div className={styles.infoBody}>
              <p><strong>姓名：</strong>{orderData.recipientName}</p>
              <p><strong>電話：</strong>{orderData?.recipientPhone}</p>
              <p><strong>電子信箱：</strong>{orderData?.recipientEmail}</p>
            </div>
          </div>

          {/* 備註 */}
          <div className={styles.infoGroup}>
            <div className={styles.infoHeader}><MdOutlinePets /><h2>備註</h2></div>
            <p className={styles.remark}>{orderData?.remark}</p>
          </div>
        </div>
        
        {/* 總計 */}
        <div className={styles.summaryContainer}>
          <div className={styles.summaryRow}><span>小計：</span><span>$ {productPrice.totalOriginalPrice}</span></div>
          <div className={styles.summaryRow}><span>優惠：</span><span>$ {productPrice.totalDiscount}</span></div>
          <div className={styles.summaryRow}><span>運費：</span><span>$ {productPrice.shippingFee}</span></div>
          <hr />
          <div className={styles.summaryTotal}><span>合計：</span><span>${productPrice.totalAmount}</span></div>
        </div>
    </div>
    </>
  )
}

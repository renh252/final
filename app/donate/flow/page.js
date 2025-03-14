'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './flow.module.css'

export default function FlowPage() {
  // 狀態變數
  const searchParams = useSearchParams()
  const [items, setItems] = useState('') // 存儲商品項目
  const [amount, setAmount] = useState('0') // 存儲捐款金額
  useEffect(() => {
    const donationType = searchParams.get('donationType') || '一般捐款' // 預設為一般捐款
    setItems(donationType)
  }, [searchParams])
  const [paymentType, setPaymentType] = useState('') // 存儲選擇的付款方式
  const [paymentData, setPaymentData] = useState(null) // 儲存 API 回傳的支付資訊
  const [isLoading, setIsLoading] = useState(false) // 控制按鈕的載入狀態

  // 監聽輸入變更
  const handleAmountChange = (e) => setAmount(e.target.value)
  const handleItemsChange = (e) => setItems(e.target.value)

  // 設定付款方式
  const selectOneTimePayment = () => setPaymentType('Credit') // 一次付清
  const selectRecurringPayment = () => setPaymentType('CreditPeriod') // 定期定額

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !items || !paymentType) {
      alert('請填寫金額、商品項目並選擇付款方式！')
      return
    }

    setIsLoading(true)

    try {
      // 建立基本的支付資料
      let paymentRequest = {
        amount: Number(amount),
        items,
        ChoosePayment: paymentType,
      }

      // 如果選擇的是定期定額，添加額外的參數
      if (paymentType === 'CreditPeriod') {
        paymentRequest = {
          ...paymentRequest,
          PeriodAmount: Number(amount), // 每次扣款金額
          PeriodType: 'M', // M=每月, Y=每年, D=每日
          Frequency: 1, // 每 1 個月扣款一次
          ExecTimes: 12, // 總共扣款 12 次
        }
      }

      // 發送 API 請求
      const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest),
      })

      const data = await response.json()

      if (data.error) {
        alert(`支付參數錯誤: ${data.error}`)
      } else {
        setPaymentData(data)
        const { action, params } = data

        // 動態建立表單
        const form = document.createElement('form')
        form.action = action
        form.method = 'POST'

        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      }
    } catch (error) {
      console.error('支付 API 錯誤:', error)
      alert('發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={styles.flow_container}>
        <h1>線上捐款</h1>
        <hr />
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.order_container}>
          <h2 className={styles.order_title}>捐款資訊</h2>
          <table className={styles.order_table}>
            <tbody>
              <tr>
                <td className={styles.order_label}>捐款項目</td>
                <td className={styles.order_value}>{items}</td>
              </tr>
              <tr>
                <td className={styles.order_label}>捐款金額</td>
                <td className={styles.order_value}>
                  <div>
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="請輸入金額"
                      required
                    />
                  </div>
                </td>
              </tr>
              <tr className={styles.order_total_row}>
                <td className={styles.order_total_label}>合計</td>
                <td className={styles.order_total_value}>$ {amount} 元</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.order_container}>
          {/* 付款方式選擇 */}
          <div>
            <h5>請選擇捐款方式</h5>

            <button
              type="button"
              className="button"
              onClick={selectOneTimePayment}
            >
              一次付清
            </button>
            <button
              type="button"
              className="button"
              onClick={selectRecurringPayment}
            >
              定期定額
            </button>
          </div>

          {/* 付款按鈕 */}
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? '處理中...' : '開始支付'}
          </button>

          {/* 支付準備提示 */}
          {paymentData && (
            <div>
              <h2>支付參數已準備好！</h2>
              <p>即將進行支付，請稍候...</p>
            </div>
          )}
        </div>
      </form>
    </>
  )
}

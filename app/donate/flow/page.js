'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './flow.module.css'
import Image from 'next/image'
import { Display } from 'react-bootstrap-icons'

export default function FlowPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState('')
  const [amount, setAmount] = useState('0')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('oneTime') // 預設選擇一次付清
  const [paymentType, setPaymentType] = useState('Credit') // 預設信用卡
  const [paymentData, setPaymentData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [petName, setPetName] = useState('')

  useEffect(() => {
    const donationType = searchParams.get('donationType') || '一般捐款'
    const pet = searchParams.get('pet') || ''
    setItems(donationType)
    setPetName(pet)
  }, [searchParams])

  const handleAmountChange = (e) => setAmount(e.target.value)

  // 切換付款模式時，自動設置對應的 paymentType
  const selectOneTimePayment = () => {
    setSelectedPaymentMode('oneTime')
    setPaymentType('Credit') // 預設信用卡
  }

  const selectRecurringPayment = () => {
    setSelectedPaymentMode('recurring')
    setPaymentType('CreditPeriod') // 定期定額僅限信用卡
  }

  // 設定付款方式
  const handlePaymentMethodClick = (method) => {
    if (selectedPaymentMode === 'oneTime') {
      setPaymentType(method) // 一次付清模式
    } else if (selectedPaymentMode === 'recurring') {
      setPaymentType('CreditPeriod') // 定期定額只能用信用卡
    }
  }

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !items || !paymentType) {
      alert('請填寫金額、商品項目並選擇付款方式！')
      return
    }

    setIsLoading(true)

    try {
      let paymentRequest = {
        amount: Number(amount),
        items,
        ChoosePayment: paymentType,
      }

      if (paymentType === 'CreditPeriod') {
        paymentRequest = {
          ...paymentRequest,
          PeriodAmount: Number(amount),
          PeriodType: 'M',
          Frequency: 1,
          ExecTimes: 12,
        }
      }

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
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="請輸入金額"
                    required
                  />
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
          <h5>請選擇捐款方式</h5>
          <div className={styles.order_payment_type}>
            <button
              type="button"
              className="button"
              onClick={selectOneTimePayment}
              style={{
                backgroundColor:
                  selectedPaymentMode === 'oneTime' ? '#cda274' : '',
              }}
            >
              <Image
                src="/images/donate/icon/card1.svg"
                alt="一次付清"
                width={50}
                height={50}
              />
              一次付清
            </button>
            <button
              type="button"
              className="button"
              onClick={selectRecurringPayment}
              style={{
                backgroundColor:
                  selectedPaymentMode === 'recurring' ? '#cda274' : '',
              }}
            >
              <Image
                src="/images/donate/icon/card2.svg"
                alt="定期定額"
                width={60}
                height={60}
              />
              定期定額
            </button>
          </div>

          <hr />
          <div className={styles.order_payment_method}>
            {selectedPaymentMode === 'recurring' ? (
              <>
                <div className={styles.payment_item}>
                  <button
                    type="button"
                    className="button"
                    onClick={() => handlePaymentMethodClick('Credit')}
                    style={{
                      backgroundColor:
                        paymentType === 'CreditPeriod' ? '#cda274' : '',
                    }}
                  >
                    信用卡
                  </button>
                  <p className={styles.note}>
                    ※定期定額僅限信用卡支付方式可使用
                  </p>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="button"
                  onClick={() => handlePaymentMethodClick('Credit')}
                  style={{
                    backgroundColor: paymentType === 'Credit' ? '#cda274' : '',
                  }}
                >
                  信用卡
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => handlePaymentMethodClick('ATM')}
                  style={{
                    backgroundColor: paymentType === 'ATM' ? '#cda274' : '',
                  }}
                >
                  ATM轉帳
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => handlePaymentMethodClick('CVS')}
                  style={{
                    backgroundColor: paymentType === 'CVS' ? '#cda274' : '',
                  }}
                >
                  超商繳款
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.order_container}>
          <h5>請填寫捐款人資料</h5>
          <div className={styles.donate_info_container}>
            <div>
              <label>姓名</label>
              <input type="text" className={styles.input} required />
            </div>
            <div>
              <label>認養寵物</label>
              <input
                type="text"
                className={styles.readOnlyInput}
                value={petName}
                readOnly
              />
            </div>
            <div>
              <label>手機號碼</label>
              <input type="text" className={styles.input} required />
            </div>
            <div>
              <label>電子郵件</label>
              <input type="email" className={styles.input} required />
            </div>
          </div>
        </div>
        <div className={styles.flow_container}>
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? '處理中...' : '開始支付'}
          </button>
        </div>

        {paymentData && (
          <div>
            <h2>支付參數已準備好！</h2>
            <p>即將進行支付，請稍候...</p>
          </div>
        )}
      </form>
    </>
  )
}

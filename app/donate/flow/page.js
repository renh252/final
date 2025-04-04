'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './flow.module.css'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'
import Alert from '@/app/_components/alert'

export default function FlowPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState('')
  const [amount, setAmount] = useState('100')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('一次性捐款') // 預設選擇一次性捐款
  const [paymentType, setPaymentType] = useState('Credit') // 預設信用卡
  const [paymentData, setPaymentData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [petName, setPetName] = useState('')
  const [petId, setPetId] = useState(null)

  // 紀錄是否帶入會員資料
  const [userInfoChecked, setUserInfoChecked] = useState(false)

  // 新增：用來存放捐款人資訊的狀態
  const [donorName, setDonorName] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [donorEmail, setDonorEmail] = useState('')

  useEffect(() => {
    const donationType = searchParams.get('donationType') || '捐給我們'
    const pet = searchParams.get('pet') || ''
    const petIdFromQuery = searchParams.get('petId') || null
    setItems(donationType)
    setPetName(pet)
    setPetId(petIdFromQuery) // 直接使用 `donate` 頁面傳來的 `petId`
  }, [searchParams])

  const validateFields = () => {
    // 驗證姓名
    if (!/^[\u4e00-\u9fa5]{2,}$/.test(donorName)) {
      Alert({
        title: '請輸入至少兩個中文字的姓名',
        icon: 'warning',
        timer: 1000,
      })
      return false
    }

    // 驗證手機號碼
    if (!/^09\d{2}[- ]?\d{3}[- ]?\d{3}$/.test(donorPhone)) {
      Alert({
        title: '請輸入有效的手機號碼',
        icon: 'warning',
        timer: 1000,
      })
      return false
    }

    // 驗證電子郵件
    if (
      !/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(donorEmail)
    ) {
      Alert({
        title: '請輸入有效的電子郵件地址',
        icon: 'warning',
        timer: 1000,
      })
      return false
    }

    return true
  }

  const handleAmountChange = (e) => setAmount(e.target.value)

  // 切換付款模式時，自動設置對應的 paymentType
  const selectOneTimePayment = () => {
    setSelectedPaymentMode('一次性捐款')
    setPaymentType('Credit') // 預設信用卡
  }

  const selectRecurringPayment = () => {
    setSelectedPaymentMode('定期定額')
    setPaymentType('CreditPeriod') // 定期定額僅限信用卡
  }

  // 設定付款方式
  const handlePaymentMethodClick = (method) => {
    if (selectedPaymentMode === '一次性捐款') {
      setPaymentType(method) // 一次性捐款模式
    } else if (selectedPaymentMode === '定期定額') {
      setPaymentType('CreditPeriod') // 定期定額只能用信用卡
    }
  }
  const { user, loading } = useAuth()

  if (loading) return <div>載入中...</div>
  if (!user) return <div>請先登入</div>

  const userId = user.id
  const userName = user.name
  const userNumber = user.number
  const userEmail = user.email

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 驗證表單
    if (!validateFields()) {
      return
    }
    if (Number(amount) < 100) {
      alert('捐款金額至少為 100 元')
      return
    }

    if (!amount || !items || !paymentType) {
      alert('請填寫金額、商品項目並選擇付款方式！')
      return
    }

    setIsLoading(true)

    try {
      let paymentRequest = {
        orderType: 'donation',
        userId,
        amount: Number(amount),
        items,
        ChoosePayment: paymentType,
        selectedPaymentMode,
        petId: petId || null,
        donorName,
        donorPhone,
        donorEmail,
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
                <td className={styles.order_value_money}>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="請輸入金額"
                    required
                  />
                  <p>(金額最低需為100元)</p>
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
                  selectedPaymentMode === '一次性捐款' ? '#cda274' : '',
              }}
            >
              <Image
                src="/images/donate/icon/card1.svg"
                alt="一次性捐款"
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
                  selectedPaymentMode === '定期定額' ? '#cda274' : '',
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
            {selectedPaymentMode === '定期定額' ? (
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
          <div className={styles.donate_info_checkbox}>
            <input
              type="checkbox"
              id="userInfo"
              checked={userInfoChecked}
              onChange={(e) => {
                const checked = e.target.checked
                setUserInfoChecked(checked)

                if (checked) {
                  // 如果勾選了帶入會員資料，則使用會員資料填充捐款人資訊
                  setDonorName(userName)
                  setDonorPhone(userNumber)
                  setDonorEmail(userEmail)
                } else {
                  // 如果取消勾選，則清空捐款人資訊
                  setDonorName('')
                  setDonorPhone('')
                  setDonorEmail('')
                }
              }}
            />
            <label htmlFor="userInfo">帶入會員資料</label>
          </div>
          <div className={styles.donate_info_container}>
            <div>
              <label>姓名</label>
              <input
                type="text"
                className={styles.input}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
            {petName ? (
              <div>
                <label>認養寵物</label>
                <input
                  type="text"
                  className={styles.readOnlyInput}
                  value={petName}
                  readOnly
                />
              </div>
            ) : (
              ''
            )}
            <div>
              <label>手機號碼</label>
              <input
                type="text"
                className={styles.input}
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
              />
            </div>
            <div>
              <label>電子郵件</label>
              <input
                type="email"
                className={styles.input}
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.flow_container}>
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? '處理中...' : '開始支付'}
          </button>
          {paymentData && (
            <div>
              <p>即將進行支付，請稍候...</p>
            </div>
          )}
        </div>
      </form>
    </>
  )
}

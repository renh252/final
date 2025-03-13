'use client'

import { useState } from 'react'

export default function FlowPage() {
  const [amount, setAmount] = useState('')
  const [items, setItems] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAmountChange = (e) => {
    setAmount(e.target.value)
  }

  const handleItemsChange = (e) => {
    setItems(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !items) {
      alert('請填寫金額和商品項目！')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          items,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`支付參數錯誤: ${data.error}`)
      } else {
        setPaymentData(data)
        // 這裡是將返回的 action 和 params 用來提交支付表單
        const { action, params } = data
        const form = document.createElement('form')
        form.action = action
        form.method = 'POST'

        // 動態創建隱藏表單欄位
        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit() // 提交表單
      }
    } catch (error) {
      console.error('支付 API 請求錯誤:', error)
      alert('發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>捐款頁面</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>金額:</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="請輸入金額"
            required
          />
        </div>

        <div>
          <label>商品項目:</label>
          <input
            type="text"
            value={items}
            onChange={handleItemsChange}
            placeholder="請輸入商品項目名稱（以逗號分隔）"
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? '處理中...' : '發起支付'}
        </button>
      </form>

      {paymentData && (
        <div>
          <h2>支付參數已準備好！</h2>
          <p>即將進行支付，請稍候...</p>
        </div>
      )}
    </div>
  )
}

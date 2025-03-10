'use client'

import { useState } from 'react'

async function getECPayPayment(amount, items) {
  const response = await fetch(`/api/ecpay?amount=${amount}&items=${items}`)
  const data = await response.json()

  if (data.success) {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = data.data.action

    Object.entries(data.data.params).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  } else {
    console.error(data.message)
    alert('發生錯誤：' + data.message)
  }
}

export default function ECPayPage() {
  const [amount, setAmount] = useState('')
  const [items, setItems] = useState('')

  return (
    <div className="container">
      <h1>綠界金流付款</h1>
      <input
        type="number"
        placeholder="輸入金額"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="商品名稱（可用逗號分隔）"
        value={items}
        onChange={(e) => setItems(e.target.value)}
      />
      <button onClick={() => getECPayPayment(amount, items)}>付款</button>
    </div>
  )
}

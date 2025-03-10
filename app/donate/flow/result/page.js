'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ECPayResult() {
  const [message, setMessage] = useState('處理中...')
  const router = useRouter()

  useEffect(() => {
    async function checkPaymentResult() {
      const response = await fetch('/api/ecpay/result', { method: 'POST' })
      const data = await response.json()
      setMessage(data.success ? '付款成功！' : '付款失敗')
    }

    checkPaymentResult()
  }, [])

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={() => router.push('/')}>回到首頁</button>
    </div>
  )
}

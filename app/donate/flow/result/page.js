'use client'

import { useEffect, useState } from 'react'

export default function PaymentResultPage() {
  const [paymentStatus, setPaymentStatus] = useState('loading')

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get('status')

      if (status) {
        setPaymentStatus(status)
      } else {
        setPaymentStatus('failed') // 如果找不到狀態參數，設為失敗
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error)
      setPaymentStatus('failed') // 如果出現錯誤，顯示失敗
    }
  }, [])

  return (
    <div>
      <h1>Payment Result</h1>
      {paymentStatus === 'loading' && <p>Loading...</p>}
      {paymentStatus === 'success' && <p>Payment Successful!</p>}
      {paymentStatus === 'failed' && <p>Payment Failed.</p>}
    </div>
  )
}

import { useEffect, useState } from 'react'

export default function EcpayCheckout() {
  const [paymentHtml, setPaymentHtml] = useState('')

  useEffect(() => {
    const fetchPaymentHtml = async () => {
      const res = await fetch('/api/ecpay')
      const data = await res.json()
      setPaymentHtml(data.html)
    }

    fetchPaymentHtml()
  }, [])

  return (
    <div>
      <h2>綠界支付測試</h2>
      <div dangerouslySetInnerHTML={{ __html: paymentHtml }} />
    </div>
  )
}

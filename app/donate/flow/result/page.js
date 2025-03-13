'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ECPayCallback() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState(null)

  useEffect(() => {
    const rtnCode = searchParams?.get('RtnCode')
    const tradeNo = searchParams?.get('TradeNo')
    const tradeAmt = searchParams?.get('TradeAmt')
    const paymentType = searchParams?.get('PaymentType')

    if (rtnCode && tradeNo) {
      // 模擬處理，這裡可以根據支付回傳狀態進行資料庫更新等操作
      if (rtnCode === '1') {
        setPaymentStatus('付款成功')
      } else {
        setPaymentStatus('付款失敗')
      }
    }
  }, [searchParams])

  return (
    <div>
      <h1>ECPay(綠界金流) - 已完成付款頁</h1>
      <p>本頁利用 Next.js 的 api 路由來協助顯示支付結果。</p>
      <Link href="/ecpay">連至ECPay(綠界金流)測試頁</Link>
      <hr />
      <p>以下為回傳資料:</p>
      <p>交易編號: {searchParams?.get('MerchantTradeNo')}</p>
      <p>交易金額: {searchParams?.get('TradeAmt')}</p>
      <p>交易日期: {searchParams?.get('TradeDate')}</p>
      <p>付款日期: {searchParams?.get('PaymentDate')}</p>
      <p>付款方式: {searchParams?.get('PaymentType')}</p>
      <p>回應碼: {searchParams?.get('RtnCode')}</p>
      <p>回應訊息: {searchParams?.get('RtnMsg')}</p>
      <hr />
      <h2>支付狀態: {paymentStatus}</h2>
    </div>
  )
}

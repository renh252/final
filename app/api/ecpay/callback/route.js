import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    // 解析 ECPay 回傳的表單資料
    const formData = await req.formData()
    const params = Object.fromEntries(formData.entries())

    console.log('🔄 ECPay 回傳交易結果:', params)

    // 檢查是否有必要的參數
    if (!params.MerchantTradeNo || !params.RtnCode || !params.CustomField1) {
      console.error('❌ 缺少必要的參數')
      return NextResponse.redirect(
        'http://localhost:3000/payment/error?status=missing_params',
        303
      )
    }

    // 檢查交易是否成功
    const isSuccess = params.RtnCode === '1'
    const orderType = params.CustomField1
    const tradeNo = params.MerchantTradeNo

    // 設定導回頁面
    let redirectUrl

    if (orderType === 'shop') {
      // 商城付款完成，導回 summary 並帶上 MerchantTradeNo
      redirectUrl = `http://localhost:3000/shop/checkout/summary?order=${tradeNo}`
    } else if (orderType === 'donation') {
      // 捐款付款完成，導回捐款結果頁面
      redirectUrl = `http://localhost:3000/donate/flow/result?status=${
        isSuccess ? 'success' : 'fail'
      }&amount=${params.TradeAmt}`
    } else {
      // 未知的交易類型，導回錯誤頁面
      console.error(`❌ 無效的交易類型: ${orderType}`)
      redirectUrl =
        'http://localhost:3000/payment/error?status=invalid_orderType'
    }

    console.log(`🔗 Redirecting to: ${redirectUrl}`)

    return NextResponse.redirect(redirectUrl, 303)
  } catch (error) {
    console.error('❌ ECPay 回調錯誤:', error)
    return NextResponse.redirect(
      'http://localhost:3000/payment/error?status=error',
      303
    )
  }
}

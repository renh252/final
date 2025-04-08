import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function POST(req) {
  try {
    // 解析 ECPay 回傳的表單資料
    const formData = await req.formData()
    const params = Object.fromEntries(formData.entries())

    console.log('🔄 ECPay 回傳交易結果:', params) // ✅ 記錄交易資訊

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
    const orderType = params.CustomField1 // 讀取交易類型
    const tradeNo = params.MerchantTradeNo
    const paymentMethod = params.PaymentType.includes('_')
      ? params.PaymentType.split('_')[0]
      : params.PaymentType

    // 模擬 notify：在 callback 中更新付款狀態
    try {
      if (orderType === 'donation') {
        await db.query(
          `UPDATE donations 
           SET transaction_status = ?, payment_method = ? 
           WHERE trade_no = ?`,
          [isSuccess ? '已付款' : '付款失敗', paymentMethod, tradeNo]
        )
      } else if (orderType === 'shop') {
        await db.query(
          `UPDATE orders 
           SET payment_status = ?, order_status = ? 
           WHERE order_id = ?`,
          [
            isSuccess ? '已付款' : '付款失敗',
            isSuccess ? '待出貨' : '待付款',
            tradeNo,
          ]
        )
      }
    } catch (err) {
      console.error('❌ 更新資料庫時發生錯誤:', err)
    }

    // 設定導回頁面
    let redirectUrl

    if (orderType === 'shop') {
      // 商城付款完成，導回 `summary` 並帶上 `MerchantTradeNo`**
      redirectUrl = `http://localhost:3000/shop/checkout/summary?order=${params.MerchantTradeNo}`
    } else if (orderType === 'donation') {
      // 捐款付款完成，導回捐款結果頁面
      redirectUrl = `http://localhost:3000/donate/flow/result?status=${
        isSuccess ? 'success' : 'fail'
      }`
    } else {
      // 未知的交易類型，導回錯誤頁面
      console.error(`❌ 無效的交易類型: ${orderType}`)
      redirectUrl =
        'http://localhost:3000/payment/error?status=invalid_orderType'
    }

    console.log(`🔗 Redirecting to: ${redirectUrl}`)
    return NextResponse.redirect(redirectUrl, 303) // 使用 303 強制轉址
  } catch (error) {
    console.error('❌ ECPay 回調錯誤:', error)
    return NextResponse.redirect(
      'http://localhost:3000/donate/flow/result?status=error',
      303
    )
  }
}

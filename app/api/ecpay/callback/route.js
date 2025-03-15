import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    // 解析 ECPay 回傳的表單資料
    const formData = await req.formData()
    const params = Object.fromEntries(formData)

    console.log('🔄 ECPay 回傳交易結果:', params) // ✅ 確保交易結果被記錄

    // 確保 `TradeNo` 存在，避免 `undefined`
    if (!params.TradeNo) {
      console.error('❌ 缺少交易編號，可能為 ECPay 回傳錯誤')
      return NextResponse.redirect(
        'http://localhost:3000/donate/flow/result?status=error&message=交易編號遺失'
      )
    }

    // 交易失敗 → 直接跳轉 `result` 頁面並附帶失敗狀態
    if (params.RtnCode !== '1') {
      console.error(`❌ 交易失敗: ${params.RtnMsg}`)
      return NextResponse.redirect(
        `http://localhost:3000/donate/flow/result?status=fail&message=${encodeURIComponent(
          params.RtnMsg
        )}`
      )
    }

    console.log(
      `✅ 交易成功！交易編號: ${params.TradeNo}, 金額: ${params.TradeAmt}, 支付方式: ${params.PaymentType}`
    )

    // 交易成功 → 讓 API 生成一個 `POST` 表單並提交給前端
    return new Response(
      `
      <html>
        <body onload="document.forms[0].submit();">
          <form action="http://localhost:3000/donate/flow/result" method="POST">
            <input type="hidden" name="status" value="success" />
            <input type="hidden" name="tradeNo" value="${params.TradeNo}" />
            <input type="hidden" name="amount" value="${params.TradeAmt}" />
            <input type="hidden" name="paymentType" value="${params.PaymentType}" />
            <input type="hidden" name="message" value="${params.RtnMsg}" />
          </form>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('❌ 處理 ECPay 回調錯誤:', error)
    return NextResponse.redirect(
      'http://localhost:3000/donate/flow/result?status=error&message=系統錯誤，請聯絡客服'
    )
  }
}

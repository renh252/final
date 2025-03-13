import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const params = Object.fromEntries(formData)

    if (params.RtnCode !== '1') {
      return NextResponse.redirect(
        ' http://localhost:3000//donate/flow/result?status=fail'
      )
    }

    // 交易成功 → 讓 API 生成一個 `POST` 表單並提交給前端
    return new Response(
      `
      <html>
        <body onload="document.forms[0].submit();">
          <form action=" http://localhost:3000//donate/flow/result" method="POST">
            <input type="hidden" name="status" value="success" />
            <input type="hidden" name="tradeNo" value="${params.TradeNo}" />
            <input type="hidden" name="amount" value="${params.TradeAmt}" />
            <input type="hidden" name="paymentType" value="${params.PaymentType}" />
          </form>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('處理 ECPay 回調錯誤:', error)
    return NextResponse.redirect(
      ' http://localhost:3000//donate/flow/result?status=error'
    )
  }
}

import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    // 解析 ECPay 回傳的表單資料
    const formData = await req.formData()
    const params = Object.fromEntries(formData)

    console.log('🔄 ECPay 回傳交易結果:', params) // ✅ 記錄交易資訊

    // **檢查交易是否成功**
    const isSuccess = params.RtnCode === '1'
    const redirectUrl = `http://localhost:3000/donate/flow/result?status=${
      isSuccess ? 'success' : 'fail'
    }`

    console.log(`🔗 Redirecting to: ${redirectUrl}`)

    return NextResponse.redirect(redirectUrl, 303) // ✅ 使用 303 強制轉址
  } catch (error) {
    console.error('❌ ECPay 回調錯誤:', error)
    return NextResponse.redirect(
      'http://localhost:3000/donate/flow/result?status=error',
      303
    )
  }
}

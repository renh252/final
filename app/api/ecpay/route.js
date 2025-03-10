import * as crypto from 'crypto'

// 將 generateCheckMacValue 函數提取到文件外部
function generateCheckMacValue(params, HashKey, HashIV) {
  let paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const raw = `HashKey=${HashKey}&${paramString}&HashIV=${HashIV}`
  const encoded = encodeURIComponent(raw).toLowerCase()
  const hashed = crypto
    .createHash('sha256')
    .update(encoded)
    .digest('hex')
    .toUpperCase()

  return hashed
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const amount = searchParams.get('amount')
  const items = searchParams.get('items')

  const parsedAmount = Number(amount) || 0

  if (!parsedAmount) {
    return new Response(
      JSON.stringify({ success: false, message: '缺少總金額' }),
      { status: 400 }
    )
  }

  const MerchantID = '3002607' // 測試用商店代號
  const HashKey = 'pwFHCqoQZGmho4w6'
  const HashIV = 'EkRm7iFT261dpevs'
  const APIURL = `https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5`

  const MerchantTradeNo = `od${Date.now()}`
  const MerchantTradeDate = new Date()
    .toLocaleString('zh-TW', { hour12: false })
    .replace(/\/| /g, (match) => (match === '/' ? '-' : '')) // 將日期中的斜線 / 替換成 -

  const ParamsBeforeCMV = {
    MerchantID,
    MerchantTradeNo,
    MerchantTradeDate,
    PaymentType: 'aio',
    EncryptType: 1,
    TotalAmount: parsedAmount,
    TradeDesc: '商店線上付款',
    ItemName: items ? items.split(',').join('#') : '線上商店購買一批',
    ReturnURL: 'https://www.ecpay.com.tw',
    OrderResultURL: 'http://localhost:3000/ecpay/result',
    ChoosePayment: 'ALL',
  }

  const CheckMacValue = generateCheckMacValue(ParamsBeforeCMV, HashKey, HashIV)

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        action: APIURL,
        params: { ...ParamsBeforeCMV, CheckMacValue },
      },
    }),
    { status: 200 }
  )
}

export async function POST(req) {
  const data = await req.json()
  const { CheckMacValue, ...params } = data

  const HashKey = 'pwFHCqoQZGmho4w6'
  const HashIV = 'EkRm7iFT261dpevs'

  if (CheckMacValue === generateCheckMacValue(params, HashKey, HashIV)) {
    return new Response(
      JSON.stringify({ success: true, message: '支付成功' }),
      { status: 200 }
    )
  } else {
    return new Response(
      JSON.stringify({ success: false, message: '支付失敗' }),
      { status: 400 }
    )
  }
}

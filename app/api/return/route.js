import ecpay_payment from 'ecpay_aio_nodejs'

// 定義 options 變數，這樣在建立 ecpay_payment 實例時可以正確使用
const { MERCHANTID, HASHKEY, HASHIV } = process.env

const options = {
  OperationMode: 'Test', // Test 或 Production
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV,
  },
  IgnorePayment: [
    // "Credit", "WebATM", "ATM", "CVS", "BARCODE", "AndroidPay"
  ],
  IsProjectContractor: false,
}

export async function POST(req) {
  const body = await req.json()
  const { CheckMacValue, ...data } = body

  // 使用已定義的 options
  const create = new ecpay_payment(options)
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data)

  console.log(
    '確認交易正確性：',
    CheckMacValue === checkValue,
    CheckMacValue,
    checkValue
  )

  // 根據驗證結果回傳正確訊息
  if (CheckMacValue === checkValue) {
    return new Response('1|OK', { status: 200 })
  } else {
    return new Response('0|CheckMacValue 錯誤', { status: 400 })
  }
}

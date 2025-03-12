import ecpay_payment from 'ecpay_aio_nodejs'

const { MERCHANTID, HASHKEY, HASHIV, HOST } = process.env

const options = {
  OperationMode: 'Test', //Test or Production
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

let TradeNo

export async function GET(req) {
  const MerchantTradeDate = new Date().toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  TradeNo = 'test' + new Date().getTime()

  let base_param = {
    MerchantTradeNo: TradeNo,
    MerchantTradeDate,
    TotalAmount: '100',
    TradeDesc: '測試交易描述',
    ItemName: '測試商品等',
    ReturnURL: `${HOST}/api/return`,
    ClientBackURL: `${HOST}/api/clientReturn`,
  }

  const create = new ecpay_payment(options)
  const html = create.payment_client.aio_check_out_all(base_param)

  return new Response(JSON.stringify({ html }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req) {
  const body = await req.json()
  const { CheckMacValue, ...data } = body
  const create = new ecpay_payment(options)
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data)

  console.log(
    '確認交易正確性：',
    CheckMacValue === checkValue,
    CheckMacValue,
    checkValue
  )

  return new Response('1|OK', { status: 200 })
}

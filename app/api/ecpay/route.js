import * as crypto from 'crypto'

export async function POST(req) {
  const { amount, items } = await req.json()

  const itemName =
    items.split(',').length > 1
      ? items.split(',').join('#')
      : '線上商店購買一批'

  if (!amount) {
    return new Response(JSON.stringify({ error: '缺少總金額' }), {
      status: 400,
    })
  }

  // ECPay 配置
  const MerchantID = '3002607'
  const HashKey = 'pwFHCqoQZGmho4w6'
  const HashIV = 'EkRm7iFT261dpevs'
  const isStage = true // 測試環境
  const TotalAmount = Number(amount) // 總金額
  const TradeDesc = '商店線上付款' // 訂單描述
  const ItemName = itemName // 商品名稱
  const ReturnURL = 'https://www.ecpay.com.tw'
  const OrderResultURL =
    ' https://f675-122-121-210-118.ngrok-free.app/donate/flow/result' // 完成支付後回來的頁面

  const stage = isStage ? '-stage' : ''
  const algorithm = 'sha256'
  const digest = 'hex'
  const APIURL = `https://payment${stage}.ecpay.com.tw//Cashier/AioCheckOut/V5`

  const MerchantTradeNo = `od${new Date().getFullYear()}${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}${new Date()
    .getDate()
    .toString()
    .padStart(2, '0')}${new Date()
    .getHours()
    .toString()
    .padStart(2, '0')}${new Date()
    .getMinutes()
    .toString()
    .padStart(2, '0')}${new Date()
    .getSeconds()
    .toString()
    .padStart(2, '0')}${new Date().getMilliseconds().toString().padStart(2)}`

  const MerchantTradeDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const ParamsBeforeCMV = {
    MerchantID,
    MerchantTradeNo,
    MerchantTradeDate: MerchantTradeDate.toString(),
    PaymentType: 'aio',
    EncryptType: 1,
    TotalAmount,
    TradeDesc,
    ItemName,
    ReturnURL,
    ChoosePayment: 'ALL',
    OrderResultURL,
  }

  function CheckMacValueGen(parameters, algorithm, digest) {
    let Step0 = Object.entries(parameters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    function DotNETURLEncode(string) {
      const list = {
        '%2D': '-',
        '%5F': '_',
        '%2E': '.',
        '%21': '!',
        '%2A': '*',
        '%28': '(',
        '%29': ')',
        '%20': '+',
      }
      Object.entries(list).forEach(([encoded, decoded]) => {
        const regex = new RegExp(encoded, 'g')
        string = string.replace(regex, decoded)
      })
      return string
    }

    const Step1 = Step0.split('&')
      .sort((a, b) => {
        const keyA = a.split('=')[0]
        const keyB = b.split('=')[0]
        return keyA.localeCompare(keyB)
      })
      .join('&')

    const Step2 = `HashKey=${HashKey}&${Step1}&HashIV=${HashIV}`
    const Step3 = DotNETURLEncode(encodeURIComponent(Step2))
    const Step4 = Step3.toLowerCase()
    const Step5 = crypto.createHash(algorithm).update(Step4).digest(digest)
    return Step5.toUpperCase()
  }

  const CheckMacValue = CheckMacValueGen(ParamsBeforeCMV, algorithm, digest)

  const AllParams = { ...ParamsBeforeCMV, CheckMacValue }

  return new Response(JSON.stringify({ action: APIURL, params: AllParams }), {
    status: 200,
  })
}

import * as crypto from 'crypto'
import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function POST(req) {
  const {
    amount,
    items,
    ChoosePayment,
    petId,
    donorName,
    donorPhone,
    donorEmail,
  } = await req.json()

  const itemName = items

  if (!amount) {
    return new Response(JSON.stringify({ error: '缺少總金額' }), {
      status: 400,
    })
  }
  if (!donorName || !donorPhone || !donorEmail) {
    return NextResponse.json(
      { error: '請填寫完整的捐款人資料' },
      { status: 400 }
    )
  }

  // ECPay 配置
  const MerchantID = '3002607'
  const HashKey = 'pwFHCqoQZGmho4w6'
  const HashIV = 'EkRm7iFT261dpevs'
  const isStage = true // 測試環境
  const TotalAmount = Number(amount) // 總金額
  const TradeDesc = '商店線上付款' // 訂單描述
  const ItemName = itemName // 商品名稱

  // 在localhost上執行
  //const ReturnURL = `http://localhost:3000/api/ecpay/notify`
  //const OrderResultURL = 'http://localhost:3000/api/ecpay/callback'

  // 使用公開網域執行(ngrok)，無法運行請切換成localhost版本
  const ReturnURL = `https://2a55-2402-7500-a5b-ee67-4d1d-b161-1fb6-b50.ngrok-free.app/api/ecpay/notify`
  const OrderResultURL =
    'https://2a55-2402-7500-a5b-ee67-4d1d-b161-1fb6-b50.ngrok-free.app/api/ecpay/callback'

  const stage = isStage ? '-stage' : ''
  const algorithm = 'sha256'
  const digest = 'hex'
  const APIURL = `https://payment${stage}.ecpay.com.tw/Cashier/AioCheckOut/V5`

  // 產生 ECPay 訂單編號
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

  const petIdValue = petId ? petId : null // 確保 NULL 值

  // 2️⃣ **存入 `donations` 表，狀態為 `pending`**
  const [result] = await db.query(
    `INSERT INTO donations (donation_type, pet_id, amount, donation_mode, payment_method, donor_name, donor_phone, donor_email, trade_no, transaction_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      items,
      petIdValue,
      amount,
      'oneTime',
      ChoosePayment,
      donorName,
      donorPhone,
      donorEmail,
      MerchantTradeNo,
      'pending',
    ]
  )

  const ecpayChoosePayment =
    ChoosePayment === 'CreditPeriod' ? 'Credit' : ChoosePayment

  let ParamsBeforeCMV = {
    MerchantID,
    MerchantTradeNo,
    MerchantTradeDate: MerchantTradeDate.toString(),
    PaymentType: 'aio',
    EncryptType: 1,
    TotalAmount,
    TradeDesc,
    ItemName,
    ReturnURL, // ✅ 確保 ECPay 正確通知 `notify.js`
    ChoosePayment: ecpayChoosePayment,
    OrderResultURL, // ✅ 確保交易完成後能正確回到前端
  }

  // 處理信用卡定期定額 (CreditPeriod)
  if (ChoosePayment === 'CreditPeriod') {
    ParamsBeforeCMV = {
      ...ParamsBeforeCMV,
      PeriodAmount: TotalAmount, // 每次扣款金額
      PeriodType: 'M', // M=每月, Y=每年, D=每日
      Frequency: 1, // 每 1 個月扣款一次
      ExecTimes: 12, // 總共扣款 12 次
    }
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

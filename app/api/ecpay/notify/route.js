import * as crypto from 'crypto'
import { NextResponse } from 'next/server'

// ECPay 商店設定
const HashKey = 'pwFHCqoQZGmho4w6'
const HashIV = 'EkRm7iFT261dpevs'

// CheckMacValueGen 函數移到 root 層級
function CheckMacValueGen(parameters) {
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
  const Step5 = crypto.createHash('sha256').update(Step4).digest('hex')

  return Step5.toUpperCase()
}

// POST 處理函數
export async function POST(req) {
  try {
    // 解析表單資料
    const formData = await req.formData()
    const data = Object.fromEntries(formData.entries())

    console.log('🔔 ECPay 回傳通知:', data)

    // 檢查必要的參數
    if (!data || !data.TradeNo || !data.CheckMacValue) {
      return NextResponse.json(
        { message: 'ERROR: Missing required parameters' },
        { status: 400 }
      )
    }

    // 複製 `data` 並移除 `CheckMacValue`
    const dataForMac = { ...data }
    delete dataForMac.CheckMacValue

    const localCheckMacValue = CheckMacValueGen(dataForMac)

    if (localCheckMacValue !== data.CheckMacValue) {
      console.error('❌ CheckMacValue 驗證失敗!')
      return NextResponse.json(
        { message: 'ERROR: CheckMacValue verification failed' },
        { status: 400 }
      )
    }

    console.log('✅ CheckMacValue 驗證成功!')

    // 這裡可以加上你的資料庫更新邏輯，例如：

    return new Response('1|OK', { status: 200 }) // ✅ 確保 ECPay 正確接收
  } catch (error) {
    console.error('❌ ECPay 通知處理錯誤:', error)
    return NextResponse.json(
      { message: 'ERROR: Server error' },
      { status: 500 }
    )
  }
}

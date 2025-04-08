import * as crypto from 'crypto'
import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

// ECPay 商店設定
const HashKey = 'pwFHCqoQZGmho4w6'
const HashIV = 'EkRm7iFT261dpevs'

// CheckMacValue 驗證函式
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
    if (!data || !data.MerchantTradeNo || !data.CheckMacValue) {
      return NextResponse.json(
        { message: 'ERROR: 缺少必要參數' },
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

    // 資料庫更新邏輯，例如：
    // ✅ 取得交易編號 & 付款狀態
    const tradeNo = data.MerchantTradeNo
    const transactionStatus = data.RtnCode === '1' ? '已付款' : '付款失敗'
    const orderStatus = data.RtnCode === '1' ? '待出貨' : '待付款'
    // ✅ 取得付款方式
    const paymentMethod = data.PaymentType.includes('_')
      ? data.PaymentType.split('_')[0]
      : data.PaymentType

    const orderType = data.CustomField1 // 讀取 orderType
    const isSuccess = data.RtnCode === '1' // 付款是否成功

    let updateResult
    // ✅ 更新資料庫的交易狀態
    if (orderType === 'shop') {
      // **商城訂單**
      updateResult = await db.query(
        `UPDATE orders 
         SET payment_status = ?
         , order_status = ?
         WHERE order_id = ?`,
        [transactionStatus, orderStatus, tradeNo]
      )
    } else if (orderType === 'donation') {
      // **捐款**
      updateResult = await db.query(
        `UPDATE donations 
         SET transaction_status = ?, payment_method = ? 
         WHERE trade_no = ?`,
        [transactionStatus, paymentMethod, tradeNo]
      )
    } else {
      console.error(`❌ 無效的訂單類型: ${orderType}`)
      return NextResponse.json(
        { message: 'ERROR: 無效的訂單類型' },
        { status: 400 }
      )
    }

    if (updateResult.affectedRows === 0) {
      console.error(`❌ 未找到對應的交易: ${tradeNo}`)
      return NextResponse.json(
        { message: 'ERROR: 交易不存在' },
        { status: 400 }
      )
    }

    console.log(
      `✅ 交易 ${tradeNo} 更新成功，狀態: ${transactionStatus}, 付款方式: ${paymentMethod}`
    )

    // 交易成功時發送通知
    if (isSuccess) {
      try {
        if (orderType === 'shop') {
          // 查詢訂單相關資訊
          const [orders] = await db.query(
            `SELECT user_id, total_price FROM orders WHERE order_id = ?`,
            [tradeNo]
          )

          if (orders && orders.length > 0) {
            const order = orders[0]
            const userId = order.user_id

            if (userId) {
              // 發送通知給訂購人
              await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_BASE_URL || ''
                }/api/notifications/add`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_id: userId,
                    type: 'shop',
                    title: '訂單付款成功',
                    message: `您的訂單 ${tradeNo} 已付款成功，總金額 NT$${order.total_price}。我們將盡快為您安排出貨。`,
                    link: `/member/orders/${tradeNo}`,
                  }),
                }
              )

              // 發送通知給管理員
              await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_BASE_URL || ''
                }/api/notifications/add`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    admin_id: 6, // 超級管理員
                    type: 'shop',
                    title: '收到新訂單',
                    message: `收到一筆新訂單 ${tradeNo}，金額 NT$${order.total_price}，請盡快處理。`,
                    link: `/admin/shop/orders/${tradeNo}`,
                  }),
                }
              )

              console.log(`✅ 已發送訂單付款通知給用戶 ${userId} 和管理員`)
            }
          }
        } else if (orderType === 'donation') {
          // 查詢捐款相關資訊
          const [donations] = await db.query(
            `SELECT user_id, amount, donation_type FROM donations WHERE trade_no = ?`,
            [tradeNo]
          )

          if (donations && donations.length > 0) {
            const donation = donations[0]
            const userId = donation.user_id

            if (userId) {
              // 發送通知給捐款人
              await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_BASE_URL || ''
                }/api/notifications/add`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_id: userId,
                    type: 'donation',
                    title: '感謝您的愛心捐款',
                    message: `您的${donation.donation_type}捐款 NT$${donation.amount} 已成功處理。感謝您的愛心，讓更多浪浪有機會找到幸福的家。`,
                    link: `/member/donations`,
                  }),
                }
              )

              // 發送通知給管理員
              await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_BASE_URL || ''
                }/api/notifications/add`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    admin_id: 6, // 超級管理員
                    type: 'donation',
                    title: '收到新的捐款',
                    message: `收到一筆${donation.donation_type}捐款 NT$${donation.amount}。`,
                    link: `/admin/finance/transactions/donations`,
                  }),
                }
              )

              console.log(`✅ 已發送捐款通知給用戶 ${userId} 和管理員`)
            }
          }
        }
      } catch (notifyError) {
        console.error('發送付款通知時發生錯誤:', notifyError)
        // 通知發送失敗不影響主要流程
      }
    }

    return new Response('1|OK', { status: 200 }) // ✅ 確保 ECPay 正確接收
  } catch (error) {
    console.error('❌ ECPay 通知處理錯誤:', error)
    return NextResponse.json(
      { message: 'ERROR: Server error' },
      { status: 500 }
    )
  }
}

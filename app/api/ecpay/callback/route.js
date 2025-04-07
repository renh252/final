import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function POST(req) {
  try {
    // 解析 ECPay 回傳的表單資料
    const formData = await req.formData()
    const params = Object.fromEntries(formData.entries())

    console.log('🔄 ECPay 回傳交易結果:', params) // ✅ 記錄交易資訊

    // **檢查是否有必要的參數**
    if (!params.MerchantTradeNo || !params.RtnCode || !params.CustomField1) {
      console.error('❌ 缺少必要的參數')
      return NextResponse.redirect(
        'http://localhost:3000/payment/error?status=missing_params',
        303
      )
    }
    // **檢查交易是否成功**
    const isSuccess = params.RtnCode === '1'
    const orderType = params.CustomField1 // 🔹 讀取交易類型
    const tradeNo = params.MerchantTradeNo
    const paymentMethod = params.PaymentType.includes('_')
      ? params.PaymentType.split('_')[0]
      : params.PaymentType

    // 模擬 notify：在 callback 中更新付款狀態
    try {
      if (orderType === 'donation') {
        await db.query(
          `UPDATE donations 
           SET transaction_status = ?, payment_method = ? 
           WHERE trade_no = ?`,
          [isSuccess ? '已付款' : '付款失敗', paymentMethod, tradeNo]
        )

        // 捐款成功時發送通知
        if (isSuccess) {
          try {
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

                // 發送通知給管理員(假設管理員ID為1)
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
                      user_id: 1, // 假設管理員ID為1
                      type: 'donation_admin',
                      title: '收到新的捐款',
                      message: `收到一筆${donation.donation_type}捐款 NT$${donation.amount}。`,
                      link: `/admin/donations`,
                    }),
                  }
                )
              }
            }
          } catch (notifyError) {
            console.error('發送捐款通知時發生錯誤:', notifyError)
          }
        }
      } else if (orderType === 'shop') {
        await db.query(
          `UPDATE orders 
           SET payment_status = ?, order_status = ? 
           WHERE order_id = ?`,
          [
            isSuccess ? '已付款' : '付款失敗',
            isSuccess ? '待出貨' : '待付款',
            tradeNo,
          ]
        )

        // 訂單付款成功時發送通知
        if (isSuccess) {
          try {
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
                      type: 'order',
                      title: '訂單付款成功',
                      message: `您的訂單 ${tradeNo} 已付款成功，總金額 NT$${order.total_price}。我們將盡快為您安排出貨。`,
                      link: `/member/orders/${tradeNo}`,
                    }),
                  }
                )

                // 發送通知給管理員(假設管理員ID為1)
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
                      user_id: 1, // 假設管理員ID為1
                      type: 'order_admin',
                      title: '收到新訂單',
                      message: `收到一筆新訂單 ${tradeNo}，金額 NT$${order.total_price}，請盡快處理。`,
                      link: `/admin/shop/orders/${tradeNo}`,
                    }),
                  }
                )
              }
            }
          } catch (notifyError) {
            console.error('發送訂單通知時發生錯誤:', notifyError)
          }
        }
      }
    } catch (err) {
      console.error('❌ 更新資料庫時發生錯誤:', err)
    }

    // 設定導回頁面
    let redirectUrl

    if (orderType === 'shop') {
      // 商城付款完成，導回 `summary` 並帶上 `MerchantTradeNo`**
      redirectUrl = `http://localhost:3000/shop/checkout/summary?order=${params.MerchantTradeNo}`
    } else if (orderType === 'donation') {
      // 捐款付款完成，導回捐款結果頁面
      redirectUrl = `http://localhost:3000/donate/flow/result?status=${
        isSuccess ? 'success' : 'fail'
      }`
    } else {
      // 未知的交易類型，導回錯誤頁面
      console.error(`❌ 無效的交易類型: ${orderType}`)
      redirectUrl =
        'http://localhost:3000/payment/error?status=invalid_orderType'
    }

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

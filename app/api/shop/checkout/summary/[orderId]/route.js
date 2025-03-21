import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(req, { params }) {
  console.log('✅ API 觸發成功')
  console.log('🔍 接收到的 orderId:', params.orderId)

  const { orderId } = params

  if (!orderId) {
    console.log('❌ 缺少訂單編號')
    return NextResponse.json({ error: '缺少訂單編號' }, { status: 400 })
  }

  try {
    const query = `
      SELECT 
        order_id AS "orderId",
        total_price AS "totalAmount",
        payment_method AS "paymentMethod",
        shipping_method AS "shippingMethod",
        payment_status AS "paymentStatus",
        recipient_name AS "recipientName",
        recipient_phone AS "recipientPhone",
        recipient_email AS "recipientEmail",
        remark
      FROM orders
      WHERE order_id = ?
    `
    console.log('🔍 SQL 查詢:', query)
    console.log('🔍 查詢參數:', orderId)

    const [rows] = await db.execute(query, [orderId])

    console.log('🔍 查詢結果:', rows)

    if (rows.length === 0) {
      console.log('❌ 找不到訂單')
      return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
    }

    return NextResponse.json(rows[0], { status: 200 })
  } catch (error) {
    console.error('❌ 取得訂單資料時發生錯誤:', error)
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        details: error.message, // 👈 新增錯誤訊息
      },
      { status: 500 }
    )
  }
}

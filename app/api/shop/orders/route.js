import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request) {
  try {
    let responseData = {}
    const { searchParams } = new URL(request.url)
    const connection = await db.getConnection()
    const user_id = searchParams.get('user_id')
    console.log('user id: ', user_id)

    if (!user_id) {
      return NextResponse.json({ error: '缺少使用者 ID' }, { status: 400 })
    }

    // 獲取訂單資料
    const [orders] = await connection.execute(
      `
      SELECT * FROM orders 
      WHERE user_id = ?
        AND EXISTS (
          SELECT 1 FROM order_items 
          WHERE order_items.order_id = orders.order_id
        )
      ORDER BY created_at DESC
      `,
      [user_id]
    )
    responseData.orders = orders

    // 計算訂單總數
    const [totalResult] = await connection.execute(
      `
      SELECT COUNT(*) as totalOrders
      FROM orders
      WHERE user_id = ? 
      AND EXISTS (
        SELECT 1 FROM order_items 
        WHERE order_items.order_id = orders.order_id
      )
    `,
      [user_id]
    )
    responseData.totalOrders = totalResult[0].totalOrders

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

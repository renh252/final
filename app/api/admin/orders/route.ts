import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../_lib/data-export'
import { executeQuery } from '../_lib/database'

// 獲取訂單列表
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 從數據庫獲取訂單列表
    const orders = await executeQuery(`
      SELECT 
        o.order_id,
        o.created_at,
        o.order_status,
        o.payment_status,
        o.total_price,
        o.user_id,
        u.user_name as recipient_name,
        u.user_email as recipient_email,
        COUNT(oi.order_item_id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `)

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('獲取訂單列表時發生錯誤:', error)
    return NextResponse.json({ error: '獲取訂單列表失敗' }, { status: 500 })
  }
}

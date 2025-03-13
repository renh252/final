import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../../_lib/data-export'
import { executeQuery } from '../../../_lib/database'

// 發送訂單通知郵件
export async function POST(
  request: NextRequest,
  { params }: { params: { oid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const orderId = params.oid

    // 獲取訂單資訊
    const order = await executeQuery(
      `SELECT 
        o.*,
        u.user_email as recipient_email,
        u.user_name as recipient_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?`,
      [orderId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // TODO: 實作發送郵件的邏輯
    // 這裡應該呼叫郵件服務發送通知郵件

    // 新增時間軸記錄
    await executeQuery(
      `INSERT INTO order_timeline (order_id, status, admin_id, note) VALUES (?, ?, ?, ?)`,
      [orderId, '通知', authResult.adminId, '發送訂單狀態更新通知郵件']
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('發送訂單通知郵件時發生錯誤:', error)
    return NextResponse.json({ error: '發送訂單通知郵件失敗' }, { status: 500 })
  }
}

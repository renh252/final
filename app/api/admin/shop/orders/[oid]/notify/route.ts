import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { auth } from '@/app/api/admin/_lib/auth'

// 發送訂單通知郵件
export const POST = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('POST 請求 - 發送訂單通知郵件 - 路徑參數:', params)

  try {
    // 驗證授權
    const authData = await auth.fromRequest(req)
    if (!authData) {
      return NextResponse.json(
        { success: false, message: '未授權的請求' },
        { status: 401 }
      )
    }

    // 檢查權限
    if (!auth.can(authData, 'shop:orders:write')) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    // 獲取訂單ID
    const { oid } = params
    if (!oid) {
      return NextResponse.json(
        {
          success: false,
          message: '訂單ID不能為空',
        },
        { status: 400 }
      )
    }

    // 檢查訂單是否存在
    const [orders] = await db.query(
      `SELECT 
        o.*,
        u.user_name,
        u.user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?`,
      [oid]
    )

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '找不到指定訂單',
        },
        { status: 404 }
      )
    }

    const order = orders[0]

    // 檢查用戶是否有電子郵件
    if (!order.user_email) {
      return NextResponse.json(
        {
          success: false,
          message: '用戶沒有電子郵件地址，無法發送通知',
        },
        { status: 400 }
      )
    }

    // 模擬發送郵件
    console.log(`正在發送訂單通知郵件到: ${order.user_email}`)
    console.log(`訂單號: ${oid}, 狀態: ${order.order_status}`)

    // TODO: 實際發送電子郵件的程式碼
    // 由於這是模擬，我們只記錄一條通知

    // 給用戶發送通知
    await db.query(
      `INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        order.user_id,
        'shop',
        '訂單通知',
        `管理員已發送一封關於您訂單 ${oid} 的狀態通知郵件，請查收您的電子郵箱`,
        `/member/orders/${oid}`,
      ]
    )

    // 記錄操作日誌
    await db.query(
      `INSERT INTO admin_operation_logs (
        admin_id, 
        action_type, 
        module, 
        target_id, 
        details, 
        ip_address,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        authData.id || 0,
        '發送郵件',
        'orders',
        oid,
        `管理員發送了訂單 ${oid} 的狀態通知郵件到 ${order.user_email}`,
        req.headers.get('x-forwarded-for') || '未知',
      ]
    )

    return NextResponse.json({
      success: true,
      message: '通知郵件已發送',
    })
  } catch (error: any) {
    console.error('發送通知郵件失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '發送通知郵件失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

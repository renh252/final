import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'
import { auth } from '@/app/api/admin/_lib/auth'

// 獲取單個訂單詳情
export const GET = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('GET 請求 - 訂單詳情 - 路徑參數:', params)

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
    if (!auth.can(authData, 'shop:orders:read')) {
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

    // 查詢訂單基本信息
    const [orders] = await db.query(
      `SELECT 
        o.*,
        u.user_name,
        u.user_email,
        u.user_number
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

    // 查詢訂單項目
    const [items] = await db.query(
      `SELECT 
        oi.*,
        p.product_name,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?`,
      [oid]
    )

    const orderData = {
      ...orders[0],
      items,
      recipient_name:
        orders[0].recipient_name || orders[0].user_name || '未知用戶',
    }

    return NextResponse.json({
      success: true,
      order: orderData,
    })
  } catch (error: any) {
    console.error('獲取訂單詳情失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '獲取訂單詳情失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// 刪除訂單
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('DELETE 請求 - 刪除訂單 - 路徑參數:', params)

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
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [
      oid,
    ])

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '找不到指定訂單',
        },
        { status: 404 }
      )
    }

    // 執行軟刪除（將訂單狀態更新為已取消）
    // 注意：此處實現軟刪除而非真正的資料刪除，以保留歷史記錄
    await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [
      '已取消',
      oid,
    ])

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
        '刪除',
        'orders',
        oid,
        `標記訂單 ${oid} 為已取消（軟刪除）`,
        req.headers.get('x-forwarded-for') || '未知',
      ]
    )

    return NextResponse.json({
      success: true,
      message: '訂單已成功刪除',
    })
  } catch (error: any) {
    console.error('刪除訂單失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '刪除訂單失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// 更新訂單狀態 (PUT)
export const PUT = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('PUT 請求 - 更新訂單狀態 - 路徑參數:', params)

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

    // 獲取請求體
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: '訂單狀態不能為空',
        },
        { status: 400 }
      )
    }

    // 檢查訂單是否存在
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [
      oid,
    ])

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '找不到指定訂單',
        },
        { status: 404 }
      )
    }

    // 更新訂單狀態
    await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [
      status,
      oid,
    ])

    // 記錄狀態變更
    await db.query(
      `INSERT INTO order_timeline (
        order_id,
        status,
        admin_id,
        note,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
      [oid, status, authData.id, `管理員將訂單狀態更新為 ${status}`]
    )

    // 給用戶發送通知
    try {
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
          orders[0].user_id,
          'shop',
          '訂單狀態更新',
          `您的訂單 ${oid} 狀態已更新為「${status}」`,
          `/member/orders/${oid}`,
        ]
      )
    } catch (notificationError) {
      console.error('發送通知失敗:', notificationError)
      // 繼續處理，不讓通知失敗影響訂單更新
    }

    return NextResponse.json({
      success: true,
      message: `訂單狀態已更新為 ${status}`,
    })
  } catch (error: any) {
    console.error('更新訂單狀態失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新訂單狀態失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// 更新出貨資訊 (PATCH)
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('PATCH 請求 - 更新出貨資訊 - 路徑參數:', params)

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

    // 獲取請求體
    const body = await req.json()
    const { carrier, tracking_number, estimated_delivery } = body

    // 檢查訂單是否存在
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [
      oid,
    ])

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '找不到指定訂單',
        },
        { status: 404 }
      )
    }

    // 檢查是否已有出貨記錄
    const [shippingRecords] = await db.query(
      'SELECT * FROM order_shipping WHERE order_id = ?',
      [oid]
    )

    // 更新或插入出貨資訊
    if (shippingRecords.length > 0) {
      await db.query(
        `UPDATE order_shipping 
        SET carrier = ?, tracking_number = ?, estimated_delivery = ?, updated_at = NOW()
        WHERE order_id = ?`,
        [carrier, tracking_number, estimated_delivery, oid]
      )
    } else {
      await db.query(
        `INSERT INTO order_shipping (
          order_id, 
          carrier, 
          tracking_number, 
          estimated_delivery,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [oid, carrier, tracking_number, estimated_delivery]
      )
    }

    // 如果訂單狀態是"待出貨"，自動更新為"已出貨"
    if (orders[0].order_status === '待出貨') {
      await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [
        '已出貨',
        oid,
      ])

      // 記錄狀態變更
      await db.query(
        `INSERT INTO order_timeline (
          order_id,
          status,
          admin_id,
          note,
          created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [
          oid,
          '已出貨',
          authData.id,
          `管理員更新了訂單出貨資訊，系統自動將訂單狀態更新為已出貨`,
        ]
      )
    }

    // 給用戶發送通知
    try {
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
          orders[0].user_id,
          'shop',
          '訂單已出貨',
          `您的訂單 ${oid} 已出貨，物流公司: ${carrier}，追蹤號碼: ${tracking_number}`,
          `/member/orders/${oid}`,
        ]
      )
    } catch (notificationError) {
      console.error('發送通知失敗:', notificationError)
      // 繼續處理，不讓通知失敗影響出貨資訊更新
    }

    return NextResponse.json({
      success: true,
      message: '出貨資訊已更新',
    })
  } catch (error: any) {
    console.error('更新出貨資訊失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新出貨資訊失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// 添加管理員留言 (POST)
export const POST = async (
  req: NextRequest,
  { params }: { params: { oid: string } }
) => {
  // 記錄請求路徑和參數，用於調試
  console.log('POST 請求 - 添加管理員留言 - 路徑參數:', params)

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

    // 獲取請求體
    const body = await req.json()
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: '留言內容不能為空',
        },
        { status: 400 }
      )
    }

    // 檢查訂單是否存在
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [
      oid,
    ])

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '找不到指定訂單',
        },
        { status: 404 }
      )
    }

    // 添加管理員留言
    await db.query(
      `INSERT INTO order_comments (
        order_id,
        admin_id,
        content,
        created_at
      ) VALUES (?, ?, ?, NOW())`,
      [oid, authData.id, content]
    )

    return NextResponse.json({
      success: true,
      message: '留言已新增',
    })
  } catch (error: any) {
    console.error('新增留言失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '新增留言失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

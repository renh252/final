import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../_lib/data-export'
import { executeQuery } from '../../_lib/database'

// 獲取訂單詳情
export async function GET(
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

    // 獲取訂單基本信息
    const order = await executeQuery(
      `SELECT 
        o.*,
        u.user_name as recipient_name,
        u.user_email as recipient_email,
        u.user_number as recipient_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?`,
      [orderId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // 獲取訂單商品
    const items = await executeQuery(
      `SELECT 
        oi.*,
        p.product_name,
        p.image_url,
        (oi.quantity * oi.price) as subtotal
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?`,
      [orderId]
    )

    // 計算訂單小計（不含運費）
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    )

    // 獲取訂單時間軸（使用 orders 表格的更新時間）
    const timeline = [
      {
        id: 1,
        status: order[0].order_status,
        created_at: order[0].created_at,
        note: '訂單建立',
      },
    ]

    if (order[0].shipped_at) {
      timeline.push({
        id: 2,
        status: '已出貨',
        created_at: order[0].shipped_at,
        note: `出貨時間：${order[0].shipped_at}`,
      })
    }

    if (order[0].finish_at) {
      timeline.push({
        id: 3,
        status: '已完成',
        created_at: order[0].finish_at,
        note: `完成時間：${order[0].finish_at}`,
      })
    }

    return NextResponse.json({
      order: {
        ...order[0],
        items,
        subtotal,
        shipping_fee: order[0].shipping_fee || 0,
        discount: 0, // 目前資料庫沒有優惠折扣欄位，預設為 0
        total_price: order[0].total_price,
      },
      timeline,
      shipping: {
        carrier: order[0].shipping_method,
        tracking_number: order[0].tracking_number,
        shipped_date: order[0].shipped_at,
        estimated_delivery: null, // 這個欄位目前不存在，可以之後再新增
      },
    })
  } catch (error) {
    console.error('獲取訂單詳情時發生錯誤:', error)
    return NextResponse.json({ error: '獲取訂單詳情失敗' }, { status: 500 })
  }
}

// 更新訂單狀態
export async function PUT(
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
    const { status } = await request.json()

    // 更新訂單狀態
    await executeQuery(
      `UPDATE orders SET 
        order_status = ?,
        shipped_at = CASE WHEN ? = '已出貨' THEN NOW() ELSE shipped_at END,
        finish_at = CASE WHEN ? = '已完成' THEN NOW() ELSE finish_at END
      WHERE order_id = ?`,
      [status, status, status, orderId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新訂單狀態時發生錯誤:', error)
    return NextResponse.json({ error: '更新訂單狀態失敗' }, { status: 500 })
  }
}

// 更新出貨資訊
export async function PATCH(
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
    const { carrier, tracking_number } = await request.json()

    // 更新出貨資訊
    await executeQuery(
      `UPDATE orders SET 
        shipping_method = ?,
        tracking_number = ?,
        shipped_at = NOW(),
        order_status = '已出貨'
      WHERE order_id = ?`,
      [carrier, tracking_number, orderId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新出貨資訊時發生錯誤:', error)
    return NextResponse.json({ error: '更新出貨資訊失敗' }, { status: 500 })
  }
}

// 新增管理員留言
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
    const { content } = await request.json()

    // 更新訂單備註
    await executeQuery(
      `UPDATE orders SET remark = CONCAT(COALESCE(remark, ''), '\n', ?) WHERE order_id = ?`,
      [content, orderId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('新增管理員留言時發生錯誤:', error)
    return NextResponse.json({ error: '新增管理員留言失敗' }, { status: 500 })
  }
}

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
      `SELECT * FROM orders WHERE order_id = ?`,
      [orderId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // 獲取訂單商品
    const orderItems = await executeQuery(
      `SELECT 
        oi.*,
        p.product_name,
        p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?`,
      [orderId]
    )

    return NextResponse.json({
      success: true,
      order: {
        ...order[0],
        items: orderItems || [],
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

    // 檢查訂單是否存在
    const order = await executeQuery(
      `SELECT * FROM orders WHERE order_id = ?`,
      [orderId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // 更新訂單狀態
    await executeQuery(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      [status, orderId]
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
    const { tracking_number } = await request.json()

    // 檢查訂單是否存在
    const order = await executeQuery(
      `SELECT * FROM orders WHERE order_id = ?`,
      [orderId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // 更新出貨資訊
    await executeQuery(
      `UPDATE orders 
       SET tracking_number = ?, 
           shipped_at = NOW() 
       WHERE order_id = ?`,
      [tracking_number, orderId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新出貨資訊時發生錯誤:', error)
    return NextResponse.json({ error: '更新出貨資訊失敗' }, { status: 500 })
  }
}

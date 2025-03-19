import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取單個訂單詳情
export const GET = guard.api(
  guard.perm('shop:orders:read')(async (req: NextRequest, { params }) => {
    try {
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
  })
)

// 刪除訂單
export const DELETE = guard.api(
  guard.perm('shop:orders:write')(async (req: NextRequest, { params }) => {
    try {
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
        'SELECT * FROM orders WHERE order_id = ?',
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
          req.auth?.id || 0,
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
  })
)

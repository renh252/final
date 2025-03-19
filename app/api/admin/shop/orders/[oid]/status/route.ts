import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 更新訂單狀態
export const PUT = guard.api(
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

      const data = await req.json()

      // 驗證狀態值
      if (
        !data.status ||
        !['待出貨', '已出貨', '已完成', '已取消'].includes(data.status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: '無效的訂單狀態',
          },
          { status: 400 }
        )
      }

      // 查詢訂單是否存在
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

      // 更新訂單狀態
      await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [
        data.status,
        oid,
      ])

      // 如果訂單被標記為已完成，同時更新付款狀態為已付款
      if (data.status === '已完成') {
        await db.query(
          'UPDATE orders SET payment_status = ? WHERE order_id = ? AND payment_status = ?',
          ['已付款', oid, '未付款']
        )
      }

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
          '更新',
          'orders',
          oid,
          `更新訂單 ${oid} 狀態為 ${data.status}`,
          req.headers.get('x-forwarded-for') || '未知',
        ]
      )

      return NextResponse.json({
        success: true,
        message: '訂單狀態更新成功',
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
  })
)

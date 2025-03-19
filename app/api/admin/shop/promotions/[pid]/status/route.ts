import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 更新折扣活動狀態
export const PUT = guard.api(
  guard.perm('shop:promotions:write')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params
      const data = await req.json()
      const { status } = data

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少折扣活動ID' },
          { status: 400 }
        )
      }

      if (!status) {
        return NextResponse.json(
          { success: false, message: '缺少狀態參數' },
          { status: 400 }
        )
      }

      // 檢查狀態是否有效
      const validStatuses = ['active', 'inactive', 'expired', 'scheduled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: '無效的狀態值' },
          { status: 400 }
        )
      }

      // 檢查折扣活動是否存在
      const [existing] = await db.query(
        'SELECT id FROM promotions WHERE id = ? AND is_deleted = 0',
        [pid]
      )

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: '找不到指定的折扣活動' },
          { status: 404 }
        )
      }

      // 更新折扣活動狀態
      await db.execute(
        `
        UPDATE promotions 
        SET status = ?, updated_at = NOW() 
        WHERE id = ?
      `,
        [status, pid]
      )

      // 記錄管理員操作
      const admin = req.auth
      await db.execute(
        `
        INSERT INTO admin_operation_log 
        (admin_id, operation_type, target_table, target_id, operation_details, ip_address, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
        [
          admin.id,
          'update',
          'promotions',
          pid,
          `更新折扣活動狀態為 ${status}`,
          req.headers.get('x-forwarded-for') || '127.0.0.1',
        ]
      )

      return NextResponse.json({
        success: true,
        message: `折扣活動狀態已更新為 ${status}`,
      })
    } catch (error) {
      console.error('更新折扣活動狀態失敗:', error)
      return NextResponse.json(
        { success: false, message: '更新折扣活動狀態失敗' },
        { status: 500 }
      )
    }
  })
)

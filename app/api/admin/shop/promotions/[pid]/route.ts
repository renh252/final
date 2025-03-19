import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取單個折扣活動詳情
export const GET = guard.api(
  guard.perm('shop:promotions:read')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少折扣活動ID' },
          { status: 400 }
        )
      }

      // 查詢折扣活動詳情
      const [promotions] = await db.query(
        `
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM order_promotion WHERE promotion_id = p.id) as used_count
        FROM 
          promotions p
        WHERE 
          p.id = ? AND p.is_deleted = 0
      `,
        [pid]
      )

      if (promotions.length === 0) {
        return NextResponse.json(
          { success: false, message: '找不到指定的折扣活動' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        promotion: promotions[0],
      })
    } catch (error) {
      console.error('獲取折扣活動詳情失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取折扣活動詳情失敗' },
        { status: 500 }
      )
    }
  })
)

// 更新折扣活動
export const PUT = guard.api(
  guard.perm('shop:promotions:write')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params
      const data = await req.json()
      const {
        name,
        description,
        type,
        value,
        min_purchase,
        max_discount,
        promotion_code_required,
        promotion_code,
        start_date,
        end_date,
        usage_limit,
        status,
        target_products,
      } = data

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少折扣活動ID' },
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

      // 如果需要折扣碼，檢查折扣碼是否與其他活動重複
      if (promotion_code_required && promotion_code) {
        const [duplicates] = await db.query(
          'SELECT id FROM promotions WHERE promotion_code = ? AND id != ? AND is_deleted = 0',
          [promotion_code, pid]
        )

        if (duplicates.length > 0) {
          return NextResponse.json(
            { success: false, message: '折扣碼已被其他活動使用' },
            { status: 400 }
          )
        }
      }

      // 更新折扣活動
      await db.execute(
        `
        UPDATE promotions SET
          name = ?,
          description = ?,
          type = ?,
          value = ?,
          min_purchase = ?,
          max_discount = ?,
          promotion_code_required = ?,
          promotion_code = ?,
          start_date = ?,
          end_date = ?,
          usage_limit = ?,
          status = ?,
          target_products = ?,
          updated_at = NOW()
        WHERE id = ?
      `,
        [
          name,
          description || '',
          type,
          value || 0,
          min_purchase || 0,
          max_discount || null,
          promotion_code_required ? 1 : 0,
          promotion_code || null,
          start_date,
          end_date,
          usage_limit || 0,
          status || 'inactive',
          target_products || null,
          pid,
        ]
      )

      // 獲取更新後的折扣活動
      const [updatedPromotion] = await db.query(
        'SELECT * FROM promotions WHERE id = ?',
        [pid]
      )

      return NextResponse.json({
        success: true,
        message: '折扣活動更新成功',
        promotion: updatedPromotion[0],
      })
    } catch (error) {
      console.error('更新折扣活動失敗:', error)
      return NextResponse.json(
        { success: false, message: '更新折扣活動失敗' },
        { status: 500 }
      )
    }
  })
)

// 刪除折扣活動（軟刪除）
export const DELETE = guard.api(
  guard.perm('shop:promotions:delete')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少折扣活動ID' },
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

      // 軟刪除折扣活動
      await db.execute(
        'UPDATE promotions SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [pid]
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
          'delete',
          'promotions',
          pid,
          '刪除折扣活動',
          req.headers.get('x-forwarded-for') || '127.0.0.1',
        ]
      )

      return NextResponse.json({
        success: true,
        message: '折扣活動已成功刪除',
      })
    } catch (error) {
      console.error('刪除折扣活動失敗:', error)
      return NextResponse.json(
        { success: false, message: '刪除折扣活動失敗' },
        { status: 500 }
      )
    }
  })
)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取折扣活動列表
export const GET = guard.api(
  guard.perm('shop:promotions:read')(async (req: NextRequest) => {
    try {
      // 查詢折扣活動資料
      const [promotions] = await db.query(`
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM order_promotion WHERE promotion_id = p.id) as used_count
        FROM 
          promotions p
        WHERE 
          p.is_deleted = 0
        ORDER BY 
          p.created_at DESC
      `)

      return NextResponse.json({
        success: true,
        promotions,
      })
    } catch (error) {
      console.error('獲取折扣活動列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取折扣活動列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 創建新折扣活動
export const POST = guard.api(
  guard.perm('shop:promotions:write')(async (req: NextRequest) => {
    try {
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

      // 驗證必填欄位
      if (!name || !type || !start_date || !end_date) {
        return NextResponse.json(
          { success: false, message: '缺少必要欄位' },
          { status: 400 }
        )
      }

      // 如果需要折扣碼，檢查折扣碼是否已存在
      if (promotion_code_required && promotion_code) {
        const [existing] = await db.query(
          'SELECT id FROM promotions WHERE promotion_code = ? AND is_deleted = 0',
          [promotion_code]
        )

        if (existing.length > 0) {
          return NextResponse.json(
            { success: false, message: '折扣碼已存在' },
            { status: 400 }
          )
        }
      }

      // 插入新折扣活動
      const [result] = await db.execute(
        `
        INSERT INTO promotions (
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
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
        ]
      )

      // 獲取新創建的折扣活動
      const [newPromotion] = await db.query(
        'SELECT * FROM promotions WHERE id = ?',
        [result.insertId]
      )

      return NextResponse.json({
        success: true,
        message: '折扣活動創建成功',
        promotion: newPromotion[0],
      })
    } catch (error) {
      console.error('創建折扣活動失敗:', error)
      return NextResponse.json(
        { success: false, message: '創建折扣活動失敗' },
        { status: 500 }
      )
    }
  })
)

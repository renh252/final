import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 定義資料庫插入結果的介面
interface QueryResult {
  insertId?: number
  affectedRows?: number
  [key: string]: any
}

// 獲取折扣活動列表
export const GET = guard.api(
  guard.perm('shop:promotions:read')(async (req: NextRequest) => {
    try {
      // 查詢折扣活動資料 - 使用實際存在的欄位
      const [promotions] = await db.query(`
        SELECT 
          promotion_id,
          promotion_name,
          promotion_description,
          start_date,
          end_date,
          discount_percentage,
          CASE 
            WHEN start_date > CURRENT_DATE() THEN 'inactive'
            WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE() THEN 'expired'
            ELSE 'active'
          END as status,
          updated_at,
          photo
        FROM 
          promotions
        WHERE 
          1=1
        ORDER BY 
          updated_at DESC
      `)

      return NextResponse.json({
        success: true,
        promotions: Array.isArray(promotions) ? promotions : [],
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
        promotion_name,
        promotion_description,
        start_date,
        end_date,
        discount_percentage,
        photo,
      } = data

      // 驗證必填欄位
      if (!promotion_name || !start_date) {
        return NextResponse.json(
          { success: false, message: '缺少必要欄位' },
          { status: 400 }
        )
      }

      // 插入新折扣活動，根據真實表格結構
      const [result] = (await db.query(
        `
        INSERT INTO promotions (
          promotion_name, 
          promotion_description, 
          start_date, 
          end_date, 
          discount_percentage,
          photo,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
        [
          promotion_name,
          promotion_description || '',
          start_date,
          end_date || null,
          discount_percentage || 0,
          photo || null,
        ]
      )) as [QueryResult, any]

      const insertId = result.insertId || 0

      // 獲取新創建的折扣活動
      const [newPromotion] = await db.query(
        `SELECT 
          promotion_id,
          promotion_name,
          promotion_description,
          start_date,
          end_date,
          discount_percentage,
          CASE 
            WHEN start_date > CURRENT_DATE() THEN 'inactive'
            WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE() THEN 'expired'
            ELSE 'active'
          END as status,
          updated_at,
          photo
        FROM promotions WHERE promotion_id = ?`,
        [insertId]
      )

      return NextResponse.json({
        success: true,
        message: '折扣活動創建成功',
        promotion:
          Array.isArray(newPromotion) && newPromotion.length > 0
            ? newPromotion[0]
            : null,
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

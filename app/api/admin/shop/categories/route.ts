import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取商品類別列表
export const GET = guard.api(
  guard.perm('shop:categories:read')(async (req: NextRequest) => {
    try {
      // 查詢所有類別資料
      const [categories] = await db.query(`
        SELECT 
          category_id as id,
          category_name as name,
          category_tag as slug,
          category_description as description,
          parent_id
        FROM 
          categories
        WHERE 
          1=1
        ORDER BY 
          parent_id IS NULL DESC, parent_id, category_name
      `)

      return NextResponse.json({
        success: true,
        categories: Array.isArray(categories) ? categories : [],
      })
    } catch (error) {
      console.error('獲取商品類別列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取商品類別列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 創建新商品類別
export const POST = guard.api(
  guard.perm('shop:categories:write')(async (req: NextRequest) => {
    try {
      const data = await req.json()
      const { name, slug, description, parent_id } = data

      // 驗證必填欄位
      if (!name || !slug) {
        return NextResponse.json(
          { success: false, message: '名稱和標籤是必填欄位' },
          { status: 400 }
        )
      }

      // 檢查slug是否已存在
      const [existing] = await db.query(
        'SELECT category_id FROM categories WHERE category_tag = ?',
        [slug]
      )

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: '類別標籤已存在' },
          { status: 400 }
        )
      }

      // 插入新類別
      const [result] = await db.query(
        `
        INSERT INTO categories (
          category_name, 
          category_tag, 
          category_description, 
          parent_id
        ) VALUES (?, ?, ?, ?)
      `,
        [name, slug, description || null, parent_id || null]
      )

      const insertId = result?.insertId || 0

      // 獲取新創建的類別
      const [newCategory] = await db.query(
        `
        SELECT 
          category_id as id,
          category_name as name,
          category_tag as slug,
          category_description as description,
          parent_id
        FROM 
          categories 
        WHERE 
          category_id = ?
      `,
        [insertId]
      )

      return NextResponse.json({
        success: true,
        message: '類別創建成功',
        category:
          Array.isArray(newCategory) && newCategory.length > 0
            ? newCategory[0]
            : null,
      })
    } catch (error) {
      console.error('創建商品類別失敗:', error)
      return NextResponse.json(
        { success: false, message: '創建商品類別失敗' },
        { status: 500 }
      )
    }
  })
)

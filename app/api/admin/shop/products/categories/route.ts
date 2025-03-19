import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取商品分類列表
export const GET = guard.api(
  guard.perm('shop:categories:read')(async (req: NextRequest) => {
    try {
      // 查詢所有分類，包含父分類信息
      const [rows] = await db.query(
        `SELECT c.*, p.category_name as parent_name
         FROM categories c
         LEFT JOIN categories p ON c.parent_id = p.category_id
         ORDER BY c.parent_id IS NULL DESC, c.category_name ASC`
      )

      return NextResponse.json({
        success: true,
        categories: rows,
      })
    } catch (error: any) {
      console.error('獲取商品分類列表失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '獲取商品分類列表失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

// 新增商品分類
export const POST = guard.api(
  guard.perm('shop:categories:write')(async (req: NextRequest) => {
    try {
      const data = await req.json()

      // 驗證必要欄位
      if (!data.category_name) {
        return NextResponse.json(
          {
            success: false,
            message: '分類名稱為必填欄位',
          },
          { status: 400 }
        )
      }

      // 插入分類記錄
      const [result] = await db.query(
        `INSERT INTO categories (
          category_name, 
          parent_id,
          category_description,
          category_tag,
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          data.category_name,
          data.parent_id || null,
          data.category_description || '',
          data.category_tag ||
            data.category_name.toLowerCase().replace(/\s+/g, '-'),
        ]
      )

      // 獲取新增的分類記錄
      const categoryId = result.insertId
      const [categories] = await db.query(
        `SELECT c.*, p.category_name as parent_name
         FROM categories c
         LEFT JOIN categories p ON c.parent_id = p.category_id
         WHERE c.category_id = ?`,
        [categoryId]
      )

      return NextResponse.json({
        success: true,
        message: '分類新增成功',
        category: categories[0],
      })
    } catch (error: any) {
      console.error('新增分類失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '新增分類失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

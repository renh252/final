import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取分類列表
export const GET = guard.api(
  guard.perm('shop:categories:read')(async (req: NextRequest) => {
    try {
      // 查詢所有分類及其商品數量
      const [categories] = await db.query(`
        SELECT 
          c.*,
          COUNT(p.product_id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.category_id = p.category_id AND p.is_deleted = 0
        GROUP BY c.category_id
        ORDER BY c.category_name ASC
      `)

      return NextResponse.json({
        success: true,
        data: categories,
      })
    } catch (error) {
      console.error('獲取分類列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取分類列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 新增分類
export const POST = guard.api(
  guard.perm('shop:categories:write')(async (req: NextRequest) => {
    try {
      const data = await req.json()
      const { category_name, category_tag, category_description, parent_id } =
        data

      // 驗證必填欄位
      if (!category_name) {
        return NextResponse.json(
          { success: false, message: '分類名稱不能為空' },
          { status: 400 }
        )
      }

      // 生成標籤
      const tag =
        category_tag || category_name.toLowerCase().replace(/\s+/g, '-')

      // 檢查標籤是否已存在
      const [existing] = await db.query(
        'SELECT * FROM categories WHERE category_tag = ?',
        [tag]
      )

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: '分類標籤已存在' },
          { status: 400 }
        )
      }

      // 如果有父分類，檢查父分類是否存在
      if (parent_id) {
        const [parent] = await db.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [parent_id]
        )

        if (parent.length === 0) {
          return NextResponse.json(
            { success: false, message: '父分類不存在' },
            { status: 400 }
          )
        }
      }

      // 新增分類
      const [result] = await db.query(
        `INSERT INTO categories 
        (category_name, category_tag, category_description, parent_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [category_name, tag, category_description || '', parent_id || null]
      )

      // 使用執行結果的insertId
      const insertId = result && 'insertId' in result ? result.insertId : 0

      // 獲取新增的分類
      const [newCategory] = await db.query(
        'SELECT * FROM categories WHERE category_id = ?',
        [insertId]
      )

      // 記錄操作日誌
      try {
        const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1')
          .split(',')[0]
          .trim()

        // @ts-ignore: req.auth 由 guard 添加
        const adminId = req.auth?.id || 0

        await db.query(
          `INSERT INTO admin_operation_logs 
          (admin_id, action_type, module, target_id, details, ip_address, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            adminId,
            '新增',
            'categories',
            insertId,
            `新增商品分類：${category_name}`,
            ip,
          ]
        )
      } catch (logError) {
        console.error('記錄操作日誌失敗:', logError)
      }

      return NextResponse.json({
        success: true,
        message: '分類新增成功',
        data: newCategory[0],
      })
    } catch (error) {
      console.error('新增分類失敗:', error)
      return NextResponse.json(
        { success: false, message: '新增分類失敗' },
        { status: 500 }
      )
    }
  })
)

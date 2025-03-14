import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/app/api/admin/_lib/db'
import { auth } from '@/app/api/admin/_lib/auth'
import { ResultSetHeader } from 'mysql2'

// 請求體驗證 schema
const categorySchema = z.object({
  category_name: z.string().min(1, '分類名稱不能為空'),
  category_tag: z.string().min(1, '分類標籤不能為空'),
  category_description: z.string().optional(),
  parent_id: z.number().nullable(),
})

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const admin = await auth.fromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '未授權的訪問' },
        { status: 401 }
      )
    }

    // 獲取所有分類及其商品數量
    const [categories, error] = await db.query(`
      SELECT 
        c.*,
        COUNT(p.product_id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id
      ORDER BY c.created_at DESC
    `)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error: any) {
    console.error('獲取分類列表失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取分類列表失敗', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const admin = await auth.fromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '未授權的訪問' },
        { status: 401 }
      )
    }

    // 驗證請求體
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // 檢查分類標籤是否已存在
    const [existingCategory, error1] = await db.query(
      'SELECT * FROM categories WHERE category_tag = ?',
      [validatedData.category_tag]
    )

    if (error1) {
      throw error1
    }

    if (existingCategory && existingCategory.length > 0) {
      return NextResponse.json(
        { success: false, message: '分類標籤已存在' },
        { status: 400 }
      )
    }

    // 如果有父分類，檢查父分類是否存在
    if (validatedData.parent_id) {
      const [parentCategory, error2] = await db.query(
        'SELECT * FROM categories WHERE category_id = ?',
        [validatedData.parent_id]
      )

      if (error2) {
        throw error2
      }

      if (!parentCategory || parentCategory.length === 0) {
        return NextResponse.json(
          { success: false, message: '父分類不存在' },
          { status: 400 }
        )
      }
    }

    // 新增分類
    const [result, error3] = await db.query(
      `INSERT INTO categories 
      (category_name, category_tag, category_description, parent_id) 
      VALUES (?, ?, ?, ?)`,
      [
        validatedData.category_name,
        validatedData.category_tag,
        validatedData.category_description || '',
        validatedData.parent_id,
      ]
    )

    if (error3) {
      throw error3
    }

    // 獲取新增的分類資料
    const insertId = (result as unknown as ResultSetHeader).insertId
    const [newCategory, error4] = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [insertId]
    )

    if (error4) {
      throw error4
    }

    return NextResponse.json({
      success: true,
      message: '分類新增成功',
      data: newCategory[0],
    })
  } catch (error: any) {
    console.error('新增分類失敗:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '資料驗證失敗', error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: '新增分類失敗', error: error.message },
      { status: 500 }
    )
  }
}

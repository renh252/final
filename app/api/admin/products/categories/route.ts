import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../_lib/data-export'
import { executeQuery } from '../../_lib/database'

// 獲取所有商品分類
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 從數據庫獲取分類列表
    const categories = await executeQuery(`
      SELECT 
        category_id,
        category_name,
        category_description,
        parent_category_id,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM products WHERE product_category = category_id) as product_count
      FROM product_categories
      ORDER BY category_name ASC
    `)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('獲取商品分類時發生錯誤:', error)
    return NextResponse.json({ error: '獲取商品分類失敗' }, { status: 500 })
  }
}

// 創建新商品分類
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const data = await request.json()

    // 驗證必要字段
    if (!data.category_name) {
      return NextResponse.json({ error: '分類名稱不能為空' }, { status: 400 })
    }

    // 檢查分類名稱是否已存在
    const existingCategory = await executeQuery(
      `SELECT * FROM product_categories WHERE category_name = ?`,
      [data.category_name]
    )

    if (existingCategory && existingCategory.length > 0) {
      return NextResponse.json({ error: '分類名稱已存在' }, { status: 400 })
    }

    // 創建新分類
    const result = await executeQuery(
      `INSERT INTO product_categories (
        category_name, 
        category_description, 
        parent_category_id
      ) VALUES (?, ?, ?)`,
      [
        data.category_name,
        data.category_description || '',
        data.parent_category_id || null,
      ]
    )

    // 獲取新創建的分類
    const categoryId = result[0].insertId
    const newCategory = await executeQuery(
      `SELECT * FROM product_categories WHERE category_id = ?`,
      [categoryId]
    )

    return NextResponse.json({
      message: '商品分類創建成功',
      category: newCategory[0],
    })
  } catch (error) {
    console.error('創建商品分類時發生錯誤:', error)
    return NextResponse.json({ error: '創建商品分類失敗' }, { status: 500 })
  }
}

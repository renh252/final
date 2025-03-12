import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../_lib/data-export'
import { executeQuery } from '../_lib/database'

// 獲取所有商品
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 從數據庫獲取商品列表
    const products = await executeQuery(`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        p.product_description,
        p.product_image,
        p.product_stock,
        p.product_status,
        p.product_category,
        p.created_at,
        p.updated_at,
        c.category_name
      FROM products p
      LEFT JOIN product_categories c ON p.product_category = c.category_id
      ORDER BY p.product_id DESC
    `)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('獲取商品列表時發生錯誤:', error)
    return NextResponse.json({ error: '獲取商品列表失敗' }, { status: 500 })
  }
}

// 添加新商品
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 獲取請求數據
    const data = await request.json()

    // 驗證必填字段
    const requiredFields = ['product_name', 'product_price', 'product_category']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 插入商品數據
    const result = await executeQuery<{ insertId: number }>(
      `
      INSERT INTO products (
        product_name, 
        product_price, 
        product_description, 
        product_image, 
        product_stock, 
        product_status, 
        product_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.product_name,
        data.product_price,
        data.product_description || '',
        data.product_image || '',
        data.product_stock || 0,
        data.product_status || 'active',
        data.product_category,
      ]
    )

    // 獲取新插入的商品 ID
    const productId = result[0].insertId

    // 如果有商品變體，插入變體數據
    if (
      data.variants &&
      Array.isArray(data.variants) &&
      data.variants.length > 0
    ) {
      for (const variant of data.variants) {
        await executeQuery(
          `INSERT INTO product_variants (
            product_id, 
            variant_name, 
            variant_price, 
            variant_stock
          ) VALUES (?, ?, ?, ?)`,
          [
            productId,
            variant.variant_name,
            variant.variant_price,
            variant.variant_stock || 0,
          ]
        )
      }
    }

    // 獲取新插入的商品詳情
    const product = await executeQuery(
      `SELECT * FROM products WHERE product_id = ?`,
      [productId]
    )

    return NextResponse.json({
      message: '商品添加成功',
      product: product[0],
    })
  } catch (error) {
    console.error('添加商品時發生錯誤:', error)
    return NextResponse.json({ error: '添加商品失敗' }, { status: 500 })
  }
}

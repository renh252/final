import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../_lib/data-export'
import { executeQuery } from '../../_lib/database'

// 獲取單個商品詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { pid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const productId = params.pid

    // 獲取商品基本信息
    const product = await executeQuery(
      `SELECT 
        p.product_id,
        p.product_name,
        p.price,
        p.product_description,
        p.image_url as main_image,
        p.stock_quantity as stock,
        p.product_status,
        p.category_id,
        p.created_at,
        p.updated_at,
        p.is_deleted,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ?`,
      [productId]
    )

    if (!product || product.length === 0) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 })
    }

    // 處理響應數據，轉換狀態值
    const processedProduct = {
      ...product[0],
      product_status:
        product[0].product_status === '上架'
          ? 'active'
          : product[0].product_status === '下架'
          ? 'inactive'
          : product[0].product_status,
    }

    // 獲取商品變體
    const variants = await executeQuery(
      `SELECT * FROM product_variants WHERE product_id = ?`,
      [productId]
    )

    // 獲取商品圖片
    const images = await executeQuery(
      `SELECT * FROM product_img WHERE product_id = ?`,
      [productId]
    )

    // 獲取商品評論
    const reviews = await executeQuery(
      `SELECT 
        r.review_id,
        r.user_id,
        u.user_name,
        r.rating,
        r.review_text as comment,
        r.created_at
      FROM product_reviews r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC`,
      [productId]
    )

    return NextResponse.json({
      product: {
        ...processedProduct,
        variants,
        images,
        reviews,
      },
    })
  } catch (error) {
    console.error('獲取商品詳情時發生錯誤:', error)
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 })
  }
}

// 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: { pid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const productId = params.pid
    const data = await request.json()

    // 檢查商品是否存在
    const existingProduct = await executeQuery(
      `SELECT * FROM products WHERE product_id = ?`,
      [productId]
    )

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 })
    }

    // 轉換狀態值
    const productStatus =
      data.product_status === 'active'
        ? '上架'
        : data.product_status === 'inactive'
        ? '下架'
        : data.product_status

    // 更新商品基本信息
    await executeQuery(
      `UPDATE products SET
        product_name = ?,
        price = ?,
        product_description = ?,
        image_url = ?,
        stock_quantity = ?,
        product_status = ?,
        category_id = ?,
        updated_at = NOW()
      WHERE product_id = ?`,
      [
        data.product_name,
        data.product_price,
        data.product_description,
        data.product_image,
        data.product_stock,
        productStatus,
        data.product_category,
        productId,
      ]
    )

    // 如果有變體數據，更新變體
    if (data.variants && Array.isArray(data.variants)) {
      // 先刪除現有變體
      await executeQuery(`DELETE FROM product_variants WHERE product_id = ?`, [
        productId,
      ])

      // 插入新變體
      for (const variant of data.variants) {
        await executeQuery(
          `INSERT INTO product_variants (
            product_id, 
            variant_name, 
            price, 
            stock_quantity
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

    // 獲取更新後的商品詳情
    const updatedProduct = await executeQuery(
      `SELECT * FROM products WHERE product_id = ?`,
      [productId]
    )

    // 處理響應數據，轉換狀態值
    const processedProduct = {
      ...updatedProduct[0],
      product_status:
        updatedProduct[0].product_status === '上架'
          ? 'active'
          : updatedProduct[0].product_status === '下架'
          ? 'inactive'
          : updatedProduct[0].product_status,
    }

    return NextResponse.json({
      message: '商品更新成功',
      product: processedProduct,
    })
  } catch (error) {
    console.error('更新商品時發生錯誤:', error)
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 })
  }
}

// 刪除商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const productId = params.pid

    // 檢查商品是否存在
    const existingProduct = await executeQuery(
      `SELECT * FROM products WHERE product_id = ?`,
      [productId]
    )

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 })
    }

    // 標記商品為已刪除，而不是真正刪除
    await executeQuery(
      `UPDATE products SET is_deleted = 1, updated_at = NOW() WHERE product_id = ?`,
      [productId]
    )

    return NextResponse.json({ message: '商品刪除成功' })
  } catch (error) {
    console.error('刪除商品時發生錯誤:', error)
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 })
  }
}

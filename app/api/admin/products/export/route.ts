import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, exportToCsv, exportToJson } from '../../_lib/data-export'
import { executeQuery } from '../../_lib/database'

// 導出商品數據
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 獲取導出格式，默認為 CSV
    const format = request.nextUrl.searchParams.get('format') || 'csv'

    // 獲取是否包含已刪除商品的參數
    const includeDeleted =
      request.nextUrl.searchParams.get('include_deleted') === 'true'

    // 構建 SQL 查詢，根據 include_deleted 參數決定是否包含已刪除商品
    let sql = `
      SELECT 
        p.product_id,
        p.product_name,
        p.price,
        p.product_description,
        p.image_url as main_image,
        p.stock_quantity as stock,
        p.product_status,
        c.category_name,
        p.created_at,
        p.updated_at,
        p.is_deleted
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
    `

    // 如果不包含已刪除商品，添加條件
    if (!includeDeleted) {
      sql += ` WHERE p.is_deleted = 0 `
    }

    sql += ` ORDER BY p.created_at DESC`

    // 從數據庫獲取商品列表
    const products = await executeQuery(sql)

    // 處理響應數據，轉換狀態值
    const processedProducts = products.map((product) => ({
      ...product,
      product_status:
        product.product_status === '上架'
          ? 'active'
          : product.product_status === '下架'
          ? 'inactive'
          : product.product_status,
    }))

    // 根據請求的格式導出數據
    if (format.toLowerCase() === 'json') {
      // 導出為 JSON 格式
      const jsonData = await exportToJson(processedProducts, 'products')
      return new Response(String(jsonData), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="products.json"',
        },
      })
    } else {
      // 導出為 CSV 格式
      const csvData = await exportToCsv(processedProducts, 'products')
      return new Response(String(csvData), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="products.csv"',
        },
      })
    }
  } catch (error) {
    console.error('導出商品數據時發生錯誤:', error)
    return NextResponse.json({ error: '導出商品數據失敗' }, { status: 500 })
  }
}

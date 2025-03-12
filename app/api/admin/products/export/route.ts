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
        c.category_name as product_category,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_categories c ON p.product_category = c.category_id
      ORDER BY p.created_at DESC
    `)

    // 根據請求的格式導出數據
    if (format.toLowerCase() === 'json') {
      // 導出為 JSON 格式
      const jsonData = await exportToJson(products)
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="products.json"',
        },
      })
    } else {
      // 導出為 CSV 格式
      const csvData = await exportToCsv(products)
      return new NextResponse(csvData, {
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

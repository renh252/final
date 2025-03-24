import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import adminPool from '@/app/api/admin/_lib/db'

/**
 * 獲取促銷活動關聯的商品和類別
 * GET /api/admin/shop/promotions/[pid]/products
 */
export async function GET(
  req: NextRequest,
  { params }: { params?: { pid?: string } }
) {
  try {
    // 從URL解析pid，確保始終能獲取pid值
    let pid: string | null = null

    // 嘗試從params獲取pid
    if (params && params.pid) {
      pid = params.pid
    }
    // 如果params不可用，嘗試從URL解析
    else {
      const urlParts = req.url.split('/')
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i] === 'promotions' && i + 1 < urlParts.length) {
          // 格式：/promotions/123/products
          const potentialPid = urlParts[i + 1].split('?')[0] // 移除查詢參數
          if (/^\d+$/.test(potentialPid)) {
            pid = potentialPid
            break
          }
        }
      }
    }

    console.log('獲取促銷活動商品 - 參數檢查:', {
      params: params,
      url: req.url,
      pid: pid,
    })

    // 確保params存在且有效
    if (!pid || isNaN(Number(pid))) {
      return NextResponse.json(
        { success: false, message: '無效的促銷活動ID' },
        { status: 400 }
      )
    }

    const promotionId = Number(pid)

    // 查詢促銷活動是否存在
    const [promotionCheck] = await db.query<any[]>(
      'SELECT promotion_id FROM promotions WHERE promotion_id = ?',
      [promotionId]
    )

    if (!promotionCheck || promotionCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '找不到指定的促銷活動' },
        { status: 404 }
      )
    }

    // 獲取已關聯的產品
    const [relatedProducts] = await db.query<any[]>(
      `SELECT 
        pp.promotion_product_id,
        pp.promotion_id,
        pp.product_id,
        pp.category_id,
        p.product_name,
        c.category_name
      FROM 
        promotion_products pp
      LEFT JOIN
        products p ON pp.product_id = p.product_id
      LEFT JOIN
        categories c ON pp.category_id = c.category_id
      WHERE 
        pp.promotion_id = ?`,
      [promotionId]
    )

    // 處理查詢結果，提取產品和類別
    const products = relatedProducts
      ? relatedProducts
          .filter((p) => p.product_id !== null)
          .map((p) => ({
            promotion_product_id: p.promotion_product_id,
            promotion_id: p.promotion_id,
            product_id: p.product_id,
            product_name: p.product_name,
          }))
      : []

    const categories = relatedProducts
      ? relatedProducts
          .filter((c) => c.category_id !== null)
          .map((c) => ({
            promotion_product_id: c.promotion_product_id,
            promotion_id: c.promotion_id,
            category_id: c.category_id,
            category_name: c.category_name,
          }))
      : []

    // 另外獲取所有可用的類別，供選擇使用
    const [allCategories] = await db.query<any[]>(
      `SELECT 
        category_id, 
        category_name, 
        parent_id
      FROM 
        categories
      ORDER BY 
        parent_id IS NULL DESC, 
        category_name ASC`
    )

    // 另外獲取熱門商品，供選擇使用
    const [popularProducts] = await db.query<any[]>(
      `SELECT 
        p.product_id, 
        p.product_name,
        p.price,
        c.category_name
      FROM 
        products p
      LEFT JOIN
        categories c ON p.category_id = c.category_id
      WHERE
        p.status = 'active'
      ORDER BY
        p.created_at DESC
      LIMIT 20`
    )

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        allCategories: allCategories || [],
        popularProducts: popularProducts || [],
        totalRelated: products.length + categories.length,
      },
      message: '成功獲取促銷活動相關產品',
    })
  } catch (error) {
    console.error('獲取促銷活動關聯商品失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '獲取促銷活動關聯商品失敗',
        error: String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * 更新促銷活動關聯的商品和類別
 * POST /api/admin/shop/promotions/[pid]/products
 */
export async function POST(
  req: NextRequest,
  { params }: { params?: { pid?: string } }
) {
  try {
    // 從URL解析pid，確保始終能獲取pid值
    let pid: string | null = null

    // 嘗試從params獲取pid
    if (params && params.pid) {
      pid = params.pid
    }
    // 如果params不可用，嘗試從URL解析
    else {
      const urlParts = req.url.split('/')
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i] === 'promotions' && i + 1 < urlParts.length) {
          // 格式：/promotions/123/products
          const potentialPid = urlParts[i + 1].split('?')[0] // 移除查詢參數
          if (/^\d+$/.test(potentialPid)) {
            pid = potentialPid
            break
          }
        }
      }
    }

    console.log('更新促銷活動商品 - 參數檢查:', {
      params: params,
      url: req.url,
      pid: pid,
    })

    // 確保pid存在且有效
    if (!pid || isNaN(Number(pid))) {
      return NextResponse.json(
        { success: false, message: '無效的促銷活動ID' },
        { status: 400 }
      )
    }

    const promotionId = Number(pid)
    const data = await req.json()

    // 驗證請求數據
    if (
      !data ||
      (!data.products && !data.categories && !data.productRelations)
    ) {
      return NextResponse.json(
        { success: false, message: '請求數據格式不正確' },
        { status: 400 }
      )
    }

    // 處理新格式和舊格式的兼容
    let productRelations: any[] = data.productRelations || []

    // 如果沒有使用productRelations，而是使用舊格式的products陣列
    if (data.products && Array.isArray(data.products)) {
      productRelations = data.products
    }

    // 檢查促銷活動是否存在
    const [promotionCheck] = await db.query<any[]>(
      'SELECT promotion_id FROM promotions WHERE promotion_id = ?',
      [promotionId]
    )

    if (!promotionCheck || promotionCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '找不到指定的促銷活動' },
        { status: 404 }
      )
    }

    // 使用事務來確保數據一致性
    try {
      // 開始事務
      await db.exec('START TRANSACTION')

      // 1. 刪除現有關聯
      await db.exec('DELETE FROM promotion_products WHERE promotion_id = ?', [
        promotionId,
      ])

      // 2. 如果有新的關聯，插入它們
      if (productRelations.length > 0) {
        const placeholders = productRelations
          .map(() => '(?, ?, ?, ?)')
          .join(', ')
        const values: any[] = productRelations.flatMap((item: any) => [
          promotionId,
          item.product_id || null,
          null, // variant_id 目前不使用
          item.category_id || null,
        ])

        await db.exec(
          `INSERT INTO promotion_products 
           (promotion_id, product_id, variant_id, category_id) 
           VALUES ${placeholders}`,
          values
        )
      }

      // 提交事務
      await db.exec('COMMIT')

      return NextResponse.json({
        success: true,
        message: '促銷活動關聯商品更新成功',
      })
    } catch (error) {
      // 發生錯誤，回滾事務
      await db.exec('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('更新促銷活動關聯商品失敗:', error)

    return NextResponse.json(
      {
        success: false,
        message: '更新促銷活動關聯商品失敗',
        error: String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * 搜尋可以關聯的商品或類別
 * PATCH /api/admin/shop/promotions/[pid]/products?type=product&query=關鍵字
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params?: { pid?: string } }
) {
  try {
    // 從URL解析pid，確保始終能獲取pid值
    let pid: string | null = null

    // 嘗試從params獲取pid
    if (params && params.pid) {
      pid = params.pid
    }
    // 如果params不可用，嘗試從URL解析
    else {
      const urlParts = req.url.split('/')
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i] === 'promotions' && i + 1 < urlParts.length) {
          // 格式：/promotions/123/products
          const potentialPid = urlParts[i + 1].split('?')[0] // 移除查詢參數
          if (/^\d+$/.test(potentialPid)) {
            pid = potentialPid
            break
          }
        }
      }
    }

    console.log('搜尋促銷活動商品 - 參數檢查:', {
      params: params,
      url: req.url,
      pid: pid,
    })

    // 確保params存在且有效
    if (!pid || isNaN(Number(pid))) {
      return NextResponse.json(
        { success: false, message: '無效的促銷活動ID' },
        { status: 400 }
      )
    }

    const searchType = req.nextUrl.searchParams.get('type') || 'product'
    const searchQuery = req.nextUrl.searchParams.get('query') || ''

    const promotionId = Number(pid)
    let results: any[] = []

    // 基於類型搜尋不同的表
    if (searchType === 'product') {
      // 搜尋商品
      const [products] = await db.query<any[]>(
        `SELECT 
          p.product_id, 
          p.product_name, 
          p.price, 
          c.category_name 
        FROM 
          products p
        LEFT JOIN 
          categories c ON p.category_id = c.category_id
        WHERE 
          (p.product_name LIKE ? OR p.product_code LIKE ?)
          AND p.status = 'active'
        LIMIT 20`,
        [`%${searchQuery}%`, `%${searchQuery}%`]
      )

      results = products || []
    } else if (searchType === 'category') {
      // 搜尋類別
      const [categories] = await db.query<any[]>(
        `SELECT 
          c.category_id, 
          c.category_name, 
          c.parent_id,
          p.category_name as parent_name
        FROM 
          categories c
        LEFT JOIN 
          categories p ON c.parent_id = p.category_id
        WHERE 
          c.category_name LIKE ?
        LIMIT 20`,
        [`%${searchQuery}%`]
      )

      results = categories || []
    }

    return NextResponse.json({
      success: true,
      data: results,
      type: searchType,
      query: searchQuery,
    })
  } catch (error) {
    console.error('搜尋關聯項目失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '搜尋關聯項目失敗',
        error: String(error),
      },
      { status: 500 }
    )
  }
}

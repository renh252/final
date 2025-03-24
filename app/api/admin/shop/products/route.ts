import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface ProductResponse {
  success: boolean
  products?: Product[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message?: string
  product_id?: number
}

interface CountResult extends RowDataPacket {
  total: number
}

interface Product extends RowDataPacket {
  product_id: number
  product_name: string
  price: number
  product_description: string
  category_id: number
  stock_quantity: number
  product_status: string
  image_url: string
  created_at: Date
  updated_at: Date
  category_name: string
  variants_count: number
}

// 獲取商品列表
export const GET = guard.api(
  guard.perm('shop:products:read')(async (req: NextRequest) => {
    try {
      // 獲取查詢參數
      const url = new URL(req.url)
      const search = url.searchParams.get('search') || ''
      const category = url.searchParams.get('category') || ''
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = (page - 1) * limit

      // 構建查詢條件
      const whereConditions = ['p.is_deleted = 0']
      const queryParams: any[] = []

      if (search) {
        whereConditions.push('(p.product_name LIKE ? OR p.description LIKE ?)')
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (category) {
        whereConditions.push('p.category_id = ?')
        queryParams.push(category)
      }

      // 計算總數
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM products p
        WHERE ${whereConditions.join(' AND ')}
      `
      const [countResult] = await db.query<CountResult[]>(
        countQuery,
        queryParams
      )
      const total = countResult[0]?.total || 0

      // 查詢商品列表
      const productsQuery = `
        SELECT 
          p.product_id as id,
          p.product_name as name,
          p.description,
          p.price,
          p.stock,
          p.category_id,
          c.category_name as category_name,
          p.status,
          p.thumbnail,
          p.created_at,
          p.updated_at,
          (SELECT COUNT(*) FROM product_variants WHERE product_id = p.product_id) as variant_count
        FROM 
          products p
        LEFT JOIN
          categories c ON p.category_id = c.category_id
        WHERE 
          ${whereConditions.join(' AND ')}
        ORDER BY 
          p.created_at DESC
        LIMIT ? OFFSET ?
      `

      const [products] = await db.query(productsQuery, [
        ...queryParams,
        limit,
        offset,
      ])

      // 構建響應
      return NextResponse.json({
        success: true,
        products: Array.isArray(products) ? products : [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('獲取商品列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取商品列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 創建新商品
export const POST = guard.api(
  guard.perm(PERMISSIONS.SHOP.PRODUCTS.WRITE)(async (req: NextRequest) => {
    try {
      const body = await req.json()

      // 驗證必填欄位
      const requiredFields = ['product_name', 'price', 'category_id']
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            {
              success: false,
              message: `缺少必填欄位: ${field}`,
            },
            { status: 400 }
          )
        }
      }

      // 插入商品數據
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO products (
          product_name,
          price,
          product_description,
          category_id,
          stock_quantity,
          product_status,
          image_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          body.product_name,
          body.price,
          body.product_description || '',
          body.category_id,
          body.stock_quantity || 0,
          body.product_status || '下架',
          body.image_url || '',
        ]
      )

      return NextResponse.json({
        success: true,
        message: '商品創建成功',
        product_id: result.insertId,
      })
    } catch (error) {
      console.error('創建商品失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '創建商品失敗',
        },
        { status: 500 }
      )
    }
  })
)

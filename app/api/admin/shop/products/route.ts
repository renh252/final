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
  guard.perm(PERMISSIONS.SHOP.PRODUCTS.READ)(async (req: NextRequest) => {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    const category = url.searchParams.get('category') || ''

    try {
      let whereClause = 'WHERE 1=1'
      const params: any[] = []

      if (search) {
        whereClause +=
          ' AND (p.product_name LIKE ? OR p.product_description LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }

      if (category) {
        whereClause += ' AND p.category_id = ?'
        params.push(category)
      }

      // 查詢商品總數
      const [countResult] = await db.query<CountResult[]>(
        `SELECT COUNT(*) as total FROM products p ${whereClause}`,
        params
      )
      const total = countResult[0].total

      // 查詢商品列表
      const [products] = await db.query<Product[]>(
        `SELECT 
          p.*, 
          c.category_name,
          COUNT(pv.variant_id) as variants_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN product_variants pv ON p.product_id = pv.product_id
        ${whereClause}
        GROUP BY p.product_id
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )

      const response: ProductResponse = {
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }

      return NextResponse.json(response)
    } catch (error) {
      console.error('獲取商品列表失敗:', error)
      const response: ProductResponse = {
        success: false,
        message: '獲取商品列表失敗',
      }
      return NextResponse.json(response, { status: 500 })
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

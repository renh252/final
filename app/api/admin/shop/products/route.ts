import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取商品列表
export const GET = guard.api(
  guard.perm('shop:products:read')(async (req: NextRequest) => {
    try {
      // 查詢所有商品和對應的分類信息
      const [rows] = await db.query(
        `SELECT p.*, c.category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.is_deleted = 0
         ORDER BY p.product_id DESC`
      )

      return NextResponse.json({
        success: true,
        products: rows,
      })
    } catch (error: any) {
      console.error('獲取商品列表失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '獲取商品列表失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

// 新增商品
export const POST = guard.api(
  guard.perm('shop:products:write')(async (req: NextRequest) => {
    try {
      const data = await req.json()

      // 驗證必要欄位
      if (!data.product_name || !data.price) {
        return NextResponse.json(
          {
            success: false,
            message: '商品名稱和價格為必填欄位',
          },
          { status: 400 }
        )
      }

      // 插入商品記錄
      const [result] = await db.query(
        `INSERT INTO products (
          product_name, 
          product_description, 
          price, 
          stock_quantity, 
          category_id,
          product_status, 
          image_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.product_name,
          data.product_description || '',
          data.price,
          data.stock_quantity || 0,
          data.category_id || null,
          data.product_status || '下架',
          data.image_url || '',
        ]
      )

      // 獲取新增的商品記錄
      const productId = result.insertId
      const [products] = await db.query(
        `SELECT p.*, c.category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.product_id = ?`,
        [productId]
      )

      return NextResponse.json({
        success: true,
        message: '商品新增成功',
        product: products[0],
      })
    } catch (error: any) {
      console.error('新增商品失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '新增商品失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

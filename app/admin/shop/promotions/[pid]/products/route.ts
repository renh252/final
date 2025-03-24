import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取促銷活動關聯的商品
export const GET = guard.api(
  guard.perm('shop:promotions:read')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少促銷活動ID' },
          { status: 400 }
        )
      }

      // 查詢關聯的商品和類別
      const [relatedProducts] = await db.query(
        `
        SELECT 
          pp.promotion_product_id,
          pp.promotion_id,
          pp.product_id,
          pp.variant_id,
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
          pp.promotion_id = ?
      `,
        [pid]
      )

      return NextResponse.json({
        success: true,
        products: Array.isArray(relatedProducts) ? relatedProducts : [],
      })
    } catch (error) {
      console.error('獲取促銷活動關聯商品失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取促銷活動關聯商品失敗' },
        { status: 500 }
      )
    }
  })
)

// 更新促銷活動關聯的商品
export const POST = guard.api(
  guard.perm('shop:promotions:write')(async (req: NextRequest, { params }) => {
    try {
      const { pid } = params
      const data = await req.json()

      if (!pid) {
        return NextResponse.json(
          { success: false, message: '缺少促銷活動ID' },
          { status: 400 }
        )
      }

      const { products } = data

      if (!Array.isArray(products)) {
        return NextResponse.json(
          { success: false, message: '產品數據格式不正確' },
          { status: 400 }
        )
      }

      // 開始交易
      await db.query('START TRANSACTION')

      try {
        // 刪除原有關聯
        await db.query(
          'DELETE FROM promotion_products WHERE promotion_id = ?',
          [pid]
        )

        // 如果有新的關聯，則添加
        if (products.length > 0) {
          // 為每個產品準備一個VALUES子句和參數陣列
          const placeholders = products.map(() => '(?, ?, ?, ?)').join(', ')
          const values = products.flatMap((product) => [
            product.promotion_id,
            product.product_id || null,
            product.variant_id || null,
            product.category_id || null,
          ])

          await db.query(
            `INSERT INTO promotion_products 
            (promotion_id, product_id, variant_id, category_id) 
            VALUES ${placeholders}`,
            values
          )
        }

        // 提交交易
        await db.query('COMMIT')

        return NextResponse.json({
          success: true,
          message: '促銷活動關聯商品更新成功',
        })
      } catch (error) {
        // 回滾交易
        await db.query('ROLLBACK')
        throw error
      }
    } catch (error) {
      console.error('更新促銷活動關聯商品失敗:', error)
      return NextResponse.json(
        { success: false, message: '更新促銷活動關聯商品失敗' },
        { status: 500 }
      )
    }
  })
)

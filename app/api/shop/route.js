import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let responseData = {}
    const connection = await pool.getConnection()

    // 獲取活動資料
    const [promotions] = await connection.execute(`
      SELECT * FROM promotions 
      WHERE start_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE())
      ORDER BY start_date DESC`)
    responseData.promotions = promotions

    // 獲取活動商品資料
    const [promotion_products] = await connection.execute(`
      SELECT * FROM promotion_products 
      JOIN products 
      ON promotion_products.product_id = products.product_id
      `)
    responseData.promotion_products = promotion_products

    // 獲取商品類別資料
    const [categories] = await connection.execute(`
      SELECT * FROM categories 
      ORDER BY category_name
      `)
    responseData.categories = categories

    // 獲取商品資料
// FILEPATH: c:/iSpan/final/app/api/shop/route.js

// ... existing code ...

const [products] = await connection.execute(`
  SELECT 
    p.updated_at,
    p.product_id,
    p.product_name,
    COALESCE(v.price, p.price) AS price,
    p.image_url,
    p.category_id,
    v.variant_id,
    v.variant_name,
    promo.promotion_id,
    promo.promotion_name,
    promo.discount_percentage,
    promo.start_date,
    promo.end_date
  FROM 
    products p
  INNER JOIN (
    SELECT product_id, MIN(variant_id) AS first_variant_id
    FROM product_variants
    GROUP BY product_id
  ) AS first_variant ON p.product_id = first_variant.product_id
  INNER JOIN product_variants v ON first_variant.product_id = v.product_id 
    AND first_variant.first_variant_id = v.variant_id
  LEFT JOIN (
    SELECT 
      pp.product_id,
      p.promotion_id,
      p.promotion_name,
      p.discount_percentage,
      p.start_date,
      p.end_date,
      ROW_NUMBER() OVER (PARTITION BY pp.product_id ORDER BY p.discount_percentage DESC, p.start_date DESC) as rn
    FROM 
      promotion_products pp
    JOIN 
      promotions p ON pp.promotion_id = p.promotion_id
    WHERE 
      p.start_date <= CURDATE() AND (p.end_date IS NULL OR p.end_date >= CURDATE())
  ) AS promo ON p.product_id = promo.product_id AND promo.rn = 1
  WHERE EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.product_id AND pv.stock_quantity > 0
  )
  ORDER BY p.product_id
`)
responseData.products = products


    // 獲取喜愛商品資料 - 根據用戶ID過濾
    if (userId) {
      const [product_like] = await connection.execute(
        `
        SELECT * FROM product_like WHERE user_id = ?
      `,
        [userId]
      )
      responseData.product_like = product_like
    } else {
      const [product_like] = await connection.execute(`
        SELECT * FROM product_like
      `)
      responseData.product_like = product_like
    }

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

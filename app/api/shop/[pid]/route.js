import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request, { params }) {
  try {
    const id = params.pid
    const { searchParams } = new URL(request.url)
    const connection = await pool.getConnection()
    let responseData = {}

    const [products] = await connection.execute(`
      SELECT * FROM products  WHERE product_id = ?
      `, [id])

    if (products.length === 0) {
      connection.release()
      return NextResponse.json({ error: '找不到此商品' }, { status: 404 })
    }
    responseData.product = products[0]
    
    

     // 獲取商品imgs資訊
     const [product_imgs] = await connection.execute(`
      SELECT * FROM product_img WHERE product_id = ?
    `, [id])
    
    if (product_imgs.length > 0) {
      responseData.product_imgs = product_imgs
    }

    // 獲取變體資訊
    const [variants] = await connection.execute(`
      SELECT * FROM product_variants WHERE product_id = ?
    `, [id])
    responseData.variants = variants

    // 獲取商品活動資訊
    const [promotion] = await connection.execute(`
      SELECT * FROM promotion_products
      JOIN promotions
      ON promotion_products.promotion_id = promotions.promotion_id
      WHERE product_id =? AND start_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE())`
    , [id]
    )
    responseData.promotion = promotion

    // 獲取評價
    const [reviews] = await connection.execute(`
      SELECT 
      r.review_id ,
      r.review_text,
      r.created_at,
      r.rating,
      users.user_name,
      users.profile_picture,
      product_variants.variant_name,
      products.product_name
      FROM product_reviews AS r
      JOIN users
      ON r.user_id = users.user_id
      JOIN products
      ON r.product_id = products.product_id
      JOIN product_variants
      ON r.variant_id = product_variants.variant_id
      WHERE r.product_id =?
      ORDER BY r.created_at DESC`
    , [id]
    )
    responseData.reviews = reviews

    // 獲取評價數量/分數
    const [reviewCount] = await connection.execute(`
      SELECT
      COUNT(*) AS total_reviews,
      AVG(rating) AS avg_rating
      FROM product_reviews
      WHERE product_id =?
      GROUP BY product_id
      `
    , [id])
    responseData.reviewCount = reviewCount[0]

    // 產品類別
    const [categories] = await connection.execute(`
    SELECT 
    *
    FROM 
      categories c
    JOIN 
      products p
      ON p.category_id = c.category_id
    WHERE 
      p.product_id = ?
      `, [id])
    responseData.categories = categories


    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
    
  
  }catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
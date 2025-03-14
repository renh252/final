import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request) {
  try {
    // const { searchParams } = new URL(request.url)
    // const type = searchParams.get('type') 
    let responseData = {}
    const connection = await pool.getConnection()

      // 獲取活動資料
      const [promotions]= await connection.execute(`
        SELECT * FROM promotions 
        WHERE start_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE())
        ORDER BY start_date DESC`)
      responseData.promotions = promotions

      // 獲取活動商品資料
      const [promotion_products]= await connection.execute(`
        SELECT * FROM promotion_products 
        JOIN products 
        ON promotion_products.product_id = products.product_id
        `
      )
      responseData.promotion_products = promotion_products

      // 獲取商品類別資料
      const [categories] = await connection.execute(`
        SELECT * FROM categories 
        ORDER BY category_name
        `)
      responseData.categories = categories

      const [products] = await connection.execute(`
        SELECT * FROM products
        `)
      responseData.products = products

      // 獲取喜愛商品資料
      const [product_like] = await connection.execute(`
      SELECT * FROM product_like
      `) 
      responseData.product_like = product_like
    

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
    
  
  }catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
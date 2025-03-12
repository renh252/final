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
      WHERE product_id =?`
    , [id]
    )
    responseData.promotion = promotion

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
    
  
  }catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
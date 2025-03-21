import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request, { params }) {
  try {
        const id = params.oid
        const connection = await pool.getConnection()
        let responseData = {}

        const [order] = await connection.execute(`
          SELECT * FROM orders  WHERE order_id = ?
          `, [id])
    
        if (order.length === 0) {
          connection.release()
          return NextResponse.json({ error: '找不到此商品' }, { status: 404 })
        }
        responseData.order = order[0]

        // 獲取訂單明細
        const [products] = await connection.execute(`
        SELECT 
          oi.*,
          p.product_name,
          COALESCE(pv.image_url, p.image_url) AS image,
          pv.variant_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id AND oi.product_id = pv.product_id
        WHERE oi.order_id = ?
          `, [id])
        responseData.products = products





    
    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)

  }catch (error) {
      console.error('獲取資料時發生錯誤：', error)
      return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
    }
  }
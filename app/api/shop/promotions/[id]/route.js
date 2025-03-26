// FILEPATH: c:/iSpan/final/app/api/shop/promotions/[id]/route

import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request,{ params }) {
  try {
    const id = params.id
    const connection = await pool.getConnection()
    let responseData = {}

    // 獲取商品活動資訊
    const [promotions] = await connection.execute(`
      SELECT * FROM promotions
      WHERE promotion_id = ?
    `, [id])

    if (promotions.length === 0) {
      console.log(`未找到 ID 為 ${id} 的促銷活動`)
      return NextResponse.json({ error: '未找到指定的促銷活動' }, { status: 404 })
    }

    responseData.promotion = promotions[0]
    console.log('成功獲取促銷活動:', responseData.promotion)

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
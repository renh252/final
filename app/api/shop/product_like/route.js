import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function POST(request) {
  let connection
  try {
    const body = await request.json()
    const { userId, productId, action } = body

    // 驗證必要參數
    if (!userId || !productId || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '無效的請求參數' },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    // 如果是添加收藏
    if (action === 'add') {
      // 檢查該收藏是否已存在
      const [existingLike] = await connection.execute(
        'SELECT * FROM product_like WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      )

      // 如果已經存在，返回成功
      if (existingLike && existingLike.length > 0) {
        connection.release()
        return NextResponse.json({ success: true, message: '已經收藏過此商品' })
      }

      // 插入新的收藏記錄
      await connection.execute(
        'INSERT INTO product_like (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      )

      connection.release()
      return NextResponse.json({ success: true, message: '成功添加收藏' })
    }

    // 如果是移除收藏
    if (action === 'remove') {
      // 刪除收藏記錄
      await connection.execute(
        'DELETE FROM product_like WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      )

      connection.release()
      return NextResponse.json({ success: true, message: '成功移除收藏' })
    }

    connection.release()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('處理商品收藏時發生錯誤:', error)
    if (connection) connection.release()
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

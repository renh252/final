//會員中心
import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '缺少用戶ID' }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      // 獲取會員資料
      const [userRows] = await connection.execute(`
        SELECT user_id, user_name, user_email, user_phone, user_birthday, user_address, forum_id, nickname
        FROM users
        WHERE user_id = ?
      `, [userId])

      if (userRows.length === 0) {
        return NextResponse.json({ error: '找不到該用戶' }, { status: 404 })
      }

      const user = userRows[0]

      // 獲取會員的購物車資料
      const [cartRows] = await connection.execute(`
        SELECT c.*, p.product_name, p.product_price
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ?
      `, [userId])

      // 獲取會員的寵物資料
      const [petRows] = await connection.execute(`
        SELECT *
        FROM pets
        WHERE user_id = ?
      `, [userId])

      // 獲取會員的論壇帖子
      const [forumRows] = await connection.execute(`
        SELECT *
        FROM forum_posts
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [userId])

      // 獲取會員的捐款記錄
      const [donationRows] = await connection.execute(`
        SELECT *
        FROM donations
        WHERE user_id = ?
        ORDER BY donation_date DESC
        LIMIT 5
      `, [userId])

      const responseData = {
        user,
        cart: cartRows,
        pets: petRows,
        forumPosts: forumRows,
        donations: donationRows
      }

      return NextResponse.json(responseData)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('獲取會員資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取會員資料時發生錯誤' }, { status: 500 })
  }
}

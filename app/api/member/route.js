// FILEPATH: /app/api/member/route.js

import { NextResponse } from 'next/server';
import { db,database } from '@/app/api/_lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // 會員登入
    const { email, password } = await request.json();
    console.log('Received login attempt for email:', email);

    // 驗證必要欄位
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { success: false, message: '請輸入電子郵件和密碼' },
        { status: 400 }
      );
    }

    // 查詢用戶
    const [users] = await db.execute(
      'SELECT * FROM `pet-database0317`.`users` WHERE `user_email` = ? LIMIT 1',
      [email]
    );
    console.log('Query result:', users);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.user_password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 更新最後登入時間
    await db.execute(
      'UPDATE `pet-database0317`.`users` SET `last_login` = NOW() WHERE `user_id` = ?',
      [user.user_id]
    );

    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: {
          id: user.user_id,
          name: user.user_name,
          email: user.user_email,
        },
      },
    });

  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '登入時發生錯誤，請稍後再試', 
        error: error.message
      },
      { status: 500 }
    );
  }
}


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

// FILEPATH: /app/api/member/route.js

import { NextResponse } from 'next/server';
import db from '@/app/_npmlib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
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
    console.log('Querying database for user');
    const [users] = await db.query(
      `SELECT * FROM pet-database0317.users WHERE user_email = ? LIMIT 1`,
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

    // 更新最後登入時間（如果您的表格中有這個欄位）
    // 如果沒有 last_login 欄位，可以移除這部分
    await db.query(
      `UPDATE pet-database0317.users SET last_login = NOW() WHERE user_id = ?`,
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
          // 根據您的需求添加其他用戶信息
        },
      },
    });

  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '登入時發生錯誤，請稍後再試', 
        error: error.message  // 添加這行來傳遞具體錯誤信息
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db.ts'
import jwt from 'jsonwebtoken';

console.log('JWT_SECRET:', process.env.JWT_SECRET);

export async function GET(request) {
  // ... GET 函數保持不變 ...
}

export async function POST(request) {
  console.log('Received POST request');
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

    const connection = await pool.getConnection(); // 獲取資料庫連接
    try {
      // 查詢用戶
      const [users] = await connection.execute(
        'SELECT * FROM `users` WHERE `user_email` = ? LIMIT 1',
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

      // 驗證密碼（明碼比對）
      if (password !== user.user_password) {
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
      await connection.execute(
        'UPDATE `pet_proj`.`users` SET `last_login` = NOW() WHERE `user_id` = ?',
        [user.user_id]
      );

      // 返回成功響應
      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
          },
        },
      });
    } finally {
      connection.release(); // 釋放資料庫連接
    }
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
// app/api/member/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 引入你的資料庫連接模組
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 驗證輸入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '請輸入電子郵件和密碼' },
        { status: 400 }
      );
    }

    // 查找用戶
    const [users, queryError] = await database.executeSecureQuery(
      'SELECT * FROM users WHERE user_email = ? LIMIT 1',
      [email]
    );

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 比較明碼密碼 (請在生產環境中使用 bcrypt 或 Argon2 進行雜湊)
    if (password === user.user_password) {
      // 登入成功
      const token = jwt.sign(
        { userId: user.user_id, email: user.user_email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          firebase_uid: user.firebase_uid, // 包含 firebase_uid
          user: {
            id: user.user_id,
            name: user.user_name,
            email: user.user_email,
            number: user.user_number,
            address: user.user_address,
          },
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json(
      { success: false, message: '登入時發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
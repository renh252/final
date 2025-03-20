// app/api/member/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 引入 database
import jwt from 'jsonwebtoken';

export async function POST(request) {
  //console.log(request);
  
  try {
    const { email, password } = await request.json();

    // 驗證輸入
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '請輸入電子郵件和密碼',
        },
        { status: 400 }
      );
    }

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }
    // 查找用戶
    const [users, queryError] = await database.executeSecureQuery(
      'SELECT * FROM users WHERE user_email = ? LIMIT 1',
      [email]
    );


    console.log(users);
    const user = {
      email: users[0].user_email,
      password: users[0].user_password,
      id: users[0].user_id,
      name: users[0].user_name,
    };
    
    // 直接比較明碼密碼 (不安全)

    console.log('Query result:', users); // 添加此行
    if (password === user.password) {
      // 登入成功
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('Generated token:', token); // 添加此行
      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } else {
      // 登入失敗
      return NextResponse.json(
        {
          success: false,
          message: '電子郵件或密碼錯誤',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        message: '登入時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}
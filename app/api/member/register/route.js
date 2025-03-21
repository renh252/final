// app/api/register/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. 檢查郵箱是否已被註冊
    const [existingUsers] = await database.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: '郵箱已被註冊' },
        { status: 400 }
      );
    }

    // 2. 雜湊密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 將使用者資料插入資料庫
    const [result] = await database.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    if (result && result.affectedRows > 0) {
      return NextResponse.json(
        { message: '註冊成功' },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: '註冊失敗' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('註冊錯誤:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
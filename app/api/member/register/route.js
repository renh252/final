// app/api/member/register/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    console.log('請求 body:', req.body);
    const { email, password, name, phone, birthday, address } = await req.json();

    // 檢查電子郵件是否已存在
    const [rows, error1] = await database.executeSecureQuery(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (error1) {
      console.error('查詢電子郵件錯誤:', error1);
      return NextResponse.json({ message: '資料庫查詢錯誤', error: error1.message }, { status: 500 });
    }

    if (rows && rows.length > 0) {
      return NextResponse.json({ message: '電子郵件已存在' }, { status: 400 });
    }

    // 直接儲存明碼密碼
    const [result, error2] = await database.executeSecureQuery(
      'INSERT INTO users (user_email, user_password, user_name, user_number, user_birthday, user_address) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, phone, birthday, address]
    );

    if (error2) {
      console.error('資料庫插入錯誤:', error2);
      return NextResponse.json({ message: '資料庫插入錯誤', error: error2.message }, { status: 500 });
    }

    console.log('資料庫插入結果:', result);

    return NextResponse.json({ message: '註冊成功' }, { status: 200 });
  } catch (error) {
    console.error('註冊錯誤:', error);
    return NextResponse.json({ message: '註冊失敗，請稍後重試', error: error.message }, { status: 500 });
  }
}
// app/api/member/register/final/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    const { tempToken, password, name, phone, birthday, address } = await req.json();

    if (!tempToken || !password || !name || !phone || !birthday || !address) {
      return NextResponse.json({ message: '請提供驗證 Token、密碼和所有詳細資料' }, { status: 400 });
    }

    // **正確地從 Token 中解析 email (直接 Base64 解碼)**
    try {
      const emailFromToken = Buffer.from(tempToken, 'base64').toString('utf-8');

      if (!emailFromToken) {
        return NextResponse.json({ message: '驗證 Token 無效' }, { status: 401 });
      }

      // 插入使用者資料 (直接儲存明碼密碼 - 非常不安全！)
      const [result, error2] = await database.executeSecureQuery(
        'INSERT INTO users (user_email, user_password, user_name, user_number, user_birthday, user_address) VALUES (?, ?, ?, ?, ?, ?)',
        [emailFromToken, password, name, phone, birthday, address]
      );

      if (error2) {
        console.error('資料庫插入錯誤:', error2);
        return NextResponse.json({ message: '資料庫插入錯誤', error: error2.message }, { status: 500 });
      }

      console.log('資料庫插入結果:', result);

      return NextResponse.json({ message: '註冊成功' }, { status: 201 });

    } catch (decodeError) {
      console.error('解析 Token 錯誤:', decodeError);
      return NextResponse.json({ message: '驗證 Token 無效' }, { status: 401 });
    }

  } catch (error) {
    console.error('最終註冊錯誤:', error);
    return NextResponse.json({ message: '註冊最終步驟失敗，請稍後重試', error: error.message }, { status: 500 });
  }
}
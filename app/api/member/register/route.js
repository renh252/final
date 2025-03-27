// app/api/member/register/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    const requestBody = await req.json();
    console.log('請求 body:', requestBody);
    const { email, password, name, phone, birthday, address, firebaseUid } = requestBody; // 接收 firebaseUid

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

    let userPassword = password;

    if (!password) {
      userPassword = null;
      console.log('偵測到 Google 登入，user_password 設定為 NULL');
    } else {
      console.log('使用電子郵件/密碼註冊，password 為:', password);
      // 在這裡，如果您還沒有對密碼進行雜湊處理，強烈建議您使用 bcrypt 或 Argon2 等庫進行雜湊
      // 例如：
      // const hashedPassword = await bcrypt.hash(password, 10);
      // userPassword = hashedPassword;
    }

    const userPhone = phone || null; // 如果 phone 為 undefined 或空，則設定為 null

    const [result, error2] = await database.executeSecureQuery(
      'INSERT INTO users (user_email, user_password, user_name, user_number, user_birthday, user_address, firebase_uid, has_additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, userPassword, name, userPhone, birthday, address, firebaseUid || null, false] // 插入 firebaseUid，並預設 has_additional_info 為 false，firebaseUid 為空時插入 null
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
// app/api/member/register/step1/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    const { email } = await req.json(); // 只接收 email

    if (!email) {
      return NextResponse.json({ message: '請提供電子郵件' }, { status: 400 });
    }

    // 檢查電子郵件格式 (可選)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: '電子郵件格式不正確' }, { status: 400 });
    }

    // 檢查電子郵件是否已存在
    const [rows, error1] = await database.executeSecureQuery(
      'SELECT user_id FROM users WHERE user_email = ?',
      [email]
    );

    if (error1) {
      console.error('查詢電子郵件錯誤:', error1);
      return NextResponse.json({ message: '資料庫查詢錯誤', error: error1.message }, { status: 500 });
    }

    if (rows && rows.length > 0) {
      return NextResponse.json({ message: '該電子信箱已註冊過' }, { status: 409 }); // 使用 409 Conflict
    }

    // 電子郵件不存在，可以繼續下一步
    // 產生一個臨時的 token 並與 email 關聯儲存在伺服器端 (例如 Redis)
    // 這個 token 將在 final 步驟驗證使用者是否通過了第一步
    const tempToken = Buffer.from(email).toString('base64'); // 簡單範例
    // **在實際應用中，你需要將這個 token 安全地儲存在伺服器端，並設定過期時間。**
    console.log('產生臨時 Token (與 email 關聯):', tempToken);

    return NextResponse.json({ message: '請繼續填寫詳細資料', tempToken }, { status: 200 });

  } catch (error) {
    console.error('第一步註冊錯誤:', error);
    return NextResponse.json({ message: '註冊第一步失敗，請稍後重試', error: error.message }, { status: 500 });
  }
}
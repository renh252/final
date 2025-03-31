// app/api/member/register/final/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    const {
      tempToken,
      password,
      name,
      phone,
      birthday,
      address,
      googleEmail, // 新增接收 googleEmail
      isGoogleSignIn, // 新增接收 isGoogleSignIn 標誌
    } = await req.json();

    if (isGoogleSignIn === true && googleEmail && name && phone && birthday && address) {
      // 處理 Google 登入的註冊情況
      try {
        // 檢查 googleEmail 是否已存在 (可以允許重複，但 user_id 不同)
        const [existingUserRows, errorCheck] = await database.executeSecureQuery(
          'SELECT user_id FROM users WHERE google_email = ?',
          [googleEmail]
        );

        if (errorCheck) {
          console.error('查詢 Google 電子郵件錯誤:', errorCheck);
          return NextResponse.json({ message: '資料庫查詢錯誤', error: errorCheck.message }, { status: 500 });
        }

        if (existingUserRows && existingUserRows.length > 0) {
          // 更新現有使用者的詳細資料
          const [updateResult, updateError] = await database.executeSecureQuery(
            'UPDATE users SET user_name = ?, user_number = ?, user_birthday = ?, user_address = ? WHERE google_email = ?',
            [name, phone, birthday, address, googleEmail]
          );
          if (updateError) {
            console.error('更新使用者詳細資料錯誤:', updateError);
            return NextResponse.json({ message: '更新使用者詳細資料失敗', error: updateError.message }, { status: 500 });
          }
          return NextResponse.json({ message: '詳細資料已更新' }, { status: 200 });
        } else {
          // 這理論上不應該發生，因為在 /api/auth/google/callback 中應該已經創建了基本使用者
          return NextResponse.json({ message: 'Google 帳號不存在，請重新登入' }, { status: 400 });
        }
      } catch (error) {
        console.error('處理 Google 登入註冊錯誤:', error);
        return NextResponse.json({ message: '處理 Google 登入註冊失敗', error: error.message }, { status: 500 });
      }
    } else {
      // 處理一般的電子郵件/密碼註冊流程
      if (!tempToken || !password || !name || !phone || !birthday || !address) {
        return NextResponse.json({ message: '請提供驗證 Token、密碼和所有詳細資料' }, { status: 400 });
      }

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
    }

  } catch (error) {
    console.error('最終註冊錯誤:', error);
    return NextResponse.json({ message: '註冊最終步驟失敗，請稍後重試', error: error.message }, { status: 500 });
  }
}
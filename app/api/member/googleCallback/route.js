// app/api/auth/google/callback/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';
import { getAuth } from 'firebase-admin/auth';
import { cert, initializeApp } from 'firebase-admin/app';

// 初始化 Firebase Admin SDK (確保只初始化一次)
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY); // 你的 Firebase Admin SDK 私鑰
if (!initializeApp({ credential: cert(serviceAccount) })) {
  console.log('Firebase Admin SDK 已初始化');
}

export async function POST(req) {
  try {
    const { googleEmail, googleName } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: '未提供 Firebase ID Token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // 驗證 Firebase ID Token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const tokenEmail = decodedToken.email;

      if (tokenEmail !== googleEmail) {
        return NextResponse.json({ message: 'Firebase ID Token 的電子郵件與提供的電子郵件不符' }, { status: 401 });
      }

      // 1. 檢查資料庫中是否存在具有此 Firebase UID 或 Google 電子郵件的使用者
      const [existingUserRows, error1] = await database.executeSecureQuery(
        'SELECT user_id, user_name, user_number, user_birthday, user_address FROM users WHERE firebase_uid = ? OR google_email = ?',
        [uid, googleEmail]
      );

      if (error1) {
        console.error('查詢 Firebase UID 或 Google 電子郵件錯誤:', error1);
        return NextResponse.json({ message: '資料庫查詢錯誤', error: error1.message }, { status: 500 });
      }

      const userExists = existingUserRows && existingUserRows.length > 0;
      const hasDetails = userExists && existingUserRows[0].user_name && existingUserRows[0].user_number && existingUserRows[0].user_birthday && existingUserRows[0].user_address;

      // 如果使用者存在但沒有 firebase_uid，更新它
      if (userExists && !existingUserRows[0].firebase_uid) {
        await database.executeSecureQuery(
          'UPDATE users SET firebase_uid = ? WHERE user_id = ?',
          [uid, existingUserRows[0].user_id]
        );
      } else if (!userExists) {
        // 如果使用者不存在，可以在這裡先創建一個基本的使用者記錄，只包含 firebase_uid 和 google_email
        await database.executeSecureQuery(
          'INSERT INTO users (firebase_uid, google_email) VALUES (?, ?)',
          [uid, googleEmail]
        );
      }

      return NextResponse.json({ userExists, hasDetails });

    } catch (error) {
      console.error('驗證 Firebase ID Token 失敗:', error);
      return NextResponse.json({ message: '驗證 Firebase ID Token 失敗', error: error.message }, { status: 401 });
    }

  } catch (error) {
    console.error('Google 登入回調處理錯誤:', error);
    return NextResponse.json({ message: 'Google 登入回調處理失敗', error: error.message }, { status: 500 });
  }
}
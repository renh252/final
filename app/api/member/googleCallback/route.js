// app/api/member/googleCallback/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';
import { getAuth } from 'firebase-admin/auth';
import { cert, initializeApp, getApps } from 'firebase-admin/app';

export async function POST(req) {
  console.log('POST /api/member/googleCallback 請求');

  if (!getApps().length) {
    console.log('Firebase Admin SDK 尚未初始化，嘗試初始化...');
    try {
      const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_KEY;
      console.log('FIREBASE_ADMIN_SDK_KEY:', serviceAccountString ? '已設定' : '未設定');

      if (!serviceAccountString) {
        console.error('錯誤：FIREBASE_ADMIN_SDK_KEY 環境變數未設定。');
        return NextResponse.json({ message: 'Firebase Admin SDK 初始化失敗：環境變數未設定。' }, { status: 500 });
      }

      const serviceAccount = JSON.parse(serviceAccountString);
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin SDK 初始化成功');
    } catch (error) {
      console.error('Firebase Admin SDK 初始化失敗:', error);
      return NextResponse.json({ message: 'Firebase Admin SDK 初始化失敗', error: error.message }, { status: 500 });
    }
  } else {
    console.log('Firebase Admin SDK 已被初始化');
  }

  try {
    const { googleEmail, googleName } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: '未提供 Firebase ID Token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // 驗證 Firebase ID Token
      const auth = getAuth(); // 確保在這裡獲取 auth 實例
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const tokenEmail = decodedToken.email;

      if (tokenEmail !== googleEmail) {
        return NextResponse.json({ message: 'Firebase ID Token 的電子郵件與提供的電子郵件不符' }, { status: 401 });
      }

      // 1. 檢查資料庫中是否存在具有此 Firebase UID 或 Google 電子郵件的使用者
      const [existingUserRows, error1] = await database.executeSecureQuery(
        'SELECT user_id, user_name, user_number, user_birthday, user_address, firebase_uid FROM users WHERE firebase_uid = ? OR google_email = ?',
        [uid, googleEmail]
      );

      if (error1) {
        console.error('查詢 Firebase UID 或 Google 電子郵件錯誤:', error1);
        return NextResponse.json({ message: '資料庫查詢錯誤', error: error1.message }, { status: 500 });
      }

      const userExists = existingUserRows && existingUserRows.length > 0;
      const hasDetails = userExists && existingUserRows[0]?.user_name && existingUserRows[0]?.user_number && existingUserRows[0]?.user_birthday && existingUserRows[0]?.user_address;
      const existingFirebaseUid = existingUserRows[0]?.firebase_uid;
      const existingUserId = existingUserRows[0]?.user_id;

      // 如果使用者存在但沒有 firebase_uid，更新它 (只有當查詢到的是 google_email 匹配的記錄時才更新)
      if (userExists && !existingFirebaseUid && existingUserId && !existingUserRows[0]?.google_email !== googleEmail) {
        const [updateResult, errorUpdate] = await database.executeSecureQuery(
          'UPDATE users SET firebase_uid = ? WHERE user_id = ?',
          [uid, existingUserId]
        );
        if (errorUpdate) {
          console.error('更新 firebase_uid 失敗:', errorUpdate);
          return NextResponse.json({ message: '更新 firebase_uid 失敗', error: errorUpdate.message }, { status: 500 });
        }
        console.log(`使用者 ${existingUserId} 的 firebase_uid 已更新為 ${uid}`);
      } else if (!userExists) {
        // 如果使用者不存在，創建一個新的使用者記錄
        const [insertResult, errorInsert] = await database.executeSecureQuery(
          'INSERT INTO users (firebase_uid, google_email) VALUES (?, ?)',
          [uid, googleEmail]
        );
        if (errorInsert) {
          console.error('創建新使用者失敗:', errorInsert);
          return NextResponse.json({ message: '創建新使用者失敗', error: errorInsert.message }, { status: 500 });
        }
        console.log(`新使用者已創建，firebase_uid: ${uid}, google_email: ${googleEmail}`);
      }

      // 在成功驗證和處理使用者後，你需要生成並返回 authToken (例如 JWT)
      // 這部分需要你根據你的應用程式的驗證機制來實現
      const authToken = 'YOUR_GENERATED_AUTH_TOKEN'; // <---- 替換為你的 JWT 生成邏輯
      const user = existingUserRows[0] || { firebase_uid: uid, google_email: googleEmail }; // 組合使用者資訊

      return NextResponse.json({ userExists, hasDetails, authToken, user });

    } catch (error) {
      console.error('驗證 Firebase ID Token 失敗:', error);
      return NextResponse.json({ message: '驗證 Firebase ID Token 失敗', error: error.message }, { status: 401 });
    }

  } catch (error) {
    console.error('Google 登入回調處理錯誤:', error);
    return NextResponse.json({ message: 'Google 登入回調處理失敗', error: error.message }, { status: 500 });
  }
}

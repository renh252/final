// app/api/member/googleCallback/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';
import jwt from 'jsonwebtoken';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

// 初始化 Firebase Admin SDK (確保只初始化一次)
console.log(process.env.FIREBASE_ADMIN_SDK_KEY);
if (!getApps().length) {
    try {
        const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_KEY;
        if (!serviceAccountString) {
            console.error('錯誤：FIREBASE_ADMIN_SDK_KEY 環境變數未設定。');
            return NextResponse.json({ message: 'Firebase Admin SDK 金鑰未設定' }, { status: 500 });
        }
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(serviceAccountString);
            console.log('Firebase Admin SDK 金鑰解析成功:', serviceAccount ? '已解析' : '解析失敗');
        } catch (parseError) {
            console.error('Firebase Admin SDK 金鑰 JSON 解析失敗:', parseError);
            return NextResponse.json({ message: 'Firebase Admin SDK 金鑰 JSON 解析失敗', error: parseError.message }, { status: 500 });
        }
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log('Firebase Admin SDK 初始化成功');
    } catch (error) {
        console.error('Firebase Admin SDK 初始化失敗:', error, JSON.stringify(error));
        return NextResponse.json({ message: 'Firebase Admin SDK 初始化失敗', error: error.message }, { status: 500 });
    }
} else {
    console.log('Firebase Admin SDK 已被初始化');
}

// 獲取 JWT 秘密金鑰
const jwtSecret = process.env.JWT_SECRET_KEY;

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
            const auth = admin.auth();
            const decodedToken = await auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;
            const tokenEmail = decodedToken.email;

            if (tokenEmail !== googleEmail) {
                return NextResponse.json({ message: 'Firebase ID Token 的電子郵件與提供的電子郵件不符' }, { status: 401 });
            }

            // 1. 檢查資料庫中是否存在具有此 Firebase UID 的使用者
            const [existingUserRows, error1] = await database.executeSecureQuery(
                'SELECT user_id, user_name, user_number, user_birthday, user_address, has_additional_info, firebase_uid, google_email FROM users WHERE firebase_uid = ?',
                [uid]
            );

            if (error1) {
                console.error('查詢 Firebase UID 錯誤:', error1);
                return NextResponse.json({ message: '資料庫查詢錯誤', error: error1.message }, { status: 500 });
            }

            const userExists = existingUserRows && existingUserRows.length > 0;
            const existingUser = existingUserRows ? existingUserRows[0] : null;
            const hasAdditionalInfo = existingUser?.has_additional_info === 1; // 假設 1 代表已填寫

            let needsAdditionalInfo = false;

            if (!userExists) {
                // 第一次使用 Google 登入，需要填寫額外資訊
                const defaultName = googleName || ''; // 使用 Google Name 或空字串
                const defaultNumber = '';
                const defaultBirthday = null; // 或您希望的預設日期
                const defaultAddress = '';

                const [insertResult, errorInsert] = await database.executeSecureQuery(
                    'INSERT INTO users (firebase_uid, google_email, user_email, user_password, user_name, user_number, user_birthday, user_address, has_additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [uid, googleEmail, googleEmail, 'google_login', defaultName, defaultNumber, defaultBirthday, defaultAddress, 0]
                );
                if (errorInsert) {
                    console.error('創建新使用者失敗:', errorInsert);
                    return NextResponse.json({ message: '創建新使用者失敗', error: errorInsert.message }, { status: 500 });
                }
                console.log(`新使用者已創建，firebase_uid: ${uid}, google_email: ${googleEmail}, user_email: ${googleEmail}, user_password: 'google_login', user_name: ${defaultName}, user_number: ${defaultNumber}, user_birthday: ${defaultBirthday}, user_address: ${defaultAddress}, has_additional_info: 0`);
                needsAdditionalInfo = true;
            } else if (!hasAdditionalInfo) {
                needsAdditionalInfo = true;
            }

            // 在成功驗證和處理使用者後，生成並返回 authToken (JWT) 和是否需要額外資訊的標誌
            const authToken = generateAuthToken(uid);
            const user = existingUser || { firebase_uid: uid, google_email: googleEmail };

            return NextResponse.json({ userExists, hasAdditionalInfo, needsAdditionalInfo, authToken, user });

        } catch (error) {
            console.error('驗證 Firebase ID Token 失敗:', error);
            return NextResponse.json({ message: '驗證 Firebase ID Token 失敗', error: error.message }, { status: 401 });
        }

    } catch (error) {
        console.error('Google 登入回調處理錯誤:', error);
        return NextResponse.json({ message: 'Google 登入回調處理失敗', error: error.message }, { status: 500 });
    }
}

function generateAuthToken(uid) {
    if (!jwtSecret) {
        console.error('JWT_SECRET_KEY 環境變數未設定！');
        return null;
    }
    const token = jwt.sign({ uid: uid }, jwtSecret, { expiresIn: '1h' });
    return token;
}
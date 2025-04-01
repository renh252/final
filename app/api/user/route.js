// app/api/user/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 引入資料庫模組
import jwt from 'jsonwebtoken'; // 引入 JWT

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        // 從請求標頭中獲取 JWT Token
        const authorizationHeader = request.headers.get('Authorization');

        if (!authorizationHeader) {
            return NextResponse.json({ message: '未提供驗證憑證' }, { status: 401 });
        }

        const [authType, token] = authorizationHeader.split(' ');

        if (!token) {
            return NextResponse.json({ message: '驗證憑證格式不正確' }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('解碼的 token:', decoded);

            let query;
            let values;

            // 判斷 JWT Payload 中是否存在 userId，用於一般登入
            if (decoded.userId) {
                query = 'SELECT * FROM users WHERE user_id = ?';
                values = [decoded.userId];
            }
            // 判斷 JWT Payload 中是否存在 uid (Firebase UID)，用於 Google 登入
            else if (decoded.uid) {
                query = 'SELECT * FROM users WHERE firebase_uid = ?';
                values = [decoded.uid];
            } else {
                return NextResponse.json({ message: '無效的驗證憑證 Payload' }, { status: 401 });
            }

            const [rows] = await database.execute(query, values);

            if (rows.length === 0) {
                return NextResponse.json({ message: '找不到使用者資料' }, { status: 404 });
            }

            const userData = rows[0];
            return NextResponse.json(userData);

        } catch (error) {
            console.error('JWT 驗證失敗:', error.message);
            return NextResponse.json({ message: '驗證憑證無效', error: error.message }, { status: 401 });
        }

    } catch (error) {
        console.error('API 錯誤:', error.message);
        return NextResponse.json({ message: '伺服器錯誤', error: error.message }, { status: 500 });
    }
}
//app\api\user\route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 引入資料庫模組
import jwt from 'jsonwebtoken'; // 引入 JWT

// Secret key for JWT verification, 這是你用來簽發和驗證 JWT 的密鑰
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    
    // 從請求標頭中獲取 JWT Token
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: '未提供驗證憑證' }, { status: 401 });
    }

    // 驗證 JWT 並解碼
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('解碼的 token:', decoded); // 可以打印出解碼結果來檢查是否正確

    // 假設你資料庫中有一個 `users` 表格
    const query = 'SELECT * FROM users WHERE user_id = ?';  // 這裡保持原來的 SQL
    const values = [decoded.userId]; // 確認這裡是 userId，而不是 user_id

    const [rows] = await database.execute(query, values); // 查詢資料庫

    if (rows.length === 0) {
      return NextResponse.json({ message: '找不到使用者資料' }, { status: 404 });
    }

    // 回傳使用者資料
    const userData = rows[0]; // 假設使用者資料存在於資料庫中
    return NextResponse.json(userData);
    
  } catch (error) {
    console.error('API 錯誤:', error.message);
    return NextResponse.json({ message: '伺服器錯誤', error: error.message }, { status: 500 });
  }
}

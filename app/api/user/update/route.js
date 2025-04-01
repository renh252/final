//app/api/user/update/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; 
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: '未經授權' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: '無效的 token' }, { status: 401 });
    }

    const requestBody = await request.json();
    console.log('請求體:', requestBody); // 記錄請求體

    const fieldName = Object.keys(requestBody)[0];
    const newValue = requestBody[fieldName];

    if (!fieldName || newValue === undefined) {
      return NextResponse.json({ message: '請求體必須包含要更新的欄位和值' }, { status: 400 });
    }

    const allowedFields = ['user_name', 'user_number', 'user_birthday', 'user_address', 'user_level', 'user_nickname'];

    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ message: `不允許更新的欄位: ${fieldName}` }, { status: 400 });
    }

    console.log(`正在更新欄位: ${fieldName}, 新值: ${newValue}, 用戶ID: ${userId}`); // 記錄更新操作
    const query = `UPDATE users SET ${fieldName} = ? WHERE user_id = ?`;
    const [updateResult] = await database.execute(query, [newValue, userId]);

    console.log('更新結果:', updateResult); // 記錄更新結果

    if (updateResult.affectedRows > 0) {
      const [rows] = await database.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) {
        return NextResponse.json(rows[0]);
      } else {
        return NextResponse.json({ message: '更新成功，但無法找到更新後的資料' }, { status: 501 });
      }
    } else {
      return NextResponse.json({ message: '使用者資料更新失敗或沒有資料被修改' }, { status: 502 });
    }

  } catch (error) {
    console.error('更新使用者資料 API 錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤', error: error.message }, { status: 500 });
  }
}

async function getUserIdFromToken(token) {
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    // 優先檢查 userId (一般登入)
    if (decodedToken.userId) {
      return decodedToken.userId;
    }
    // 如果沒有 userId，則檢查 uid (Google 登入)
    if (decodedToken.uid) {
      // 根據 firebase_uid 從資料庫中查詢對應的 user_id
      const [rows] = await database.execute(
        'SELECT user_id FROM users WHERE firebase_uid = ?',
        [decodedToken.uid]
      );
      if (rows.length > 0) {
        return rows[0].user_id;
      }
    }
    console.error('JWT Payload 中沒有找到 userId 或 uid');
    return null;
  } catch (error) {
    console.error('驗證 JWT 失敗:', error);
    return null;
  }
}
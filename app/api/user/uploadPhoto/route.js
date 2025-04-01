import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

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

    const formData = await request.formData();
    const file = formData.get('profile_photo');

    if (!file) {
      return NextResponse.json({ message: '未提供文件' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const filename = `${userId}_${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, Buffer.from(buffer));

    const photoUrl = `/uploads/${filename}`;

    const [updateResult] = await database.execute(
      'UPDATE users SET profile_picture = ? WHERE user_id = ?',
      [photoUrl, userId]
    );

    if (updateResult.affectedRows > 0) {
      const [rows] = await database.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) {
        return NextResponse.json(rows[0]);
      }
    }

    return NextResponse.json({ message: '圖片上傳失敗' }, { status: 500 });

  } catch (error) {
    console.error('上傳圖片 API 錯誤:', error);
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
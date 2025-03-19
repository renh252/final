import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // 從請求頭中獲取 token
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const connection = await pool.getConnection();
    try {
      // 查詢用戶數據
      const [users] = await connection.execute(
        'SELECT user_id, user_name, user_email, user_phone, user_birthday, user_address, nickname FROM users WHERE user_id = ?',
        [userId]
      );

      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = users[0];

      // 返回用戶數據
      return NextResponse.json(user);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
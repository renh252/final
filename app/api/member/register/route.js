import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dbConfig from '@/app/api/_lib/db'; // 假設您的資料庫設定在 db.js 中

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, password, name, phone, birthday, address } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig); // 使用您的資料庫設定

    // 檢查電子郵件是否已存在
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: '電子郵件已存在' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 將使用者資料插入資料庫
    await connection.execute(
      'INSERT INTO users (user_email, user_password, user_name, user_number, user_birthday, user_address) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone, birthday, address]
    );

    connection.end();
    res.status(200).json({ message: '註冊成功' });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '註冊失敗，請稍後重試' });
  }
}
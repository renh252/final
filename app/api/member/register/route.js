import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 匯入資料庫

export async function POST(request) {
  try {
    const { email, password, name, phone, /* ... 其他詳細資料 */ } = await request.json();

    // 資料驗證（例如檢查 email 格式、密碼強度等）
    if (!email || !password || !name || !phone) {
      return NextResponse.json({ message: '請提供所有必填欄位' }, { status: 400 });
    }

    // 在實際應用中，請務必對密碼進行加密
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 將使用者資料儲存到資料庫
    const result = await database.collection('users').insertOne({
      email,
      password, // 請替換為 hashedPassword
      name,
      phone,
      // ... 其他詳細資料
    });

    if (result.acknowledged) {
      return NextResponse.json({ message: '註冊成功' }, { status: 201 });
    } else {
      return NextResponse.json({ message: '註冊失敗，請稍後重試' }, { status: 500 });
    }
  } catch (error) {
    console.error('註冊錯誤:', error);
    return NextResponse.json({ message: '註冊失敗，請稍後重試' }, { status: 500 });
  }
}
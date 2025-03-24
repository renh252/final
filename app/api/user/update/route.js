import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 你的資料庫連接

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: '未經授權' }, { status: 401 });
    }

    // TODO: 驗證 token 並獲取使用者 ID
    // 這裡需要你的身份驗證邏輯
    const userId = await getUserIdFromToken(token); // 假設你有這個函式

    if (!userId) {
      return NextResponse.json({ message: '無效的 token' }, { status: 401 });
    }

    const requestBody = await request.json();
    const fieldName = Object.keys(requestBody)[0]; // 假設只傳送一個欄位
    const newValue = requestBody[fieldName];

    if (!fieldName || newValue === undefined) {
      return NextResponse.json({ message: '請求體必須包含要更新的欄位和值' }, { status: 400 });
    }

    // 允許更新的欄位 (根據你的需求調整)
    const allowedFields = ['user_name', 'user_number', 'user_birthday', 'user_address', 'user_level'];

    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ message: `不允許更新的欄位: ${fieldName}` }, { status: 400 });
    }

    // 這裡替換為你的資料庫操作邏輯
    const updateUserResult = await database.collection('users').updateOne(
      { _id: userId }, // 假設你的使用者 ID 儲存在 _id 欄位
      { $set: { [fieldName]: newValue } }
    );

    if (updateUserResult.modifiedCount > 0) {
      // 成功更新，重新從資料庫獲取更新後的資料並返回
      const updatedUser = await database.collection('users').findOne({ _id: userId });
      return NextResponse.json(updatedUser);
    } else {
      return NextResponse.json({ message: '使用者資料更新失敗或沒有資料被修改' }, { status: 500 });
    }

  } catch (error) {
    console.error('更新使用者資料 API 錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤', error: error.message }, { status: 500 });
  }
}

// 假設的函式，你需要根據你的身份驗證方式實現
async function getUserIdFromToken(token) {
  // TODO: 驗證 JWT token 並提取使用者 ID
  // 這是一個範例，你需要替換為你的實際邏輯
  try {
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // return decodedToken.userId;
    // 在這個範例中，為了簡化，我們假設 token 就是 userId (非常不安全，僅用於說明)
    return token;
  } catch (error) {
    return null;
  }
}
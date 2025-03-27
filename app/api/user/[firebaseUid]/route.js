// app/api/user/[firebaseUid]/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 確保路徑正確

export async function GET(request, { params }) {
  const { firebaseUid } = params;

  if (!firebaseUid) {
    return NextResponse.json({ error: '缺少 Firebase UID' }, { status: 400 });
  }

  try {
    const [users, error] = await database.executeSecureQuery(
      'SELECT has_additional_info FROM users WHERE firebase_uid = ? LIMIT 1',
      [firebaseUid]
    );

    if (error) {
      console.error('查詢使用者資料庫錯誤:', error);
      return NextResponse.json({ error: '資料庫查詢錯誤' }, { status: 500 });
    }

    if (users && users.length > 0) {
      return NextResponse.json(users[0]); // 返回包含 has_additional_info 的物件
    } else {
      return NextResponse.json({ error: '找不到該使用者' }, { status: 404 });
    }
  } catch (error) {
    console.error('獲取使用者資料時發生錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
// app/api/user/updateInfo/route.js
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db';

export async function POST(req) {
  try {
    const requestBody = await req.json();
    const { email, name, phone, birthday, address } = requestBody;

    if (!email) {
      return NextResponse.json({ success: false, message: '缺少電子郵件，無法更新使用者資訊' }, { status: 400 });
    }

    const [result, error] = await database.executeSecureQuery(
      'UPDATE users SET user_name = ?, user_number = ?, user_birthday = ?, user_address = ?, has_additional_info = ? WHERE user_email = ?',
      [name, phone, birthday, address, true, email]
    );

    if (error) {
      console.error('更新使用者資訊失敗:', error);
      return NextResponse.json({ success: false, message: '更新使用者資訊失敗，請稍後重試' }, { status: 500 });
    }

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: '詳細資料更新成功' });
    } else {
      return NextResponse.json({ success: false, message: '找不到該電子郵件的使用者或更新失敗' }, { status: 404 });
    }
  } catch (error) {
    console.error('更新使用者資訊時發生錯誤:', error);
    return NextResponse.json({ success: false, message: '更新使用者資訊時發生錯誤，請稍後重試' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { database } from '@/app/api/_lib/db'; // 你的 MySQL 資料庫連線
import jwt from 'jsonwebtoken';

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
const fieldName = Object.keys(requestBody)[0];
const newValue = requestBody[fieldName];

if (!fieldName || newValue === undefined) {
return NextResponse.json({ message: '請求體必須包含要更新的欄位和值' }, { status: 400 });
}

const allowedFields = ['user_name', 'user_number', 'user_birthday', 'user_address', 'user_level', 'user_nickname']; // 包含 user_nickname

if (!allowedFields.includes(fieldName)) {
return NextResponse.json({ message: `不允許更新的欄位: ${fieldName}` }, { status: 400 });
}

// 這裡替換為你的 MySQL 資料庫操作邏輯
const [updateResult] = await database.execute(
 'UPDATE users SET ?? = ? WHERE user_id = ?', // 假設你的使用者 ID 欄位是 'id'
[fieldName, newValue, userId]
);

if (updateResult.affectedRows > 0) {
 // 成功更新，重新從資料庫獲取更新後的資料並返回
const [rows] = await database.execute(
'SELECT * FROM users WHERE user_id = ?',
[userId]
);
if (rows.length > 0) {
return NextResponse.json(rows[0]);
} else {
return NextResponse.json({ message: '更新成功，但無法找到更新後的資料' }, { status: 500 });
}
} else {
return NextResponse.json({ message: '使用者資料更新失敗或沒有資料被修改' }, { status: 500 });
}

} catch (error) {
console.error('更新使用者資料 API 錯誤:', error);
return NextResponse.json({ message: '伺服器錯誤', error: error.message }, { status: 500 });
}
}

async function getUserIdFromToken(token) {
try {
const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
 return decodedToken.userId; // 假設 payload 中有 userId
} catch (error) {
console.error('驗證 JWT 失敗:', error);
return null;
}
}
// lib/auth.js
import { users } from './users'; // 假設您有一個用戶資料庫

export async function verifyCredentials(email, password) {
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}
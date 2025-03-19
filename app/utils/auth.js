import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// JWT 配置
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file'
const JWT_EXPIRES_IN = '7d' // Token 有效期為 7 天

/**
 * 驗證 JWT Token
 * @param {string} token - JWT Token
 * @returns {object|null} - 解碼後的用戶資料或 null (如果 token 無效)
 */
export async function verifyJwtToken(token) {
  if (!token) {
    return null
  }

  try {
    // 驗證並解碼 token
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('JWT 驗證失敗:', error.message)
    return null
  }
}

/**
 * 產生 JWT Token
 * @param {object} payload - 要編碼進 token 的資料
 * @returns {string} - 產生的 JWT token
 */
export function generateJwtToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * 設置帶有 JWT 的 cookie
 * @param {object} userData - 使用者資料
 * @returns {void}
 */
export function setAuthCookie(userData) {
  const token = generateJwtToken(userData)

  // 設置 HTTP-only cookie 以提高安全性
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7天 (秒為單位)
    path: '/',
  })
}

/**
 * 清除認證 cookie
 * @returns {void}
 */
export function clearAuthCookie() {
  cookies().delete('token')
}

import { SignJWT, jwtVerify } from 'jose'

// 設定 JWT 密鑰和過期時間
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)
const TOKEN_EXPIRE = '7d' // 7天過期

// 用於生成 JWT token
export function generateToken(payload: any): string {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRE)
    .sign(JWT_SECRET)
}

// 用於驗證 JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('JWT驗證失敗:', error)
    return null
  }
}

// 用於刷新 JWT token
export function refreshToken(token: string): Promise<string | null> {
  return verifyToken(token)
    .then((payload) => {
      if (!payload) return null
      // 刪除過期時間相關資訊，重新簽發
      delete payload.exp
      delete payload.iat
      return generateToken(payload)
    })
    .catch((error) => {
      console.error('Token刷新失敗:', error)
      return null
    })
}

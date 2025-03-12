import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// JWT 密鑰和設定
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-for-admin-panel'
)
const JWT_EXPIRES_IN = '24h'

export interface AdminPayload {
  id: number
  account: string
  privileges: string
  role?: string // 添加 role 屬性，用於權限控制
}

// 產生 JWT Token
export async function generateToken(payload: AdminPayload): Promise<string> {
  // 根據 privileges 設置 role
  if (!payload.role) {
    payload.role = 'admin' // 預設為管理員角色
  }

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
}

// 驗證 JWT Token
export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const adminPayload = payload as AdminPayload

    // 確保 role 屬性存在
    if (!adminPayload.role && adminPayload.privileges) {
      adminPayload.role = 'admin' // 預設為管理員角色
    }

    return adminPayload
  } catch (error) {
    console.error('JWT 驗證失敗:', error)
    return null
  }
}

// 驗證 bcrypt 密碼 (PHP password_hash 相容)
export async function verifyPassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // PHP的password_hash生成的密碼通常以$2y$開頭
    // Node.js的bcrypt使用$2a$或$2b$，需要替換前綴
    let compatibleHash = hashedPassword

    if (hashedPassword.startsWith('$2y$')) {
      compatibleHash = hashedPassword.replace('$2y$', '$2a$')
    }

    return await bcrypt.compare(inputPassword, compatibleHash)
  } catch (error) {
    console.error('密碼驗證錯誤:', error)
    return false
  }
}

import { NextRequest } from 'next/server'
import { verifyToken as jwtVerify } from './jwt'
import { db } from './db'

// 授權介面
interface Auth {
  id: number
  role: string
  perms: string[]
}

// 管理員介面
interface Admin {
  id: number
  manager_account: string
  manager_privileges: string
  is_active: number
}

// 授權工具
export const auth = {
  // 驗證 token
  verify: async (token: string): Promise<Auth | null> => {
    try {
      const payload = await jwtVerify(token)
      if (!payload) return null

      // 從資料庫獲取管理員資訊
      const [admins] = await db.query<Admin[]>(
        'SELECT id, manager_account, manager_privileges, is_active FROM manager WHERE id = ? AND is_active = 1',
        [payload.id]
      )

      const admin = admins?.[0]
      if (!admin) return null

      return {
        id: admin.id,
        role: admin.manager_privileges === '111' ? 'super' : 'admin',
        perms: admin.manager_privileges.split(','),
      }
    } catch (error) {
      console.error('Token 驗證失敗:', error)
      return null
    }
  },

  // 檢查權限
  can: (auth: Auth, perm: string): boolean => {
    if (!auth) return false
    if (auth.role === 'super') return true
    return auth.perms.includes(perm)
  },

  // 取得管理員
  getAdmin: async (id: number): Promise<Admin | null> => {
    const [admins] = await db.query<Admin[]>(
      'SELECT id, manager_account, manager_privileges, is_active FROM manager WHERE id = ? AND is_active = 1',
      [id]
    )
    return admins?.[0] || null
  },

  // 從請求中驗證
  fromRequest: async (request: NextRequest): Promise<Auth | null> => {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    return auth.verify(token)
  },

  // 更新最後登入時間
  updateLoginTime: async (id: number): Promise<void> => {
    await db.exec(
      'UPDATE manager SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    )
  },
}

// 檢查管理員是否擁有特定權限
export function hasPermission(
  admin: AdminPayload | null,
  requiredArea: string | string[]
): boolean {
  if (!admin) return false

  // 超級管理員權限
  if (admin.privileges === '111') return true

  // 處理可能的複合權限（用逗號分隔）
  const adminPrivileges = admin.privileges.split(',')

  // 檢查是否有該權限區域的存取權
  if (Array.isArray(requiredArea)) {
    return requiredArea.some((area) => adminPrivileges.includes(area))
  }

  return adminPrivileges.includes(requiredArea)
}

// 產生未授權的回應
export function unauthorizedResponse(message = '未授權的請求') {
  return NextResponse.json({ success: false, message }, { status: 401 })
}

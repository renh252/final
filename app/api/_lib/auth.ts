import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { db } from './db'
import { verifyToken } from './jwt'

// 使用者類型定義，更新為使用正確的欄位名稱
export interface User {
  user_id: number
  user_email: string
  user_name: string
  role?: string
  status?: string
}

class Auth {
  async fromRequest(req: NextRequest): Promise<User | null> {
    try {
      // 嘗試從 cookie 獲取 token
      const cookieStore = cookies()
      const token = cookieStore.get('token')?.value

      // 如果沒有 token，從 Authorization 頭部獲取
      const authHeader = req.headers.get('Authorization')
      const tokenFromHeader =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : null

      const finalToken = token || tokenFromHeader

      if (!finalToken) {
        return null
      }

      // 驗證 token
      const payload = await verifyToken(finalToken)
      if (!payload || typeof payload !== 'object' || !payload.id) {
        return null
      }

      // 查詢資料庫，確認用戶存在
      return await this.verify(payload.id)
    } catch (error) {
      console.error('認證失敗:', error)
      return null
    }
  }

  async verify(userId: number): Promise<User | null> {
    try {
      // 使用正確的欄位名稱，只排除"停用"狀態的用戶
      const [rows, error] = await db.query(
        `
        SELECT 
          user_id, 
          user_email, 
          user_name, 
          user_level AS role,
          user_status AS status
        FROM users
        WHERE user_id = ? AND (user_status != '停用' OR user_status IS NULL)
        LIMIT 1
        `,
        [userId]
      )

      if (error || (rows as any[]).length === 0) {
        return null
      }

      return (rows as any[])[0] as User
    } catch (error) {
      console.error('認證驗證失敗:', error)
      return null
    }
  }

  can(user: User | null, action: string): boolean {
    if (!user) return false

    // 管理員角色有所有權限
    if (user.role === '系統管理員' || user.role === '管理員') {
      return true
    }

    switch (action) {
      case 'view_own_profile':
      case 'update_own_profile':
      case 'create_appointment':
      case 'view_own_appointments':
      case 'cancel_own_appointment':
        return true
      default:
        return false
    }
  }
}

export const auth = new Auth()

// 檢查用戶是否擁有特定權限
export function hasPermission(
  user: User | undefined,
  requiredPerm: string | string[]
): boolean {
  if (!user) return false

  // 處理可能的複合權限（用逗號分隔）
  if (Array.isArray(requiredPerm)) {
    return requiredPerm.some((perm) => auth.can(user, perm))
  }

  return auth.can(user, requiredPerm)
}

import { NextRequest, NextResponse } from 'next/server'
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
  // is_active 欄位在實際資料庫中不存在，已移除
  // is_active: number
}

// 授權工具
export const auth = {
  // 驗證 token
  verify: async (token: string): Promise<Auth | null> => {
    try {
      console.log('開始驗證token...')
      const payload = await jwtVerify(token)
      if (!payload) {
        console.log('JWT驗證失敗，無效的payload')
        return null
      }
      console.log('JWT驗證成功，payload:', payload)

      // 從資料庫獲取管理員資訊
      // 注意：移除了 is_active 欄位和條件，因為該欄位在實際資料庫中不存在
      const [admins] = await db.query<Admin[]>(
        'SELECT id, manager_account, manager_privileges FROM manager WHERE id = ?',
        [payload.id]
      )

      const admin = admins?.[0]
      if (!admin) {
        console.log('找不到管理員資訊，ID:', payload.id)
        return null
      }
      console.log('找到管理員資訊:', admin)

      // 防止 manager_privileges 為 undefined 或 null
      const privileges = admin.manager_privileges || ''
      const isSuperAdmin = privileges === '111'

      // 創建並返回Auth對象
      const authData = {
        id: admin.id,
        role: isSuperAdmin ? 'super' : 'admin',
        perms: privileges ? privileges.split(',') : [],
      }
      console.log('創建Auth對象成功:', authData)
      return authData
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
    try {
      console.log('開始獲取管理員資訊，ID:', id)
      // 注意：移除了 is_active 欄位和條件，因為該欄位在實際資料庫中不存在
      const [admins] = await db.query<Admin[]>(
        'SELECT id, manager_account, manager_privileges FROM manager WHERE id = ?',
        [id]
      )

      const admin = admins?.[0]
      if (!admin) {
        console.log('找不到管理員資訊，ID:', id)
        return null
      }

      // 確保欄位不為undefined/null
      const secureAdmin: Admin = {
        id: admin.id,
        manager_account: admin.manager_account || '',
        manager_privileges: admin.manager_privileges || '',
      }

      console.log('成功獲取管理員資訊:', secureAdmin)
      return secureAdmin
    } catch (error) {
      console.error('獲取管理員資訊時發生錯誤:', error)
      return null
    }
  },

  // 從請求中驗證
  fromRequest: async (request: NextRequest): Promise<Auth | null> => {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    return auth.verify(token)
  },

  // 確認是否已認證 - 添加此函數解決 isAuthenticated 未定義的問題
  isAuthenticated: async (request: NextRequest): Promise<boolean> => {
    const auth = await auth.fromRequest(request)
    return auth !== null
  },

  // 更新最後登入時間
  updateLoginTime: async (id: number): Promise<void> => {
    // 注意：實際資料庫中不存在 last_login_at 欄位，這個方法將不起作用
    // 實際應用中，應該考慮在其他地方記錄登入時間，或者添加這個欄位
    console.warn(
      '警告: 嘗試更新last_login_at欄位，但該欄位在實際資料庫中不存在'
    )
    // 原始實現保留為注釋
    // await db.exec(
    //   'UPDATE manager SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
    //   [id]
    // )
  },
}

// 檢查管理員是否擁有特定權限
export function hasPermission(
  admin: { manager_privileges?: string } | null,
  requiredArea: string | string[]
): boolean {
  if (!admin) return false

  // 超級管理員權限
  if (admin.manager_privileges === '111') return true

  // 防止 privileges 為 undefined 或 null
  const privileges = admin.manager_privileges || ''

  // 處理可能的複合權限（用逗號分隔）
  const adminPrivileges = privileges ? privileges.split(',') : []

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

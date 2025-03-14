import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

// Auth 介面
interface Auth {
  id: number
  role: string
  perms: string[]
}

// API 處理器類型
type ApiHandler = (req: NextRequest, auth: Auth) => Promise<Response> | Response

// API 路由保護
export const guard = {
  // API 路由保護
  api: (handler: ApiHandler): ApiHandler => {
    return async (req: NextRequest) => {
      try {
        // 驗證授權
        const authData = await auth.fromRequest(req)
        if (!authData) {
          return NextResponse.json(
            { success: false, message: '未授權的請求' },
            { status: 401 }
          )
        }

        // 執行處理器
        return handler(req, authData)
      } catch (error) {
        console.error('API 錯誤:', error)
        return NextResponse.json(
          { success: false, message: '伺服器錯誤' },
          { status: 500 }
        )
      }
    }
  },

  // 權限保護
  perm: (requiredPerm: string) => {
    return (handler: ApiHandler): ApiHandler => {
      return async (req: NextRequest, authData: Auth) => {
        // 檢查權限
        if (!auth.can(authData, requiredPerm)) {
          return NextResponse.json(
            { success: false, message: '權限不足' },
            { status: 403 }
          )
        }

        // 執行處理器
        return handler(req, authData)
      }
    }
  },
}

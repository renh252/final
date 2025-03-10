'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

// 定義管理員類型
export interface Admin {
  id: number
  account: string
  privileges: string
}

// 定義上下文類型
interface AdminContextType {
  admin: Admin | null
  isLoading: boolean
  login: (token: string, adminData: Admin) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  hasPermission: (area: string | string[]) => boolean
}

// 創建上下文
const AdminContext = createContext<AdminContextType | undefined>(undefined)

// 節流函數 - 限制函數在特定時間內只能執行一次
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean = false
  return function (...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 上下文提供者組件
export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastVerified, setLastVerified] = useState<number>(0)
  const verifyInProgress = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  // 在初始化時嘗試從 localStorage 讀取管理員信息
  useEffect(() => {
    const initAdmin = () => {
      try {
        const adminData = localStorage.getItem('admin')
        if (adminData) {
          setAdmin(JSON.parse(adminData))
        }
      } catch (error) {
        console.error('無法讀取管理員資訊:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAdmin()
  }, [])

  // 檢查管理員是否有特定權限
  const hasPermission = (area: string | string[]) => {
    if (!admin) return false

    // 超級管理員權限
    if (admin.privileges === '111') return true

    // 處理可能的複合權限（用逗號分隔）
    const adminPrivileges = admin.privileges.split(',')

    // 檢查是否有該權限區域的存取權
    if (Array.isArray(area)) {
      return area.some((a) => adminPrivileges.includes(a))
    }

    return adminPrivileges.includes(area)
  }

  // 登入
  const login = (token: string, adminData: Admin) => {
    // 設置 cookie
    Cookies.set('admin_token', token, {
      expires: 1, // 1 天
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    // 保存管理員資訊到 localStorage
    localStorage.setItem('admin', JSON.stringify(adminData))

    // 更新狀態
    setAdmin(adminData)
    setLastVerified(Date.now())
  }

  // 登出
  const logout = async () => {
    try {
      setIsLoading(true)

      // 呼叫登出 API
      await fetch('/admin/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('admin_token')}`,
        },
      })

      // 清除 cookie 和 localStorage
      Cookies.remove('admin_token')
      localStorage.removeItem('admin')

      // 更新狀態
      setAdmin(null)
      setLastVerified(0)

      // 重定向到登入頁面
      router.push('/admin/login')
    } catch (error) {
      console.error('登出錯誤:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 檢查認證狀態 - 使用 useCallback 和防止重複調用的機制
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // 如果正在進行驗證，則跳過
    if (verifyInProgress.current) {
      return !!admin
    }

    // 如果上次驗證時間距離現在小於 30 秒，則跳過驗證
    if (Date.now() - lastVerified < 30000 && admin) {
      return true
    }

    try {
      verifyInProgress.current = true
      setIsLoading(true)

      // 獲取 token
      const token = Cookies.get('admin_token')
      if (!token) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        return false
      }

      // 驗證 token
      const response = await fetch('/admin/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // 清除過期 token
        Cookies.remove('admin_token')
        localStorage.removeItem('admin')
        setAdmin(null)

        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        return false
      }

      // 更新管理員資訊（以防後端有更新）
      setAdmin(data.data.admin)
      localStorage.setItem('admin', JSON.stringify(data.data.admin))
      setLastVerified(Date.now())

      return true
    } catch (error) {
      console.error('驗證錯誤:', error)

      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      return false
    } finally {
      setIsLoading(false)
      verifyInProgress.current = false
    }
  }, [admin, lastVerified, pathname, router])

  // 節流版本的 checkAuth - 每 10 秒最多執行一次
  const throttledCheckAuth = useCallback(
    throttle(() => {
      if (!verifyInProgress.current) {
        checkAuth()
      }
    }, 10000),
    [checkAuth]
  )

  // 設置定期驗證 - 每 5 分鐘檢查一次
  useEffect(() => {
    const interval = setInterval(() => {
      if (admin && !verifyInProgress.current) {
        checkAuth()
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [admin, checkAuth])

  return (
    <AdminContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        checkAuth,
        hasPermission,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

// 自定義鈎子
export function useAdmin() {
  const context = useContext(AdminContext)

  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }

  return context
}

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
import {
  ALL_PERMISSIONS,
  getSuperAdminPermissions,
  getManagerPermissions,
  checkPermission,
} from './_lib/permissions'

// 定義管理員類型
export interface Admin {
  id: number
  manager_account: string
  manager_privileges: string
}

// 定義上下文類型
interface AdminContextType {
  admin: Admin | null
  isLoading: boolean
  isAuthChecking: boolean
  cachedPermissions: string[]
  login: (token: string, adminData: Admin) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  hasPermission: (area: string | string[]) => boolean
  preloadPermissions: () => void
}

// 定義預緩存持久化儲存鍵名
const CACHE_KEYS = {
  ADMIN: 'admin',
  PERMISSIONS: 'admin_permissions',
  LAST_VERIFIED: 'admin_last_verified',
  ALL_PERMISSIONS_LIST: 'admin_all_permissions',
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
  const [isAuthChecking, setIsAuthChecking] = useState(false)
  const [lastVerified, setLastVerified] = useState<number>(0)
  const [currentPath, setCurrentPath] = useState<string>('')
  const [cachedPermissions, setCachedPermissions] = useState<string[]>([])
  const verifyInProgress = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  // 在客戶端環境中更新路徑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  // 載入預緩存的權限
  const loadCachedPermissions = useCallback(() => {
    try {
      // 嘗試從 localStorage 載入預緩存的權限列表
      const cachedPermsStr = localStorage.getItem(CACHE_KEYS.PERMISSIONS)
      if (cachedPermsStr) {
        try {
          const perms = JSON.parse(cachedPermsStr)

          // 驗證權限格式
          if (Array.isArray(perms)) {
            // 允許權限包含 'donation' 或 'general'，為了與解析後的結果兼容
            const validPerms = perms.filter(
              (p) =>
                typeof p === 'string' &&
                (p.includes(':') ||
                  p === '111' ||
                  p === 'donation' ||
                  p === 'general')
            )

            // 如果過濾後的權限數量與原始不同，則記錄日誌並更新緩存
            if (validPerms.length !== perms.length) {
              console.warn('權限緩存中發現無效權限，已過濾')

              // 更新localStorage
              localStorage.setItem(
                CACHE_KEYS.PERMISSIONS,
                JSON.stringify(validPerms)
              )
            }

            setCachedPermissions(validPerms)
            return validPerms
          }
        } catch (parseError) {
          console.error('解析權限緩存錯誤:', parseError)

          // 清除無效的緩存
          localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
        }
      }
    } catch (error) {
      console.error('無法載入預緩存權限:', error)
    }
    return []
  }, [])

  // 預加載權限的實現
  const preloadPermissions = useCallback(() => {
    // 避免重複預載入
    let lastPreloadTime = 0
    const now = Date.now()
    if (now - lastPreloadTime < 2000) {
      return // 防止2秒內重複預載入
    }
    lastPreloadTime = now

    if (!admin) {
      // 安靜地跳過預載入，不輸出警告
      return
    }

    try {
      // 確保權限字串存在，如果不存在則使用空字串
      const privileges = admin.manager_privileges || ''

      if (!privileges) {
        // 清除可能存在的舊緩存
        localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
        setCachedPermissions([])
        return
      }

      // 獲取管理員權限
      const permissions = getManagerPermissions(privileges)

      // 如果沒有獲取到權限，則記錄警告但不更新緩存
      if (permissions.length === 0) {
        return
      }

      // 檢查是否與當前緩存相同
      const currentCacheJSON = JSON.stringify(cachedPermissions.sort())
      const newCacheJSON = JSON.stringify(permissions.sort())

      if (currentCacheJSON === newCacheJSON) {
        // 權限沒有變化，跳過更新
        return
      }

      // 存儲到本地緩存
      localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(permissions))

      // 更新狀態
      setCachedPermissions(permissions)
    } catch (error) {
      console.error('預加載權限失敗:', error)
    }
  }, [admin, cachedPermissions])

  // 在初始化時嘗試從 localStorage 讀取管理員信息和權限緩存
  useEffect(() => {
    const initAdmin = async () => {
      try {
        setIsLoading(true)

        // 先清除可能存在的舊緩存
        const oldPermsStr = localStorage.getItem(CACHE_KEYS.PERMISSIONS)
        if (oldPermsStr) {
          try {
            const oldPerms = JSON.parse(oldPermsStr)
            // 檢查是否包含非標準格式權限
            if (
              Array.isArray(oldPerms) &&
              oldPerms.some(
                (p) => typeof p === 'string' && !p.includes(':') && p !== '111'
              )
            ) {
              console.warn('發現非標準格式權限緩存，已清除', oldPerms)
              localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
            }
          } catch (e) {
            console.error('解析舊權限緩存失敗，已清除', e)
            localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
          }
        }

        // 嘗試從 localStorage 讀取管理員資訊
        const adminData = localStorage.getItem(CACHE_KEYS.ADMIN)
        if (adminData) {
          try {
            const parsedAdmin = JSON.parse(adminData)

            // 驗證管理員數據有效性
            if (
              !parsedAdmin ||
              typeof parsedAdmin !== 'object' ||
              !parsedAdmin.id
            ) {
              console.warn('無效的管理員資料，已清除', parsedAdmin)
              localStorage.removeItem(CACHE_KEYS.ADMIN)
            } else {
              setAdmin(parsedAdmin)

              // 確保管理員數據中包含權限字段
              if (!parsedAdmin.manager_privileges) {
                console.warn('管理員資料中缺少manager_privileges字段')
              } else {
                // 立即預載入權限 - 使用通用函數
                const managerPerms = getManagerPermissions(
                  parsedAdmin.manager_privileges
                )
                console.log('初始化 - 獲取權限數量:', managerPerms.length)

                if (managerPerms.length > 0) {
                  localStorage.setItem(
                    CACHE_KEYS.PERMISSIONS,
                    JSON.stringify(managerPerms)
                  )
                  setCachedPermissions(managerPerms)
                }
              }
            }
          } catch (e) {
            console.error('解析管理員資料失敗，已清除', e)
            localStorage.removeItem(CACHE_KEYS.ADMIN)
          }
        }

        // 在管理員資訊載入後，再載入預緩存的權限
        loadCachedPermissions()

        // 嘗試讀取上次驗證時間
        const lastVerifiedStr = localStorage.getItem(CACHE_KEYS.LAST_VERIFIED)
        if (lastVerifiedStr) {
          const lastVerifiedTime = parseInt(lastVerifiedStr, 10)
          if (!isNaN(lastVerifiedTime)) {
            setLastVerified(lastVerifiedTime)
          }
        }

        // 如果我們有 token，則觸發一次認證檢查
        const token = Cookies.get('admin_token')
        if (token) {
          // 在後台觸發驗證，但不阻塞初始化
          await checkAuth()
        } else {
          console.log('未找到admin_token，跳過初始化驗證')

          // 沒有token時清除本地緩存的管理員信息
          localStorage.removeItem(CACHE_KEYS.ADMIN)
          localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
          setAdmin(null)
          setCachedPermissions([])
        }
      } catch (error) {
        console.error('無法讀取管理員資訊:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAdmin()
  }, [loadCachedPermissions])

  // 當 admin 狀態變化時，預載入權限
  useEffect(() => {
    if (admin) {
      preloadPermissions()
    }
  }, [admin, preloadPermissions])

  // 檢查是否有權限的實現
  const hasPermission = useCallback(
    (requiredPrivilege: string | string[]): boolean => {
      // 如果沒有登入，沒有權限
      if (!admin) {
        return false
      }

      // 超級管理員擁有所有權限
      if (admin.manager_privileges === '111') {
        return true
      }

      try {
        // 檢查緩存權限
        if (cachedPermissions.length === 0) {
          // 安靜地預載入，不輸出日誌
          preloadPermissions()
        }

        // 使用 checkPermission 函數檢查權限
        const result = checkPermission(
          admin.manager_privileges,
          requiredPrivilege
        )
        return result
      } catch (error) {
        console.error('檢查權限時發生錯誤:', error)
        return false
      }
    },
    [admin, cachedPermissions, preloadPermissions]
  )

  // 登入
  const login = useCallback((token: string, adminData: Admin) => {
    // 設置 cookie
    Cookies.set('admin_token', token, {
      expires: 1, // 1 天
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    // 保存管理員資訊到 localStorage
    localStorage.setItem(CACHE_KEYS.ADMIN, JSON.stringify(adminData))

    // 記錄驗證時間
    const now = Date.now()
    localStorage.setItem(CACHE_KEYS.LAST_VERIFIED, now.toString())

    // 更新狀態
    setAdmin(adminData)
    setLastVerified(now)

    // 立即預載入並緩存權限 - 使用通用函數
    const privileges = adminData.manager_privileges || ''
    console.log('登入 - 開始預載入權限:', privileges)

    const managerPerms = getManagerPermissions(privileges)
    console.log('登入 - 獲取到權限數量:', managerPerms.length)

    localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(managerPerms))
    setCachedPermissions(managerPerms)

    // 如果是超級管理員，同時保存所有權限列表
    if (privileges === '111') {
      localStorage.setItem(
        CACHE_KEYS.ALL_PERMISSIONS_LIST,
        JSON.stringify(ALL_PERMISSIONS)
      )
    }
  }, [])

  // 登出
  const logout = async () => {
    try {
      setIsLoading(true)

      // 呼叫登出 API
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('admin_token')}`,
        },
      })

      // 清除 cookie 和 localStorage
      Cookies.remove('admin_token')
      localStorage.removeItem(CACHE_KEYS.ADMIN)
      localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
      localStorage.removeItem(CACHE_KEYS.LAST_VERIFIED)

      // 更新狀態
      setAdmin(null)
      setLastVerified(0)
      setCachedPermissions([])

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
      setIsAuthChecking(true)

      // 獲取 token
      const token = Cookies.get('admin_token')
      if (!token) {
        // 清除狀態
        Cookies.remove('admin_token')
        localStorage.removeItem(CACHE_KEYS.ADMIN)
        localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
        localStorage.removeItem(CACHE_KEYS.LAST_VERIFIED)
        setAdmin(null)
        setCachedPermissions([])

        if (currentPath !== '/admin/login') {
          router.push('/admin/login')
        }
        return false
      }

      // 驗證 token
      const response = await fetch('/api/admin/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // 清除過期 token
        Cookies.remove('admin_token')
        localStorage.removeItem(CACHE_KEYS.ADMIN)
        localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
        localStorage.removeItem(CACHE_KEYS.LAST_VERIFIED)
        setAdmin(null)
        setCachedPermissions([])

        if (currentPath !== '/admin/login') {
          router.push('/admin/login')
        }
        return false
      }

      // 更新管理員資訊（以防後端有更新）
      const mappedAdmin = data.data.admin
      setAdmin(mappedAdmin)
      localStorage.setItem(CACHE_KEYS.ADMIN, JSON.stringify(mappedAdmin))

      // 更新驗證時間
      const now = Date.now()
      localStorage.setItem(CACHE_KEYS.LAST_VERIFIED, now.toString())
      setLastVerified(now)

      // 立即預載入並緩存權限 - 使用通用函數
      const managerPerms = getManagerPermissions(mappedAdmin.manager_privileges)
      localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(managerPerms))
      setCachedPermissions(managerPerms)

      // 如果是超級管理員，同時保存所有權限列表
      if (mappedAdmin.manager_privileges === '111') {
        localStorage.setItem(
          CACHE_KEYS.ALL_PERMISSIONS_LIST,
          JSON.stringify(ALL_PERMISSIONS)
        )
      }

      return true
    } catch (error) {
      console.error('驗證錯誤:', error)

      // 清除狀態
      Cookies.remove('admin_token')
      localStorage.removeItem(CACHE_KEYS.ADMIN)
      localStorage.removeItem(CACHE_KEYS.PERMISSIONS)
      localStorage.removeItem(CACHE_KEYS.LAST_VERIFIED)
      setAdmin(null)
      setCachedPermissions([])

      if (currentPath !== '/admin/login') {
        router.push('/admin/login')
      }
      return false
    } finally {
      setIsAuthChecking(false)
      verifyInProgress.current = false
    }
  }, [admin, lastVerified, currentPath, router])

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
        isAuthChecking,
        cachedPermissions,
        login,
        logout,
        checkAuth,
        hasPermission,
        preloadPermissions,
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

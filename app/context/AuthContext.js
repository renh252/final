// app/context/AuthContext.js
'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { requiresAuth } from '@/app/config/routes'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        setUser(userData)
      } catch (error) {
        console.error('解析用戶數據失敗:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // 檢查當前路徑是否需要身份驗證
  useEffect(() => {
    if (!loading) {
      // 使用路由配置文件中的函數檢查是否需要認證
      const needsAuth = requiresAuth(pathname)

      if (needsAuth && !user) {
        router.push('/member/MemberLogin/login')
      }
    }
  }, [pathname, user, loading, router])

  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setUser(userData.user)
    router.push('/member')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/member/MemberLogin/login')
  }

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser)) // 更新 localStorage
    setUser(updatedUser) // 更新 Context 中的 user 狀態
  }

  const isAuthenticated = !!user

  const value = {
    user,
    login,
    logout,
    loading,
    updateUser,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// 新增：路由保護高階組件
export const withAuth = (Component) => {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/member/MemberLogin/login')
      }
    }, [user, loading, router])

    if (loading) return <div>載入中...</div>
    if (!user) return null

    return <Component {...props} />
  }
}

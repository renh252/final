// app/context/AuthContext.js
'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 初始化時載入用戶數據
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

  // 登入方法
  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setUser(userData.user)
    router.push('/member')
  }

  // 登出方法
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/member/MemberLogin/login')
  }

  // 更新用戶信息
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

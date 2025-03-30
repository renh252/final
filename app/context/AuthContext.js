// app/context/AuthContext.js
'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 初始化時載入用戶數據
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        setUser(userData)
        setToken(storedToken)
      } catch (error) {
        console.error('解析用戶數據失敗:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // 一般會員登入方法
  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setUser(userData.user)
    setToken(userData.token)

    // 檢查是否存在登入前的頁面路徑
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectPath)
    } else {
      router.push('/member')
      }
    }

      // Google 登入方法
  const googleLogin = async (googleEmail, idToken) => {
    try {
      const response = await fetch('/api/member/googleCallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ googleEmail })
      });

      if (!response.ok) {
        throw new Error('Google 登入失敗');
      }

      const userData = await response.json();
      
      // 使用與普通登入相同的邏輯處理登入成功
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      setUser(userData.user);
      setToken(userData.token);

      // 檢查是否存在登入前的頁面路徑
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectPath)
    } else {
      router.push('/member')
      }
  }catch (error) {
    console.error('Google 登入錯誤:', error);
    // 處理錯誤，例如顯示錯誤消息給用戶
  }
}

  // 登出方法
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('redirectAfterLogin')
    router.push('/member/MemberLogin/login')
  }

  // 更新用戶信息
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const isAuthenticated = !!user && !!token

  const value = {
    user,
    token,
    login,
    googleLogin, // 新增 Google 登入方法
    logout,
    loading,
    updateUser,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
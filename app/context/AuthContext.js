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
  const googleLogin = async (googleEmail, idToken, googleName = '') => {
    try {
      console.log('Google 登入開始:', googleEmail, googleName)

      // 請求 Google 登入 API
      const response = await fetch('/api/member/googleCallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleEmail,
          googleName: googleName || '',
          defaultPassword: 'Google@' + googleEmail.split('@')[0],
        }),
      })

      // 獲取完整回應文本
      const responseText = await response.text()
      console.log('API 回應文本:', responseText.substring(0, 100) + '...')

      // 嘗試解析 JSON
      let userData
      try {
        userData = JSON.parse(responseText)
      } catch (error) {
        console.error('解析 API 回應失敗:', error)
        throw new Error('無法解析 API 回應')
      }

      console.log('google 登入回應:', userData)

      // 檢查登入結果
      if (!userData.success) {
        throw new Error(userData.message || '登入失敗')
      }

      // 存儲 token 和用戶資料
      localStorage.setItem('token', userData.authToken)

      // 只在用戶存在時存儲用戶資料
      if (userData.user) {
        localStorage.setItem('user', JSON.stringify(userData.user))
        setUser(userData.user)
      }

      setToken(userData.authToken)

      // 檢查是否需要填寫詳細資料 (最高優先級)
      if (userData.needsAdditionalInfo === true) {
        // 清除可能存在的重定向路徑，防止干擾
        sessionStorage.removeItem('redirectAfterLogin')

        console.log(
          '需要填寫詳細資料 [needsAdditionalInfo=true]，優先轉導到註冊第二步頁面'
        )

        // 使用 window.location.href 強制導向
        const redirectUrl = `/member/MemberLogin/register2?isGoogleSignIn=true&googleEmail=${encodeURIComponent(
          googleEmail
        )}&googleName=${encodeURIComponent(googleName || '')}`
        console.log('準備轉導到:', redirectUrl)

        // 立即轉導，不使用 setTimeout
        window.location.href = redirectUrl

        // 阻止後續執行
        return userData
      }

      // 其次檢查是否存在登入前的頁面路徑
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        console.log('存在登入前路徑，轉導到:', redirectPath)
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        // 如果不需要填寫詳細資料且沒有重定向路徑，則轉到會員中心
        console.log('不需要填寫詳細資料且無重定向路徑，轉導到會員中心')
        router.push('/member')
      }
    } catch (error) {
      console.error('Google 登入錯誤:', error)
      throw error // 將錯誤向上傳遞
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

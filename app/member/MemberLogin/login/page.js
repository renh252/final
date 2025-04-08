'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext' // 引入 AuthContext
import styles from './login.module.css'
import Link from 'next/link'
import Swal from 'sweetalert2'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
} from '@/lib/firebase' // 引入 Firebase 相關函式

export default function MemberPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, googleLogin } = useAuth() // 獲取 login 和 googleLogin
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signInError, setSignInError] = useState('')
  const [loadingSubText, setLoadingSubText] = useState('')
  const [googleSignInError, setGoogleSignInError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false)
    })
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
    return () => unsubscribe()
  }, [login])

  const handleGoogleSignIn = async () => {
    setSignInError('')
    try {
      // 檢查現有 redirectAfterLogin，預防之後的問題
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath === '/member') {
        console.log('清除不必要的 redirectAfterLogin: /member')
        sessionStorage.removeItem('redirectAfterLogin')
      } else if (redirectPath) {
        console.log('保留有效的重定向路徑:', redirectPath)
      }

      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      if (user && user.email) {
        const idToken = await user.getIdToken()
        await checkGoogleSignInStatus(user.email, user.displayName, idToken)
      } else {
        console.log('未獲取到 Google 登入的使用者資訊。')
        await Swal.fire({
          title: '登入失敗',
          text: '無法獲取 Google 登入的使用者資訊，請稍後再試。',
          icon: 'error',
          confirmButtonText: '確定',
        })
      }
    } catch (error) {
      console.error('Google 登入失敗：', error)
      setSignInError(error.message || '使用 Google 帳號登入失敗，請稍後再試。')
      await Swal.fire({
        title: '登入失敗',
        text: error.message || '使用 Google 帳號登入失敗，請稍後再試。',
        icon: 'error',
        confirmButtonText: '確定',
      })
    }
  }

  const checkGoogleSignInStatus = async (googleEmail, googleName, idToken) => {
    setLoadingSubText('正在驗證 Google 登入...')

    try {
      // 檢查必要參數
      if (!googleEmail) {
        throw new Error('未獲取到 Google 電子郵件地址')
      }

      // 再次檢查 redirectAfterLogin，確保在 Google 登入過程中沒有被意外設置
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath === '/member') {
        console.log('清除指向會員中心的重定向:', redirectPath)
        sessionStorage.removeItem('redirectAfterLogin')
      }

      console.log('準備調用 googleLogin 方法:', { googleEmail, googleName })

      // 調用 AuthContext 中的 googleLogin 方法
      await googleLogin(googleEmail, idToken, googleName)

      // googleLogin 方法內部已處理頁面跳轉，這裡只需提供成功狀態
      setLoadingSubText('登入成功，準備跳轉...')

      return { success: true }
    } catch (error) {
      console.error('Google 登入處理錯誤:', error)
      setGoogleSignInError(error.message)
      setLoadingSubText(null)

      // 顯示錯誤訊息
      await Swal.fire({
        title: '登入失敗',
        text: error.message || '使用 Google 帳號登入失敗，請稍後再試。',
        icon: 'error',
        confirmButtonText: '確定',
      })
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      await Swal.fire({
        title: '錯誤',
        text: '請填寫所有欄位',
        icon: 'error',
        confirmButtonText: '確定',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        await Swal.fire({
          title: '登入成功！',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })

        localStorage.setItem('token', data.data.token)

        // 檢查是否需要重定向到特定頁面
        const redirectPath = sessionStorage.getItem('redirectAfterLogin')
        if (redirectPath && redirectPath !== '/member') {
          console.log('登入後轉導到重定向路徑:', redirectPath)
          sessionStorage.removeItem('redirectAfterLogin')
          login(data.data)
          router.push(redirectPath)
        } else {
          // 標準登入流程
          sessionStorage.removeItem('redirectAfterLogin') // 確保清除
          login(data.data)
          router.push('/member')
        }
      } else {
        await Swal.fire({
          title: '登入失敗',
          text: data.message || '請檢查您的電子郵件和密碼。',
          icon: 'error',
          confirmButtonText: '確定',
        })
      }
    } catch (error) {
      console.error('登入請求失敗:', error)
      await Swal.fire({
        title: '錯誤',
        text: '登入時發生錯誤，請稍後再試。',
        icon: 'error',
        confirmButtonText: '確定',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>載入中...</div>
  }

  return (
    <>
      <div className={styles.formContainer}>
        <h2 className={styles.sectionTitle}>快速註冊及登入</h2>
        <div className={styles.form}>
          <div className={styles.GFbutton}>
            <button
              className="button"
              style={{
                width: '350px',
                height: '60px',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={handleGoogleSignIn}
            >
              <Image
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/153b2dcd7ca2627a463800e38ebc91cf43bcd541ad79fa3fea9919eec17199df?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                alt="Google icon"
                style={{ width: '30px', height: '30px' }}
                width={30}
                height={30}
              />
              以 Google 帳號註冊及登入
            </button>
            {signInError && <p className={styles.error}>{signInError}</p>}
          </div>
        </div>

        <h2 className={styles.sectionTitle}>登入會員</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              電子信箱 :
            </label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password" className={styles.formLabel}>
              密碼 :
            </label>
            <input
              type="password"
              id="password"
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">記住我</label>
            </div>
            <br />
            <button
              type="submit"
              className="button"
              style={{ width: '200px', height: '50px', fontSize: '28px' }}
            >
              登入
            </button>
          </div>
        </form>
        <br />
        <br />
        <div className={styles.nomember}>
          <p className={styles.loginLink}>
            還沒有會員?
            <Link
              href="/member/MemberLogin/register"
              className={styles.link}
              style={{ fontSize: '22px' }}
            >
              點此註冊
            </Link>
          </p>
          <p className={styles.loginLink}>
            忘記密碼?
            <Link
              href="/member/MemberLogin/forgot"
              className={styles.link}
              style={{ fontSize: '22px' }}
            >
              請點我
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

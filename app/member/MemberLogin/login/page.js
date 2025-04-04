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
    try {
      // 呼叫 Google 登入的 API 端點
      const response = await fetch('/api/member/googleCallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          googleEmail,
          googleName,
          defaultPassword: 'Google@' + googleEmail.split('@')[0], // 創建預設密碼
        }),
      })

      if (!response.ok) {
        throw new Error('登入驗證失敗')
      }

      const data = await response.json()

      // 儲存 token
      if (data.authToken) {
        localStorage.setItem('token', data.authToken)
      }

      // 如果需要填寫詳細資訊
      if (data.needsAdditionalInfo) {
        // 執行登入
        await googleLogin(googleEmail, idToken)
        // 導向到 register2 並帶入必要資訊
        router.push(
          `/member/MemberLogin/register2?isGoogleSignIn=true&googleEmail=${encodeURIComponent(
            googleEmail
          )}`
        )
        return
      }

      // 如果已有詳細資訊，進行正常登入流程
      await googleLogin(googleEmail, idToken)
      router.push('/member')
    } catch (error) {
      console.error('Google 登入回調錯誤:', error)
      await Swal.fire({
        title: 'Google 登入失敗',
        text: error.message || 'Google 登入驗證失敗，請稍後重試。',
        icon: 'error',
        confirmButtonText: '確定',
      })
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
        login(data.data)
        router.push('/member')
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

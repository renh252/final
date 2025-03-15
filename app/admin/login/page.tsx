'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Eye, EyeOff } from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { getManagerPermissions } from '../_lib/permissions'
import styles from './login.module.css'

export default function LoginPage() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, admin, isLoading, preloadPermissions } = useAdmin()

  // 如果已登入，重定向到後台首頁
  useEffect(() => {
    if (admin && !isLoading) {
      router.push('/admin')
    }
  }, [admin, isLoading, router])

  // 處理登入
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 發送登入請求
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || '登入失敗，請檢查帳號和密碼')
      }

      // 預先緩存權限列表 - 使用通用函數處理所有管理員
      const privileges = data.data.admin.privileges || ''
      const managerPerms = getManagerPermissions(privileges)
      localStorage.setItem('admin_permissions', JSON.stringify(managerPerms))

      // 超級管理員特殊處理
      if (privileges === '111') {
        localStorage.setItem(
          'admin_all_permissions',
          JSON.stringify(managerPerms)
        )
      }

      // 使用上下文的 login 方法
      login(data.data.token, data.data.admin)

      // 主動觸發權限預緩存
      setTimeout(() => {
        preloadPermissions()
      }, 100) // 短暫延遲確保login中的狀態已更新

      // 重定向到後台首頁
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || '登入時發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 處理密碼可見性切換
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // 處理密碼可見性按鈕的鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      togglePasswordVisibility()
    }
  }

  // 如果正在檢查登入狀態，顯示載入中
  if (isLoading) {
    return (
      <div className={styles.loginContainer}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">載入中...</span>
          </Spinner>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <Card.Body>
          <div className="text-center mb-4">
            <div className={styles.logoContainer}>
              <Image
                src="/images/logo.png"
                alt="寵物管理系統"
                width={100}
                height={100}
                className={styles.logo}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h3>寵物管理系統</h3>
            <p className="text-muted">後台管理登入</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>管理員帳號</Form.Label>
              <Form.Control
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="請輸入管理員帳號"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>密碼</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  required
                  disabled={loading}
                  aria-describedby="password-toggle"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                  id="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

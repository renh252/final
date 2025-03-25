'use client'

import React from 'react'
import { useAuth } from '@/app/context/AuthContext' // 引入 withAuth 和 useAuth
import styles from '@/app/member/member.module.css' // 引入樣式

export default function ProtectedPage() {
  const { user } = useAuth() // 使用 useAuth 取得用戶資訊

  return (
    <div className={styles.memberContainer}>
      <h1 className={styles.pageTitle}>認證測試頁面</h1>
      <div className={styles.infoCard}>
        <h2>目前登入身分</h2>
        {user ? (
          <div className={styles.userInfo}>
            <p>
              <strong>用戶ID:</strong> {user.id}
            </p>
            <p>
              <strong>姓名:</strong> {user.name || '未設定'}
            </p>
            <p>
              <strong>電子郵件:</strong> {user.email}
            </p>
            <p>
              <strong>身分類型:</strong> {user.role || '一般會員'}
            </p>
            <p>
              <strong>登入狀態:</strong>{' '}
              <span className={styles.statusSuccess}>已登入</span>
            </p>
            <div className={styles.loginTime}>
              <p>
                <strong>登入時間:</strong> {new Date().toLocaleString('zh-TW')}
              </p>
            </div>
          </div>
        ) : (
          <p className={styles.statusError}>
            未登入（此訊息不應該顯示，因為未登入會被重定向）
          </p>
        )}
      </div>
    </div>
  )
}


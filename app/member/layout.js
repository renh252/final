'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '@/app/member/member.module.css'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext' // 引入 useAuth
import { useRouter } from 'next/navigation' // 導向到登入頁面
import MenuRWD from '@/app/member/_components/menuRWD.js'

export default function MemberLayout({ children }) {
  const { user, logout } = useAuth() // 從 useAuth 中獲取 logout
  let user_id = user ? user.id : null

  const router = useRouter()

  const handleLogout = () => {
    logout() // 呼叫登出函數
    router.push('/member/MemberLogin/login') // 確保登出後導向登入頁面
  }

  // 讓我的收藏一職顯示在select
  const [selectedCollection, setSelectedCollection] = useState('')

  const handleCollectionChange = (e) => {
    const selectedValue = e.target.value
    setSelectedCollection(selectedValue)
    if (selectedValue) {
      router.push(`/member/FavoritesList/${selectedValue}`)
    }
  }

  if (!user) {
    return <main>{children}</main> // 如果使用者未登入，只渲染 children
  }

  return (
    <div className={styles.layout}>
      <MenuRWD className={styles.menuRWD} />
      <div className={styles.gridContainer}>
        <div className={styles.logos_grid}>
          <button className="button">
            <Link href={user ? `/member/orders?=${user_id}` : '/member/orders'}>
              我的訂單
            </Link>
          </button>
          <button className="button">
            <Link href="/member/appointments">預約領養</Link>
          </button>
          <select
            className="button"
            onChange={handleCollectionChange}
            value={selectedCollection}
          >
            <option value="" disabled style={{ display: 'none' }}>
              我的收藏
            </option>
            <option value="Pets">寵物</option>
            <option value="products">商品</option>
            <option value="articles">文章</option>
          </select>
          <button className="button">
            <Link href="/forum">我的論壇</Link>
          </button>
          <button className="button">
            <Link
              href={
                user ? `/member/donations?=${user_id}` : '/member/donations'
              }
            >
              我的捐款
            </Link>
          </button>
          <button className="button">
            <Link href="/">回首頁</Link>
          </button>
          <button className="button" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
      <main style={{ margin: '15px auto' }}>{children}</main>
    </div>
  )
}

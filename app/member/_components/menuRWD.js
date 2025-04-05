import ReactDOM from 'react-dom'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import styles from './menuRWD.module.css'
import { FaArrowLeft } from 'react-icons/fa6'
import Image from 'next/image'
import { MdOutlinePets, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useAuth } from '@/app/context/AuthContext' // 引入 useAuth
import { useRouter, usePathname } from 'next/navigation' // 導向到登入頁面

export default function MenuRWD({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth() // 從 useAuth 中獲取 logout
  let user_id = user ? user.id : null
  const pathname = usePathname()
  const router = useRouter()
  const [collectionOpen, setCollectionOpen] = useState(false)

  const handleLogout = () => {
    logout() // 呼叫登出函數
    router.push('/member/MemberLogin/login') // 確保登出後導向登入頁面
  }
  // 監聽路由變化
  useEffect(() => {
    // 當 pathname 變化時，關閉主菜單
    setMenuOpen(false)

    // 檢測是否是收藏相關頁面，如果是則展開收藏選單
    if (pathname.startsWith('/member/FavoritesList/')) {
      setCollectionOpen(true)
    } else {
      setCollectionOpen(false)
    }
  }, [pathname])

  const isActive = useCallback(
    (path) => {
      if (path === '/') {
        return pathname === path
      }
      return pathname.startsWith(path)
    },
    [pathname]
  )

  const isCollectionActive = useCallback(() => {
    return [
      '/member/FavoritesList/Pets',
      '/member/FavoritesList/products',
      '/member/FavoritesList/articles',
    ].some((path) => pathname.startsWith(path))
  }, [pathname])
  const handleCollectionClick = (path) => {
    router.push(path)
    // 點擊後不要立即關閉收藏子選單
    // 但也不需要在這裡設置setCollectionOpen(true)，因為這可能會干擾其他路由變化
  }

  if (!user) {
    return <main>{children}</main> // 如果使用者未登入，只渲染 children
  }

  return ReactDOM.createPortal(
    <>
      <div className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
        <Link href={'/'} className={styles.menuTitle}>
          <FaArrowLeft /> 回首頁
        </Link>
        <button className={isActive('/member/orders') ? styles.active : ''}>
          <Link href={user ? `/member/orders?=${user_id}` : '/member/orders'}>
            我的訂單
          </Link>
        </button>
        <button
          className={isActive('/member/appointments') ? styles.active : ''}
        >
          <Link href="/member/appointments">預約領養</Link>
        </button>
        <div
          className={`${styles.collapsible} ${
            isCollectionActive() ? styles.active : ''
          }`}
        >
          <button onClick={() => setCollectionOpen(!collectionOpen)}>
            <span>我的收藏</span>
            {collectionOpen ? <MdExpandLess /> : <MdExpandMore />}
          </button>
          <div
            className={`${styles.collapsibleContent} ${
              collectionOpen ? styles.open : ''
            }`}
          >
            <button
              className={
                isActive('/member/FavoritesList/Pets') ? styles.active : ''
              }
              onClick={() =>
                handleCollectionClick('/member/FavoritesList/Pets')
              }
            >
              收藏寵物
            </button>
            <button
              className={
                isActive('/member/FavoritesList/products') ? styles.active : ''
              }
              onClick={() =>
                handleCollectionClick('/member/FavoritesList/products')
              }
            >
              收藏商品
            </button>
            <button
              className={
                isActive('/member/FavoritesList/articles') ? styles.active : ''
              }
              onClick={() =>
                handleCollectionClick('/member/FavoritesList/articles')
              }
            >
              收藏文章
            </button>
          </div>
        </div>
        <button className={isActive('/forum') ? styles.active : ''}>
          <Link href="/forum">論壇成就</Link>
        </button>
        <button className={isActive('/member/donations') ? styles.active : ''}>
          <Link
            href={user ? `/member/donations?=${user_id}` : '/member/donations'}
          >
            我的捐款
          </Link>
        </button>
        <button className={isActive('/') ? styles.active : ''}>
          <Link href="/">回首頁</Link>
        </button>
        <button onClick={handleLogout}>登出</button>
      </div>
      <button
        className={`${styles.menuToggle} ${menuOpen ? styles.open : ''}`}
        onClick={() => {
          setMenuOpen(!menuOpen)
        }}
      >
        <MdOutlinePets />
        <p className={styles.verticalText}>{menuOpen ? '關閉' : '選單'}</p>
      </button>
    </>,
    document.body
  )
}

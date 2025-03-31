'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FaChevronUp,
  FaChevronDown,
  FaSignInAlt,
  FaSignOutAlt,
  FaEnvelope ,
} from 'react-icons/fa'
import Link from 'next/link'
import styles from './FloatingAction.module.css'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function FloatingAction() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const containerRef = useRef(null) // 創建 ref 用於引用浮動按鈕容器

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // 處理登入/登出按鈕點擊
  const handleAuthAction = (e) => {
    e.preventDefault()

    if (user) {
      // 已登入狀態：執行登出
      logout()
    } else {
      // 未登入狀態：導向登入頁面
      router.push('/member/MemberLogin/login')
    }

    // 收起浮動選單
    setIsExpanded(false)
  }

  // 監聽點擊事件，當點擊發生在容器外部時收合
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false)
      }
    }

    // 當按鈕展開時，添加點擊事件監聽器
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    // 清理函數：移除事件監聽器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isExpanded]) // 依賴於 isExpanded 狀態

  // 監聽路由變化，當路由變化時收合選單
  useEffect(() => {
    // 創建一個函數來收合選單
    const handleRouteChange = () => {
      setIsExpanded(false)
    }

    // 這裡不需要添加路由監聽，因為在導航時組件會重新渲染

    return () => {
      // 路由變化時收合選單
      handleRouteChange()
    }
  }, [])

  return (
    <div
      ref={containerRef} // 添加 ref
      className={`${styles.floatingContainer} ${
        isExpanded ? styles.expanded : ''
      }`}
    >
      {/* 可展開的按鈕列表，永遠顯示但透過CSS控制可見性 */}
      <div
        className={`${styles.actionButtons} ${
          isExpanded ? styles.visible : ''
        }`}
      >
        {/* 聯絡客服按鈕 */}
        <Link href="/contact" className={styles.actionButton}>
          <FaEnvelope />
        </Link>

        {/* 登入/登出按鈕 */}
        <a href="#" className={styles.actionButton} onClick={handleAuthAction}>
          {user ? <FaSignOutAlt /> : <FaSignInAlt />}
        </a>
      </div>

      {/* 展開/收合的切換按鈕容器 */}
      <div className={styles.toggleButtonContainer}>
        <button
          className={styles.toggleButton}
          onClick={toggleExpand}
          aria-label={isExpanded ? '收合選單' : '展開選單'}
        >
          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>
    </div>
  )
}

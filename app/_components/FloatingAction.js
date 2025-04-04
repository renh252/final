'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FaChevronUp,
  FaChevronDown,
  FaSignInAlt,
  FaSignOutAlt,
  FaEnvelope,
  FaArrowUp,
  FaHeart,
  FaPaw,
  FaShoppingBag,
  FaNewspaper,
} from 'react-icons/fa'
import Link from 'next/link'
import styles from './FloatingAction.module.css'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function FloatingAction() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFavExpanded, setIsFavExpanded] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const containerRef = useRef(null)
  const favButtonRef = useRef(null)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    // 收起收藏選單
    setIsFavExpanded(false)
  }

  // 處理收藏選單展開收合
  const toggleFavorites = (e) => {
    // 移除事件冒泡的阻止
    // e.stopPropagation()
    setIsFavExpanded(!isFavExpanded)
  }

  // 回到頂部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    // 收起選單
    setIsExpanded(false)
    setIsFavExpanded(false)
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
    setIsFavExpanded(false)
  }

  // 監聽點擊事件，當點擊發生在容器外部時收合
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false)
        setIsFavExpanded(false)
      }
    }

    // 當按鈕展開時，添加點擊事件監聽器
    if (isExpanded || isFavExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    // 清理函數：移除事件監聽器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isExpanded, isFavExpanded]) // 依賴於展開狀態

  // 監聽滾動事件，控制回到頂部按鈕的顯示/隱藏
  useEffect(() => {
    const handleScroll = () => {
      // 滾動超過 300px 時顯示回到頂部按鈕
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)

    // 初始化檢查
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 監聽路由變化，當路由變化時收合選單
  useEffect(() => {
    // 創建一個函數來收合選單
    const handleRouteChange = () => {
      setIsExpanded(false)
      setIsFavExpanded(false)
    }

    // 這裡不需要添加路由監聽，因為在導航時組件會重新渲染

    return () => {
      // 路由變化時收合選單
      handleRouteChange()
    }
  }, [])

  return (
    <>
      {/* 主浮動按鈕容器 */}
      <div
        ref={containerRef}
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
          {/* 回到頂部按鈕 */}
          <button
            className={`${styles.actionButton} ${
              !showScrollTop ? styles.hidden : ''
            }`}
            onClick={scrollToTop}
            aria-label="回到頂部"
          >
            <FaArrowUp />
          </button>

          {/* 收藏功能按鈕 */}
          <div className={styles.favoriteWrapper}>
            <button
              ref={favButtonRef}
              className={`${styles.actionButton} ${styles.favoriteToggle} ${
                isFavExpanded ? styles.active : ''
              }`}
              onClick={toggleFavorites}
              aria-label="我的收藏"
            >
              <FaHeart />
            </button>

            {/* 收藏功能扇形選單 - 直接嵌入在收藏按鈕內 */}
            <div
              className={`${styles.favoriteMenu} ${
                isFavExpanded ? styles.expanded : ''
              }`}
            >
              <Link
                href="/member/FavoritesList/Pets"
                className={`${styles.favoriteButton} ${styles.favPets}`}
              >
                <FaPaw />
                <span className={styles.buttonLabel}>收藏寵物</span>
              </Link>

              <Link
                href="/member/FavoritesList/products"
                className={`${styles.favoriteButton} ${styles.favProducts}`}
              >
                <FaShoppingBag />
                <span className={styles.buttonLabel}>收藏商品</span>
              </Link>

              <Link
                href="/member/FavoritesList/articles"
                className={`${styles.favoriteButton} ${styles.favArticles}`}
              >
                <FaNewspaper />
                <span className={styles.buttonLabel}>收藏文章</span>
              </Link>
            </div>
          </div>

          {/* 聯絡客服按鈕 */}
          <Link href="/contact" className={styles.actionButton}>
            <FaEnvelope />
          </Link>

          {/* 登入/登出按鈕 */}
          <a
            href="#"
            className={styles.actionButton}
            onClick={handleAuthAction}
          >
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
    </>
  )
}

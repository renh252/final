'use client'

import { useState } from 'react'
import { LuShoppingCart, LuMessageSquare } from 'react-icons/lu'
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'
import Link from 'next/link'
import styles from './FloatingAction.module.css'
import { useAuth } from '@/app/context/AuthContext'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function FloatingAction() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuth()
  const userId = user?.id

  // 獲取購物車數據
  const { data: cartData } = useSWR(
    userId ? `/api/shop/cart?userId=${userId}` : null,
    fetcher
  )
  const totalQuantity = cartData?.totalQuantity || 0

  // 計算所有通知的總數量 (目前只有購物車)
  const allNotificationsCount = totalQuantity

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
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
          <LuMessageSquare />
        </Link>

        {/* 購物車按鈕 */}
        <Link href="/shop/cart" className={styles.actionButton}>
          <LuShoppingCart />
          {totalQuantity > 0 && (
            <div className={styles.cartCount}>{totalQuantity}</div>
          )}
        </Link>
      </div>

      {/* 展開/收合的切換按鈕容器 */}
      <div className={styles.toggleButtonContainer}>
        <button
          className={styles.toggleButton}
          onClick={toggleExpand}
          aria-label={isExpanded ? '收合選單' : '展開選單'}
        >
          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
          {!isExpanded && allNotificationsCount > 0 && (
            <div className={styles.toggleButtonCount}>
              {allNotificationsCount}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

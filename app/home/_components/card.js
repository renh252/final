// app/home/components/PetCard.jsx
'use client'

import Image from 'next/image'
import styles from './card.module.css'
import { useState, useRef, useEffect } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'
import Link from 'next/link'

export default function PetCard({ pet, onToggleFavorite }) {
  const [isFavorite, setIsFavorite] = useState(pet.isFavorite || false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [flyingHeartStyle, setFlyingHeartStyle] = useState({})
  const heartRef = useRef(null)
  const { user } = useAuth()

  // 計算飛行心形的終點位置 (懸浮按鈕位置)
  useEffect(() => {
    const calculateEndPosition = () => {
      // 獲取視窗大小
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // 計算懸浮按鈕的位置 (右下角)
      // 這裡的偏移值需要根據實際的懸浮按鈕位置調整
      const endX = windowWidth - 60 // 右邊距離窗口的距離
      const endY = windowHeight - 60 // 下邊距離窗口的距離

      return { endX, endY }
    }

    // 設置監聽視窗大小變化
    const handleResize = () => {
      const { endX, endY } = calculateEndPosition()
      setFlyingHeartStyle({
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
      })
    }

    // 初始計算
    handleResize()

    // 添加視窗大小變化監聽器
    window.addEventListener('resize', handleResize)

    // 組件卸載時清理
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 處理收藏功能
  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // 檢查用戶是否已登入
    if (!user) {
      alert('請先登入才能將寵物加入收藏')
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      window.location.href = '/member/MemberLogin/login'
      return
    }

    // 如果是加入收藏，才觸發動畫
    if (!isFavorite) {
      // 獲取心形按鈕的位置作為動畫起點
      if (heartRef.current) {
        const heartRect = heartRef.current.getBoundingClientRect()
        const startX = heartRect.left + heartRect.width / 2
        const startY = heartRect.top + heartRect.height / 2

        // 更新飛行心形的起始位置
        setFlyingHeartStyle((prev) => ({
          ...prev,
          '--start-x': `${startX}px`,
          '--start-y': `${startY}px`,
        }))
      }

      setShowAnimation(true)

      // 1秒後重置動畫狀態
      setTimeout(() => {
        setShowAnimation(false)
      }, 1000)
    }

    // 更新本地收藏狀態
    setIsFavorite(!isFavorite)

    // 調用父組件的處理函數
    if (onToggleFavorite) {
      onToggleFavorite(pet.id, !isFavorite)
    }
  }

  return (
    <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={`${styles.cardLink} ${styles.flexItem}`}
                      >
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={pet.main_photo || '/images/default_no_pet.jpg'}
          alt={pet.name}
          layout="fill"
          objectFit="cover"
          className={styles.image}
          priority
        />

        {/* 收藏按鈕 */}
        <button
          className={styles.favoriteButton}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
          ref={heartRef}
        >
          {isFavorite ? (
            <FaHeart className={styles.heartIcon} />
          ) : (
            <FaRegHeart className={styles.heartIcon} />
          )}
        </button>

        {/* 愛心飛行動畫 */}
        {showAnimation && (
          <div className={styles.flyingHeart} style={flyingHeartStyle}>
            <FaHeart />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{pet.name}</h3>
        <p className={styles.detail}>品種：{pet.variety}</p>
        <p className={styles.detail}>
          年齡：{pet.age}・{pet.gender}
        </p>
        <p className={styles.detail}>地點：{pet.location}</p>
      </div>
    </div>
    </Link>
  )
}

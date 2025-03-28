'use client'

import { useState, useEffect, useId } from 'react'
import styles from './CatPawToggle.module.css'

const CatPawToggle = ({
  readingProgress = 0,
  isEnabled = false,
  onToggle,
  size = '4rem',
  furColor = '#444',
  padColor = '#FFA5A5',
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const uid = useId()

  const handleToggle = () => {
    if (readingProgress < 100) {
      // 如果閱讀進度未達100%，觸發搖動動畫
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 820) // 動畫結束後重置
      return
    }

    if (isPlaying) return
    startCatAnimation()
  }

  const startCatAnimation = async () => {
    setIsPlaying(true)
    // 動畫結束後才切換狀態
    setTimeout(() => {
      onToggle(!isEnabled)
      setIsPlaying(false)
    }, 600)
  }

  return (
    <div className={styles.toggleContainer} style={{ height: size }}>
      {/* 貓爪 SVG */}
      <div className={`${styles.catPaw} ${isEnabled ? styles.mirror : ''}`}>
        <svg
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.arm}
        >
          <path
            d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
            stroke={furColor}
            strokeWidth="80"
            strokeLinecap="round"
          />
        </svg>

        <svg
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.elbow}
        >
          <path
            d="M322 75C345 75 383.5 75 399.5 75"
            stroke={furColor}
            strokeWidth="80"
            strokeLinecap="round"
          />
          <g>
            <path
              d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
              fill={padColor}
            />
            <path
              d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
              fill={padColor}
            />
            <path
              d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
              fill={padColor}
            />
            <path
              d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
              fill={padColor}
            />
            <path
              d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
              fill={padColor}
            />
          </g>
        </svg>
      </div>

      <button
        className={`${styles.catToggle} 
                  ${isEnabled ? styles.enabled : ''} 
                  ${isAnimating ? styles.shake : ''}
                  ${isPlaying ? styles.playing : ''}`}
        onClick={handleToggle}
        aria-checked={isEnabled}
        role="switch"
      >
        {/* 貓耳朵 */}
        <div className={styles.ears}>
          <span className={styles.earLeft}></span>
          <span className={styles.earRight}></span>
        </div>

        {/* 貓臉 */}
        <div className={styles.face}>
          {/* 眼睛 */}
          <div className={styles.eyes}>
            <span className={styles.eye}></span>
            <span className={styles.eye}></span>
          </div>
          {/* 鼻子 */}
          <div className={styles.nose}></div>
          {/* 鬍鬚 */}
          <div className={styles.whiskers}>
            <div className={styles.whiskerLeft}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={styles.whiskerRight}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* 閱讀進度條 */}
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
      </button>
    </div>
  )
}

export default CatPawToggle

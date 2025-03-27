'use client'

import { useState, useEffect } from 'react'
import styles from './CatPawToggle.module.css'

const CatPawToggle = ({ readingProgress = 0, isEnabled = false, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    if (readingProgress < 100) {
      // 如果閱讀進度未達100%，觸發搖動動畫
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 820) // 動畫結束後重置
      return
    }

    onToggle(!isEnabled)
  }

  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.catToggle} 
                  ${isEnabled ? styles.enabled : ''} 
                  ${isAnimating ? styles.shake : ''}`}
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

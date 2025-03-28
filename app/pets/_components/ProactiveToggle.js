'use client'

import { useState, useEffect } from 'react'
import styles from './ProactiveToggle.module.css'

/**
 * 主動式強制閱讀 Toggle 元件
 * @param {Object} props
 * @param {number} props.readingProgress - 閱讀進度百分比 (0-100)
 * @param {boolean} props.isEnabled - 開關狀態
 * @param {function} props.onToggle - 切換回調函數
 * @param {boolean} props.forceComplete - 是否強制閱讀完畢才能開啟 (預設: true)
 * @param {string} props.color - 主題顏色 (預設: #3f51b5)
 * @param {string} props.size - 尺寸 'small', 'medium', 'large' (預設: 'medium')
 */
const ProactiveToggle = ({
  readingProgress = 0,
  isEnabled = false,
  onToggle,
  forceComplete = true,
  color = '#3f51b5',
  size = 'medium',
}) => {
  const [showWarning, setShowWarning] = useState(false)
  const [warningTimeout, setWarningTimeout] = useState(null)

  // 清除警告訊息計時器
  useEffect(() => {
    return () => {
      if (warningTimeout) clearTimeout(warningTimeout)
    }
  }, [warningTimeout])

  // 處理點擊事件
  const handleToggle = () => {
    // 如果需要強制閱讀完畢，且閱讀進度未到100%
    if (forceComplete && readingProgress < 100 && !isEnabled) {
      // 顯示警告訊息
      setShowWarning(true)

      // 3秒後自動隱藏警告訊息
      const timeout = setTimeout(() => {
        setShowWarning(false)
      }, 3000)

      setWarningTimeout(timeout)
      return
    }

    // 呼叫父元件回調
    onToggle(!isEnabled)
  }

  // 根據尺寸設定類別名稱
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return styles.small
      case 'large':
        return styles.large
      default:
        return styles.medium
    }
  }

  return (
    <div className={styles.toggleContainer}>
      <div className={`${styles.toggle} ${getSizeClass()}`}>
        {/* 閱讀進度條 */}
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{
              width: `${readingProgress}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>

        {/* Toggle 開關 */}
        <button
          className={`${styles.toggleButton} ${isEnabled ? styles.active : ''}`}
          onClick={handleToggle}
          aria-checked={isEnabled}
          role="switch"
          style={{
            borderColor: isEnabled ? color : '#ccc',
            backgroundColor: isEnabled ? color : '#f5f5f5',
          }}
        >
          <span
            className={styles.toggleKnob}
            style={{
              backgroundColor: isEnabled ? '#fff' : '#fff',
            }}
          ></span>
        </button>

        {/* 警告訊息 */}
        {showWarning && (
          <div className={styles.warning}>
            <span>請先閱讀完整內容才能開啟</span>
          </div>
        )}
      </div>

      {/* 閱讀進度指示 */}
      <div className={styles.progressInfo}>
        <span className={styles.progressText}>已閱讀: {readingProgress}%</span>
        {readingProgress < 100 && forceComplete && (
          <span className={styles.progressHint}>(需閱讀完整內容)</span>
        )}
      </div>
    </div>
  )
}

export default ProactiveToggle

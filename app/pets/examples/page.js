'use client'

import { useState, useEffect } from 'react'
import CatPawToggle from '../_components/CatPawToggle'
import styles from './page.module.css'

export default function ExamplesPage() {
  // 基本用法
  const [basicValue, setBasicValue] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true) // 預設為禁用狀態，這樣可以看到貓掌搗亂

  // 自定義樣式示例
  const customStyles = [
    {
      size: '3rem',
      furColor: '#DFC57B',
      padColor: '#FFA5A5',
      disabled: false,
    },
    {
      size: '6rem',
      furColor: '#8D6F64',
      padColor: '#000',
      disabled: false,
    },
    {
      size: '4rem',
      furColor: '#F3F2F2',
      padColor: '#FFA5A5',
      disabled: false,
    },
  ]

  // 領養同意示例
  const [readRate, setReadRate] = useState(0)
  const [hasRead, setHasRead] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setReadRate((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.container}>
      {/* 基本用法 */}
      <section className={styles.section}>
        <h2>基本用法</h2>
        <div className={styles.demo}>
          <div className={styles.demoItem}>
            <CatPawToggle
              isEnabled={basicValue}
              onToggle={setBasicValue}
              disabled={isDisabled}
              size="4rem"
            />
            <div className={styles.demoDescription}>
              <p>點擊開關，貓掌會搗亂！</p>
              <p className={styles.hint}>
                {isDisabled
                  ? '目前處於禁用狀態，貓掌會阻止你切換開關'
                  : '已啟用，可以正常切換'}
              </p>
            </div>
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
            />
            <span>切換禁用狀態（禁用時貓掌會搗亂）</span>
          </label>
        </div>
      </section>

      {/* 自定義樣式 */}
      <section className={styles.section}>
        <h2>自定義樣式</h2>
        <p className={styles.sectionDescription}>
          點擊以下開關，觀察不同樣式的貓掌動畫效果
        </p>
        <div className={styles.customDemo}>
          {customStyles.map((style, index) => (
            <div key={index} className={styles.demoItem}>
              <CatPawToggle isEnabled={false} onToggle={() => {}} {...style} />
              <div className={styles.styleInfo}>
                <p>大小: {style.size}</p>
                <p>
                  毛色:{' '}
                  <span style={{ color: style.furColor }}>
                    {style.furColor}
                  </span>
                </p>
                <p>
                  肉掌:{' '}
                  <span style={{ color: style.padColor }}>
                    {style.padColor}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 領養同意書示例 */}
      <section className={styles.section}>
        <h2>領養同意書</h2>
        <div className={styles.termsDemo}>
          <div className={styles.termsContent}>
            <h3>📋 寵物領養同意書</h3>
            <p>親愛的領養人，請仔細閱讀以下內容：</p>
            <ol>
              <li>我承諾會給予寵物足夠的關愛和照顧</li>
              <li>我了解領養是一輩子的承諾</li>
              <li>我會定期帶寵物進行健康檢查</li>
              <li>我會為寵物提供安全的生活環境</li>
              <li>我會遵守相關法規並為寵物植入晶片</li>
            </ol>
          </div>

          <div className={styles.termsFooter}>
            <div className={styles.readProgress}>
              <span>閱讀進度：{readRate.toFixed(1)}%</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${readRate}%` }}
                />
              </div>
              <p className={styles.hint}>
                {readRate < 100
                  ? '請完整閱讀內容，貓掌會阻止你切換開關'
                  : '已完成閱讀，可以切換開關了'}
              </p>
            </div>

            <label className={styles.termsToggleLabel}>
              <span>我已詳閱並同意以上內容</span>
              <CatPawToggle
                isEnabled={hasRead}
                onToggle={setHasRead}
                disabled={readRate < 100}
                size="2.5rem"
                furColor="#4CAF50"
                padColor="#E8F5E9"
              />
            </label>

            {hasRead && (
              <div className={styles.thankYou}>
                感謝您的同意！我們很期待與您一起為浪浪創造更好的未來 (*´∀`)~♥
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

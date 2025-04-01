'use client'

import { useState, useEffect } from 'react'
import CatPawToggle from '../_components/CatPawToggle'
import styles from './page.module.css'

export default function ExamplesPage() {
  // 基本用法
  const [basicValue, setBasicValue] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true) // 預設為禁用狀態，這樣可以看到貓掌搗亂

  // 自定義樣式示例
  const [customValues, setCustomValues] = useState([false, true, false])
  const customStyles = [
    {
      size: '3rem',
      furColor: '#DFC57B',
      padColor: '#FFA5A5',
      disabled: true,
    },
    {
      size: '6rem',
      furColor: '#8D6F64',
      padColor: '#000',
      disabled: true,
    },
    {
      size: '4rem',
      furColor: '#F3F2F2',
      padColor: '#FFA5A5',
      disabled: true,
    },
  ]

  // 領養同意示例
  const [readRate, setReadRate] = useState(0)
  const [hasRead, setHasRead] = useState(false)

  // 更新自定義樣式的開關值
  const handleCustomToggle = (index, value) => {
    const newValues = [...customValues]
    newValues[index] = value
    setCustomValues(newValues)
  }

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
      {/* 頁面標題和說明 */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>主動的開關 CatPawToggle</h1>
        <p className={styles.pageDescription}>
          這個元件是基於「Useless Machine」概念設計的toggle開關。
          <br />
          當開關處於<strong>禁用狀態</strong>
          時，貓掌會搗亂並將開關切回原始位置。
        </p>
      </div>

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
              <p>點擊開關觀察貓掌的反應！</p>
              <p className={styles.hint}>
                {isDisabled
                  ? '目前處於禁用狀態，貓掌會阻止你切換開關'
                  : '已啟用，可以正常切換（沒有貓掌搗亂）'}
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

      {/* 工作原理 */}
      <section className={styles.section}>
        <h2>工作原理</h2>
        <div className={styles.principles}>
          <div className={styles.principleItem}>
            <h3>1. 正常模式（非禁用）</h3>
            <p>開關表現為普通的toggle，點擊時正常切換狀態。</p>
            <div className={styles.principleDemo}>
              <CatPawToggle
                isEnabled={false}
                onToggle={() => {}}
                disabled={false}
                size="3rem"
              />
              <span className={styles.arrow}>→</span>
              <CatPawToggle
                isEnabled={true}
                onToggle={() => {}}
                disabled={false}
                size="3rem"
              />
            </div>
          </div>
          <div className={styles.principleItem}>
            <h3>2. 禁用模式</h3>
            <p>點擊時，開關先切換，然後貓掌伸出把開關切回原狀。</p>
            <div className={styles.principleAnimated}>
              <div className={styles.animationStep}>
                <p>步驟 1: 點擊開關</p>
                <CatPawToggle
                  isEnabled={false}
                  onToggle={() => {}}
                  disabled={true}
                  size="3rem"
                />
              </div>
              <span className={styles.arrow}>→</span>
              <div className={styles.animationStep}>
                <p>步驟 2: 開關先切換</p>
                <CatPawToggle
                  isEnabled={true}
                  onToggle={() => {}}
                  disabled={true}
                  size="3rem"
                />
              </div>
              <span className={styles.arrow}>→</span>
              <div className={styles.animationStep}>
                <p>步驟 3: 貓掌搗亂</p>
                <div className={styles.pawAnimation}>
                  <CatPawToggle
                    isEnabled={false}
                    onToggle={() => {}}
                    disabled={true}
                    size="3rem"
                  />
                  <div className={styles.pawIcon}>🐾</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 自定義樣式 */}
      <section className={styles.section}>
        <h2>自定義樣式</h2>
        <p className={styles.sectionDescription}>
          點擊以下開關，觀察不同樣式的貓掌動畫效果（所有開關都設為禁用狀態）
        </p>
        <div className={styles.customDemo}>
          {customStyles.map((style, index) => (
            <div key={index} className={styles.demoItem}>
              <CatPawToggle
                isEnabled={customValues[index]}
                onToggle={(value) => handleCustomToggle(index, value)}
                {...style}
              />
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
        <h2>應用：領養同意書</h2>
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

      {/* 組件結構 */}
      <section className={styles.section}>
        <h2>組件結構</h2>
        <p className={styles.sectionDescription}>
          想了解更多貓掌開關的內部結構嗎？查看我們的
          <a href="/pets/examples/cat-paw-parts" className={styles.link}>
            貓掌組件分解頁面
          </a>
          ，探索如何實現這個有趣的效果。
        </p>
      </section>
    </div>
  )
}

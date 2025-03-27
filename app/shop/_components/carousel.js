'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import styles from './carousel.module.css' // 引入外部 CSS

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Carousel() {
  const { data, error } = useSWR('/api/shop', fetcher)
  const promotions = data?.promotions || []

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % promotions.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [promotions.length])

  if (error) return <div>載入失敗...</div>
  if (!data) return <div>載入中...</div>
  if (promotions.length === 0) return <div>目前沒有促銷資訊</div>

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselInner}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {promotions.map((item, index) => (
          <div key={index} className={styles.carouselItem}>
            <img src={item.image || 'images/banner-new.jpg'} alt={item.promotion_name} className={styles.carouselImage} />
            <div className={styles.carouselCaption}>
              <h3>{item.promotion_name}</h3>
              <p>{item.promotion_description}</p>
              <a href={`/shop/promotions/${item.promotion_id}`} className={styles.carouselLink}>
                查看活動
              </a>
              {/* <h3 className={styles.promotionName}>{item.promotion_name}</h3>
              <p className={styles.promotionDescription}>{item.promotion_description}</p> */}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.prevButton} onClick={() => setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length)}>❮</button>
      <button className={styles.nextButton} onClick={() => setCurrentIndex((prev) => (prev + 1) % promotions.length)}>❯</button>

      <div className={styles.dots}>
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

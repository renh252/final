// app/home/components/SimplePetCarousel.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import PetCard from './card'
import styles from './petCarousel.module.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function SimplePetCarousel() {
  const { data } = useSWR('/api/pets?type=meta', fetcher)
  const pets = data?.latestPets || []

  const visibleCount = 3
  const cardWidth = 320
  const gap = 24
  const itemWidth = cardWidth + gap

  const [currentIndex, setCurrentIndex] = useState(visibleCount)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const intervalRef = useRef(null)

  const loopedPets = [...pets, ...pets, ...pets] // 複製三份以便無限滑動
  const centerOffset = pets.length // 中央索引偏移量

  // 初始化 currentIndex 為中央索引
  useEffect(() => {
    setCurrentIndex(centerOffset)
  }, [centerOffset])

  // 自動滑動 (hover 暫停)
  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 5000)
    }

    const stopAutoSlide = () => clearInterval(intervalRef.current)
    const container = containerRef.current

    if (container) {
      container.addEventListener('mouseenter', stopAutoSlide)
      container.addEventListener('mouseleave', startAutoSlide)
    }

    startAutoSlide()
    return () => {
      stopAutoSlide()
      if (container) {
        container.removeEventListener('mouseenter', stopAutoSlide)
        container.removeEventListener('mouseleave', startAutoSlide)
      }
    }
  }, [])

  // 無限滑動邏輯：到尾部或開頭時，瞬移到中心
  useEffect(() => {
    if (currentIndex >= loopedPets.length - visibleCount || currentIndex <= 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        requestAnimationFrame(() => {
          setCurrentIndex(centerOffset)
        })
      }, 600)
      return () => clearTimeout(timeout)
    } else {
      setIsTransitioning(true)
    }
  }, [currentIndex, loopedPets.length, centerOffset])

  // 手機觸控滑動
  useEffect(() => {
    let startX = 0
    let isDragging = false

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX
      isDragging = true
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return
      const diff = e.touches[0].clientX - startX
      if (Math.abs(diff) > 50) {
        setCurrentIndex((prev) => prev + (diff > 0 ? -1 : 1))
        isDragging = false
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart)
      container.addEventListener('touchmove', handleTouchMove)
    }
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <section className={styles.carouselSection}>
      <div className={styles.headerWrap}>
        <h2 className={styles.title}>毛孩們</h2>
        <p className={styles.subtitle}>領養代替購買，給浪浪一個家</p>
      </div>
      <div className={styles.carouselContainer} ref={containerRef}>
        <button className={styles.navButton} onClick={handlePrev}>
          ‹
        </button>
        <div className={styles.viewport}>
          <div
            className={styles.track}
            ref={trackRef}
            style={{
              transform: `translateX(-${currentIndex * itemWidth}px)`,
              transition: isTransitioning ? 'transform 0.6s ease' : 'none',
            }}
          >
            {loopedPets.map((pet, index) => (
              <div className={styles.slide} key={`${pet.id}-${index}`}>
                <PetCard pet={pet} />
              </div>
            ))}
          </div>
        </div>
        <button className={styles.navButton} onClick={handleNext}>
          ›
        </button>
      </div>
    </section>
  )
}

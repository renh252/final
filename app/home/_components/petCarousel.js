'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import PetCard from './card'
import styles from './petCarousel.module.css'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function SimplePetCarousel() {
  const { data } = useSWR('/api/pets?type=meta', fetcher)
  const pets = data?.latestPets || []

  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const intervalRef = useRef(null)

  const [itemWidth, setItemWidth] = useState(384) // 卡片寬 + 間距
  const [visibleCount, setVisibleCount] = useState(5)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [leftSpacer, setLeftSpacer] = useState(0)

  const updateLayout = () => {
    const width = window.innerWidth
    if (width <= 480) {
      const cardWidth = 300
      const spacer = (width - cardWidth) / 2
      setItemWidth(cardWidth + 24)
      setVisibleCount(1)
      setLeftSpacer(spacer > 0 ? spacer : 0)
    } else if (width <= 768) {
      setItemWidth(220 + 24)
      setVisibleCount(2)
      setLeftSpacer(0)
    } else if (width <= 1024) {
      setItemWidth(280 + 24)
      setVisibleCount(3)
      setLeftSpacer(0)
    } else {
      setItemWidth(320 + 24)
      setVisibleCount(5)
      setLeftSpacer(0)
    }
  }

  useEffect(() => {
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const loopedPets = [...pets, ...pets, ...pets]
  const centerOffset = pets.length

  useEffect(() => {
    setCurrentIndex(centerOffset)
  }, [centerOffset])

  useEffect(() => {
    const start = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 5000)
    }
    const stop = () => clearInterval(intervalRef.current)

    const node = containerRef.current
    if (node) {
      node.addEventListener('mouseenter', stop)
      node.addEventListener('mouseleave', start)
    }
    start()
    return () => {
      stop()
      if (node) {
        node.removeEventListener('mouseenter', stop)
        node.removeEventListener('mouseleave', start)
      }
    }
  }, [])

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
  }, [currentIndex, loopedPets.length, centerOffset, visibleCount])

  const handleNext = () => setCurrentIndex((prev) => prev + 1)
  const handlePrev = () => setCurrentIndex((prev) => prev - 1)

  return (
    <section className={styles.carouselSection}>
      <div className={styles.headerWrap}>
        <h2 className={styles.title}>毛孩推薦區</h2>
        <p className={styles.subtitle}>領養代替購買，給浪浪一個家</p>
      </div>
      <div className={styles.carouselContainer} ref={containerRef}>
        <button className={styles.navButton} onClick={handlePrev}>
          <FaAngleLeft />
        </button>
        <div className={styles.viewport}>
          <div
            className={styles.track}
            ref={trackRef}
            style={{
              transform: `translateX(calc(${leftSpacer}px - ${currentIndex * itemWidth}px))`,
              transition: isTransitioning ? 'transform 0.6s ease' : 'none',
            }}
          >
            {loopedPets.map((pet, index) => (
              <div
                className={styles.slide}
                key={`${pet.id}-${index}`}
                style={{ width: itemWidth - 24, marginRight: 24 }}
              >
                <PetCard pet={pet} />
              </div>
            ))}
          </div>
        </div>
        <button className={styles.navButton} onClick={handleNext}>
          <FaAngleRight />
        </button>
      </div>
    </section>
  )
}

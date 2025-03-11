'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './pet-detail.module.css'
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'

export default function PetDetailPage() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    async function fetchPet() {
      try {
        const response = await fetch(`/api/pets/${id}`)
        if (!response.ok) {
          throw new Error('無法獲取寵物資料')
        }
        const data = await response.json()
        setPet(data.pet)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [id])

  // 處理照片輪播
  const nextPhoto = () => {
    if (pet?.photos && pet.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === pet.photos.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevPhoto = () => {
    if (pet?.photos && pet.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === 0 ? pet.photos.length - 1 : prevIndex - 1
      )
    }
  }

  // 獲取當前顯示的照片 URL
  const getCurrentPhotoUrl = () => {
    if (pet?.photos && pet.photos.length > 0) {
      return pet.photos[currentPhotoIndex].photo_url
    }
    return pet?.main_photo || '/images/default_no_pet.jpg'
  }

  if (loading) return <div className={styles.container}>載入中...</div>

  if (error || !pet) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            title="找不到此寵物"
            items={[{ label: '寵物列表', href: '/pets' }]}
          />
          <Link href="/pets" className={styles.backButton}>
            <FaArrowLeft /> 返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          title={pet.name}
          items={[
            { label: '寵物列表', href: '/pets' },
            { label: pet.variety, href: `/pets?breed=${pet.variety}` },
          ]}
        />
        <Link href="/pets" className={styles.backButton}>
          <FaArrowLeft /> 返回列表
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <Image
            src={getCurrentPhotoUrl()}
            alt={pet.name}
            fill
            className={styles.image}
            priority
          />
          {pet?.photos && pet.photos.length > 1 && (
            <>
              <button
                className={`${styles.photoNavButton} ${styles.prevButton}`}
                onClick={prevPhoto}
                aria-label="上一張照片"
              >
                <FaChevronLeft />
              </button>
              <button
                className={`${styles.photoNavButton} ${styles.nextButton}`}
                onClick={nextPhoto}
                aria-label="下一張照片"
              >
                <FaChevronRight />
              </button>
              <div className={styles.photoIndicator}>
                {pet.photos.map((_, index) => (
                  <span
                    key={index}
                    className={`${styles.dot} ${
                      index === currentPhotoIndex ? styles.activeDot : ''
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.name}>{pet.name}</h1>
          <p className={styles.breed}>{pet.variety}</p>

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <FaBirthdayCake />
              <span>{pet.age}</span>
            </div>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt />
              <span>{pet.location}</span>
            </div>
          </div>

          <div className={styles.description}>
            <h2>關於 {pet.name}</h2>
            <p>
              {pet.name} 是一隻{pet.age}的{pet.variety}，目前在{pet.location}
              等待一個溫暖的家。
            </p>
            <p>{pet.story || `${pet.name}性格溫順，非常適合家庭飼養。`}</p>
          </div>

          <button className={styles.adoptButton}>我想領養</button>
        </div>
      </div>
    </div>
  )
}

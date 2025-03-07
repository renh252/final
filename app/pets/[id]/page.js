'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './pet-detail.module.css'
import { FaArrowLeft, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'

export default function PetDetailPage() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPet() {
      try {
        const response = await fetch(`/api/pet-data/${id}`)
        if (!response.ok) {
          throw new Error('寵物資料獲取失敗')
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
            src={pet.image_url || '/images/default_no_pet.jpg'}
            alt={pet.name}
            fill
            className={styles.image}
            priority
          />
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

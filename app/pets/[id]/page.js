'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './pet-detail.module.css'
import petsData from '../_components/data.json'
import { FaArrowLeft, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'

export default function PetDetailPage() {
  const { id } = useParams()
  const pet = petsData.pets.find((p) => p.id === parseInt(id))

  if (!pet) {
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
            { label: pet.breed, href: `/pets?breed=${pet.breed}` },
          ]}
        />
        <Link href="/pets" className={styles.backButton}>
          <FaArrowLeft /> 返回列表
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <Image
            src={pet.image}
            alt={pet.name}
            fill
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.details}>
          <h1 className={styles.name}>{pet.name}</h1>
          <p className={styles.breed}>{pet.breed}</p>

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <FaBirthdayCake />
              <span>{pet.age} 歲</span>
            </div>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt />
              <span>{pet.location}</span>
            </div>
          </div>

          <div className={styles.description}>
            <h2>關於 {pet.name}</h2>
            <p>
              {pet.name} 是一隻{pet.age}歲的{pet.breed}， 目前在{pet.location}
              等待一個溫暖的家。
              {pet.name}性格溫順，非常適合家庭飼養。
            </p>
          </div>

          <button className={styles.adoptButton}>我想領養</button>
        </div>
      </div>
    </div>
  )
}

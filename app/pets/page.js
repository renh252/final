'use client'

import Image from 'next/image'
import React, { useRef } from 'react'
import styles from './pets.module.css'
import PetCard from './_components/pet-card'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import petsData from './_components/data.json'
import Link from 'next/link'
import { Breadcrumbs } from '../_components/breadcrumbs'
import Button from '@/app/_components/ui/Button'

export default function PetsPage() {
  const latestRef = useRef(null)
  const popularRef = useRef(null)

  const scroll = (direction, ref) => {
    const container = ref.current
    const cardWidth = 280 // 卡片寬度
    const gap = 30 // gap 值轉換為像素
    const scrollAmount = (cardWidth + gap) * 4 // 每次滾動四個卡片的寬度加上間距

    const currentScroll = container.scrollLeft
    const targetScroll = currentScroll + direction * scrollAmount

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  return (
    <>
      <div className={styles.banner}>
        <Image
          src="/images/Banner.jpg"
          alt="寵物領養橫幅"
          layout="responsive"
          width={100}
          height={200}
          priority
        />
        <div className={styles.banner_title}>寵物領養</div>
      </div>

      <div className={styles.container}>
        <div className={styles.breadcrumbContainer}>
          <Breadcrumbs
            title="寵物領養"
            items={[
              {
                label: '寵物領養',
                href: '/pets',
              },
            ]}
          />
        </div>

        <main>
          <div className={styles.cardSections}>
            {/* 最新上架區 */}
            <div className={styles.contain}>
              <div className={styles.contain_title}>
                <h2>最新上架</h2>
              </div>
              <div className={styles.group}>
                <div className={styles.groupBody}>
                  <Button
                    variant="outline"
                    size="small"
                    className={styles.scrollButton}
                    onClick={() => scroll(-1, latestRef)}
                    aria-label="向左滑動"
                  >
                    <FaAngleLeft />
                  </Button>
                  <div className={styles.cardGroup} ref={latestRef}>
                    {petsData.pets.map((pet) => (
                      <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={styles.cardLink}
                      >
                        <PetCard
                          image={pet.image}
                          name={pet.name}
                          breed={pet.breed}
                          age={pet.age}
                          location={pet.location}
                        />
                      </Link>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    className={styles.scrollButton}
                    onClick={() => scroll(1, latestRef)}
                    aria-label="向右滑動"
                  >
                    <FaAngleRight />
                  </Button>
                </div>
              </div>
            </div>

            {/* 熱門領養區 */}
            <div className={styles.contain}>
              <div className={styles.contain_title}>
                <h2>熱門領養</h2>
              </div>
              <div className={styles.group}>
                <div className={styles.groupBody}>
                  <Button
                    variant="outline"
                    size="small"
                    className={styles.scrollButton}
                    onClick={() => scroll(-1, popularRef)}
                    aria-label="向左滑動"
                  >
                    <FaAngleLeft />
                  </Button>
                  <div className={styles.cardGroup} ref={popularRef}>
                    {petsData.pets.map((pet) => (
                      <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={styles.cardLink}
                      >
                        <PetCard
                          image={pet.image}
                          name={pet.name}
                          breed={pet.breed}
                          age={pet.age}
                          location={pet.location}
                        />
                      </Link>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    className={styles.scrollButton}
                    onClick={() => scroll(1, popularRef)}
                    aria-label="向右滑動"
                  >
                    <FaAngleRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

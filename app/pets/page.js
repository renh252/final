'use client'

import Image from 'next/image'
import React, { useRef, useEffect } from 'react'
import styles from './pets.module.css'
import Card from '@/app/_components/ui/Card'
import Link from 'next/link'
import { Breadcrumbs } from '../_components/breadcrumbs'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PetsPage() {
  const latestRef = useRef(null)
  const popularRef = useRef(null)

  // 使用 SWR 獲取資料
  const { data, error } = useSWR('/api/pets', fetcher)

  // 當資料更新時輸出到 console
  useEffect(() => {
    if (data) {
      console.log('從資料庫獲取的寵物資料：', data.pets)
    }
    if (error) {
      console.error('獲取資料時發生錯誤：', error)
    }
  }, [data, error])

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

  if (!data) return <div>載入中...</div>
  if (error) return <div>發生錯誤</div>

  return (
    <div className={styles.petsContainer}>
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
                <CardSwitchButton
                  direction="left"
                  onClick={() => scroll(-1, latestRef)}
                  aria-label="向左滑動"
                />
                <div className={styles.cardGroup} ref={latestRef}>
                  {data.pets.map((pet) => (
                    <Link
                      href={`/pets/${pet.id}`}
                      key={pet.id}
                      className={styles.cardLink}
                    >
                      <Card
                        image="/images/default_no_pet.jpg"
                        title={pet.name}
                        className={styles.petCard}
                      >
                        <div>
                          <p>品種：{pet.variety}</p>
                          <p>
                            <span>年齡：{pet.age}</span>
                            <span className={styles.separator}>・</span>
                            <span>{pet.gender}</span>
                          </p>
                          <p>地點：{pet.location}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                <CardSwitchButton
                  direction="right"
                  onClick={() => scroll(1, latestRef)}
                  aria-label="向右滑動"
                />
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
                <CardSwitchButton
                  direction="left"
                  onClick={() => scroll(-1, popularRef)}
                  aria-label="向左滑動"
                />
                <div className={styles.cardGroup} ref={popularRef}>
                  {data.pets.map((pet) => (
                    <Link
                      href={`/pets/${pet.id}`}
                      key={pet.id}
                      className={styles.cardLink}
                    >
                      <Card
                        image="/images/default_no_pet.jpg"
                        title={pet.name}
                        className={styles.petCard}
                      >
                        <div>
                          <p>品種：{pet.variety}</p>
                          <p>
                            <span>年齡：{pet.age}</span>
                            <span className={styles.separator}>・</span>
                            <span>{pet.gender}</span>
                          </p>
                          <p>地點：{pet.location}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                <CardSwitchButton
                  direction="right"
                  onClick={() => scroll(1, popularRef)}
                  aria-label="向右滑動"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

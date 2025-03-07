'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import styles from './pets.module.css'
import Card from '@/app/_components/ui/Card'
import Link from 'next/link'
import { Breadcrumbs } from '../_components/breadcrumbs'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import useSWR from 'swr'
import { Form, Row, Col } from 'react-bootstrap'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PetsPage() {
  const latestRef = useRef(null)
  const popularRef = useRef(null)

  // 狀態管理
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data: petsData, error: petsError } = useSWR(
    '/api/pet-data?type=pets',
    fetcher
  )
  const { data: speciesData } = useSWR('/api/pet-data?type=species', fetcher)
  const { data: breedsData, mutate: mutateBreeds } = useSWR(
    selectedSpecies
      ? `/api/pet-data?type=breeds&species_id=${selectedSpecies}`
      : null,
    fetcher
  )

  // 輸出獲取到的資料，用於除錯
  useEffect(() => {
    if (petsData?.pets?.length > 0) {
      console.log('前端獲取到的第一筆寵物資料:', petsData.pets[0])
    }
  }, [petsData])

  // 處理最新上架和熱門領養的寵物資料
  const latestPets = useMemo(() => {
    if (!petsData?.pets) return []
    // 根據 id 或 created_at 排序，取最新的 10 筆
    return [...petsData.pets].sort((a, b) => b.id - a.id).slice(0, 10)
  }, [petsData])

  const popularPets = useMemo(() => {
    if (!petsData?.pets) return []
    // 這裡可以根據實際需求定義「熱門」的標準
    // 例如：隨機選取不同於最新上架的寵物，或根據某些指標排序
    return [...petsData.pets]
      .sort(() => 0.5 - Math.random()) // 隨機排序
      .filter(
        (pet) => !latestPets.slice(0, 5).some((latest) => latest.id === pet.id)
      ) // 排除前 5 個最新的
      .slice(0, 10)
  }, [petsData, latestPets])

  // 當選擇物種改變時，重置品種選擇
  useEffect(() => {
    setSelectedBreed('')
    if (selectedSpecies) {
      mutateBreeds()
    }
  }, [selectedSpecies, mutateBreeds])

  // 滾動功能
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

  if (!petsData) return <div>載入中...</div>
  if (petsError) return <div>發生錯誤</div>

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

      {/* 篩選搜尋區域 */}
      <div className={styles.filterSection}>
        <Row>
          <Col md={6}>
            <div className={styles.filterForm}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>物種</Form.Label>
                  <Form.Select
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                  >
                    <option value="">請選擇物種</option>
                    {speciesData?.species?.map((species) => (
                      <option key={species.id} value={species.id}>
                        {species.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>品種</Form.Label>
                  <Form.Select
                    value={selectedBreed}
                    onChange={(e) => setSelectedBreed(e.target.value)}
                    disabled={!selectedSpecies || !breedsData}
                  >
                    <option value="">請選擇品種</option>
                    {breedsData?.breeds?.map((breed) => (
                      <option key={breed.id} value={breed.id}>
                        {breed.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>地區</Form.Label>
                  <Form.Select>
                    <option>請選擇地區</option>
                    <option>台北市</option>
                    <option>新北市</option>
                    <option>桃園市</option>
                    <option>台中市</option>
                    <option>台南市</option>
                    <option>高雄市</option>
                    <option>基隆市</option>
                    <option>新竹市</option>
                    <option>嘉義市</option>
                    <option>宜蘭縣</option>
                    <option>花蓮縣</option>
                    <option>台東縣</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" label="已收藏" />
                </Form.Group>
              </Form>
            </div>
          </Col>
          <Col md={6}>
            <div className={styles.mapContainer}>
              {/* 這裡將放置 OpenStreetMap 組件 */}
              <div className={styles.mapPlaceholder}>地圖載入中...</div>
            </div>
          </Col>
        </Row>
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
                  {latestPets.map((pet) => (
                    <Link
                      href={`/pets/${pet.id}`}
                      key={pet.id}
                      className={styles.cardLink}
                    >
                      <Card
                        image={
                          pet.image_url ||
                          pet.main_photo ||
                          '/images/default_no_pet.jpg'
                        }
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
                  {popularPets.map((pet) => (
                    <Link
                      href={`/pets/${pet.id}`}
                      key={pet.id}
                      className={styles.cardLink}
                    >
                      <Card
                        image={
                          pet.image_url ||
                          pet.main_photo ||
                          '/images/default_no_pet.jpg'
                        }
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

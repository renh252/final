'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import styles from './pets.module.css'
import Card from '@/app/_components/ui/Card'
import Link from 'next/link'
import { Breadcrumbs } from '../_components/breadcrumbs'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import useSWR from 'swr'
import { Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap'

const fetcher = (url) => fetch(url).then((res) => res.json())

// 可搜尋的下拉選單組件
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const selectRef = useRef(null)

  // 過濾選項
  const filteredOptions =
    options?.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 選擇選項
  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  // 鍵盤事件處理 - keyDown
  const handleKeyDown = (e) => {
    // 阻止所有可能觸發下拉選單的按鍵
    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === ' ' ||
      e.key === 'Enter'
    ) {
      e.preventDefault()
    }
  }

  // 鍵盤事件處理 - keyUp
  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!disabled) {
        setIsOpen(!isOpen)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 選項的鍵盤事件處理
  const handleOptionKeyDown = (e, option = '') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(option)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 防止預設下拉選單行為
  const handleSelectClick = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsOpen(!isOpen)

      // 阻止原生下拉選單打開
      if (selectRef.current) {
        selectRef.current.blur()
      }
    }
  }

  // 防止預設下拉選單行為 - 焦點事件
  const handleFocus = () => {
    // 立即取消焦點，防止預設選單顯示
    if (selectRef.current) {
      setTimeout(() => {
        selectRef.current.blur()
      }, 0)
    }
  }

  return (
    <div className={styles.searchableSelect} ref={dropdownRef}>
      <div className={styles.customSelect}>
        <Form.Select
          ref={selectRef}
          value={value || ''}
          onChange={() => {}} // 實際選擇由下拉選單處理
          onClick={handleSelectClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <option value="">{value || placeholder}</option>
        </Form.Select>
      </div>

      {isOpen && !disabled && (
        <div className={styles.bootstrapDropdown} role="listbox">
          <InputGroup className="mb-2">
            <FormControl
              placeholder="搜尋品種..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              ref={(input) => input && setTimeout(() => input.focus(), 100)}
              className={styles.searchInput}
            />
          </InputGroup>

          <div className={styles.optionsList}>
            {value && (
              <div
                className={`${styles.option} ${styles.clearOption}`}
                onClick={() => handleSelect('')}
                onKeyDown={(e) => handleOptionKeyDown(e, '')}
                role="option"
                aria-selected={value === ''}
                tabIndex={0}
              >
                清除選擇
              </div>
            )}
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className={`${styles.option} ${
                  value === option ? styles.selected : ''
                }`}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                role="option"
                aria-selected={value === option}
                tabIndex={0}
              >
                {option}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className={styles.noResults}>沒有符合的結果</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
  // 獲取所有不重複的品種資料
  const { data: varietiesData, mutate: mutateVarieties } = useSWR(
    selectedSpecies
      ? `/api/pet-data?type=varieties&species_id=${selectedSpecies}`
      : '/api/pet-data?type=varieties',
    fetcher
  )

  // 輸出獲取到的資料，用於除錯
  useEffect(() => {
    if (petsData?.pets?.length > 0) {
      console.log('前端獲取到的第一筆寵物資料:', petsData.pets[0])
    }

    // 調試 varietiesData
    if (varietiesData) {
      console.log('獲取到的品種資料:', varietiesData)
    }
  }, [petsData, varietiesData])

  // 確保在頁面載入時就獲取所有品種資料
  useEffect(() => {
    if (!varietiesData) {
      mutateVarieties()
    }
  }, [varietiesData, mutateVarieties])

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
      mutateVarieties()
    }
  }, [selectedSpecies, mutateBreeds, mutateVarieties])

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
                  {/* 使用自定義的可搜尋下拉選單 */}
                  <SearchableSelect
                    options={varietiesData?.varieties || []}
                    value={selectedBreed}
                    onChange={setSelectedBreed}
                    placeholder="請選擇品種"
                    disabled={
                      !varietiesData ||
                      !varietiesData.varieties ||
                      varietiesData.varieties.length === 0
                    }
                  />
                  <div className={styles.varietyInfo}>
                    {varietiesData
                      ? `已找到 ${varietiesData.varieties?.length || 0} 個品種`
                      : '正在載入品種資料...'}
                  </div>
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

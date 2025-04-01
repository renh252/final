'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
} from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import styles from './favorites.module.css'
import { FaHeart, FaFilter, FaArrowLeft, FaTrash } from 'react-icons/fa'
import { usePageTitle } from '@/app/context/TitleContext'

export default function PetLikePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoriteData, setFavoriteData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  usePageTitle('收藏寵物')

  // 篩選狀態
  const [filters, setFilters] = useState({
    species: '',
    variety: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // 下拉選項
  const [species, setSpecies] = useState([])
  const [varieties, setVarieties] = useState([])

  // 載入用戶收藏寵物
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 獲取收藏的寵物ID列表
        const favResponse = await fetch(
          `/api/pets?type=favorites&userId=${user.id}`
        )
        if (!favResponse.ok) throw new Error('無法載入收藏資料')

        const favData = await favResponse.json()

        if (!favData.favorites || favData.favorites.length === 0) {
          setFavoriteData([])
          setIsLoading(false)
          return
        }

        const petIds = favData.favorites.map((fav) => fav.pet_id)

        // 獲取所有寵物資料
        const petsPromises = petIds.map((id) =>
          fetch(`/api/pets/${id}`).then((res) => {
            if (!res.ok) throw new Error(`無法獲取寵物ID ${id}的資料`)
            return res.json()
          })
        )

        const petsResults = await Promise.all(petsPromises)

        const validPets = petsResults
          .filter((result) => result.pet && !result.pet.is_adopted)
          .map((result) => {
            // 直接使用原始資料，不進行轉換
            return {
              ...result.pet,
              isFavorite: true,
            }
          })

        setFavoriteData(validPets)

        // 獲取物種和品種數據用於篩選
        const uniqueSpecies = [...new Set(validPets.map((pet) => pet.species))]
        setSpecies(uniqueSpecies)

        const uniqueVarieties = [
          ...new Set(validPets.map((pet) => pet.variety)),
        ]
        setVarieties(uniqueVarieties)
      } catch (err) {
        console.error('獲取收藏寵物失敗:', err)
        setError('獲取收藏資料時出現錯誤，請稍後重試')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  // 處理移除收藏
  const handleRemoveFavorite = async (petId) => {
    if (!user) return

    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          petId,
          action: 'remove',
        }),
      })

      if (response.ok) {
        setFavoriteData((prev) => prev.filter((pet) => pet.id !== petId))
      } else {
        setError('移除收藏失敗，請稍後重試')
      }
    } catch (err) {
      console.error('移除收藏錯誤:', err)
      setError('移除收藏時出現錯誤，請稍後重試')
    }
  }

  // 處理篩選變更
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 篩選寵物列表
  const filteredPets = favoriteData.filter((pet) => {
    if (filters.species && pet.species !== filters.species) return false
    if (filters.variety && pet.variety !== filters.variety) return false
    return true
  })

  // 清除篩選
  const clearFilters = () => {
    setFilters({
      species: '',
      variety: '',
    })
  }

  if (!user) {
    router.push('/member/MemberLogin/login')
    return null
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="light" className="me-2" onClick={() => router.back()}>
          <FaArrowLeft />
        </Button>
        <h2 className="mb-0">我的寵物收藏</h2>
        <Button
          variant="outline-secondary"
          className="ms-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> 篩選
        </Button>
      </div>

      {/* 篩選面板 */}
      {showFilters && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col xs={12} md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>物種</Form.Label>
                  <Form.Select
                    name="species"
                    value={filters.species}
                    onChange={handleFilterChange}
                  >
                    <option value="">全部物種</option>
                    {species.map((speciesName) => (
                      <option key={speciesName} value={speciesName}>
                        {speciesName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>品種</Form.Label>
                  <Form.Select
                    name="variety"
                    value={filters.variety}
                    onChange={handleFilterChange}
                  >
                    <option value="">全部品種</option>
                    {varieties.map((variety) => (
                      <option key={variety} value={variety}>
                        {variety}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  className="mb-3 w-100"
                  onClick={clearFilters}
                >
                  清除篩選
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* 載入中顯示 */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">載入中...</span>
          </Spinner>
          <p className="mt-2">載入收藏資料中...</p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-5">
          <p>您尚未收藏任何寵物，或符合篩選條件的寵物。</p>
          <Button variant="primary" onClick={() => router.push('/pets')}>
            瀏覽寵物
          </Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredPets.map((pet) => (
            <Col key={pet.id}>
              <Card className={styles.petCard}>
                <div className={styles.imageContainer}>
                  {pet.main_photo ? (
                    <Image
                      src={pet.main_photo}
                      alt={pet.name}
                      width={300}
                      height={200}
                      className={styles.petImage}
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                  <Badge
                    bg={
                      pet.gender === '公'
                        ? 'primary'
                        : pet.gender === '母'
                        ? 'danger'
                        : 'secondary'
                    }
                    className={styles.genderBadge}
                  >
                    {pet.gender || '未知'}
                  </Badge>
                  <button
                    className={styles.favoriteButton}
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemoveFavorite(pet.id)
                    }}
                    aria-label="移除收藏"
                  >
                    <FaTrash />
                  </button>
                </div>
                <Card.Body>
                  <Card.Title className={styles.petCardTitle}>
                    <Link href={`/pets/${pet.id}`} className={styles.petLink}>
                      {pet.name}
                    </Link>
                  </Card.Title>
                  <Card.Text>
                    <span className={styles.petInfo}>
                      <span className={styles.petBadge}>{pet.species}</span>
                      <span className={styles.petBadge}>{pet.variety}</span>
                      <span className={styles.petBadge}>
                        {pet.age || '未知年齡'}
                      </span>
                    </span>
                    <span className={styles.petLocation}>
                      {pet.store_name || pet.location || '未知位置'}
                    </span>
                  </Card.Text>
                  <div className="d-grid">
                    <Link
                      href={`/pets/${pet.id}`}
                      className="btn btn-outline-primary"
                    >
                      查看詳情
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

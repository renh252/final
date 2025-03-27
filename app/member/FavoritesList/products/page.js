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
  Image,
} from 'react-bootstrap'
import Link from 'next/link'
import styles from './product_like.module.css'
import {
  FaFilter,
  FaArrowLeft,
  FaTrash,
  FaRegHeart,
  FaHeart,
} from 'react-icons/fa'
import { usePageTitle } from '@/app/context/TitleContext'

export default function ShopLikePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoriteProducts, setFavoriteProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  usePageTitle('商品收藏')

  // 篩選狀態
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  // 分類選項
  const [categories, setCategories] = useState([])

  // 載入用戶收藏商品
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 獲取包含用戶收藏資料的商品列表
        const response = await fetch(`/api/shop?userId=${user.id}`)
        if (!response.ok) throw new Error('無法載入收藏資料')

        const data = await response.json()

        if (!data.product_like || data.product_like.length === 0) {
          setFavoriteProducts([])
          setIsLoading(false)
          return
        }

        // 使用 product_like 表中的 product_id 從 products 表中獲取商品詳細資料
        const userLikes = data.product_like

        // 從商品數據中篩選出用戶收藏的商品
        const favoriteProductDetails = data.products.filter((product) =>
          userLikes.some((like) => like.product_id === product.product_id)
        )

        setFavoriteProducts(favoriteProductDetails)

        // 獲取分類數據
        const allCategories = data.categories || []

        // 從收藏商品中獲取所有類別ID
        const categoryIds = [
          ...new Set(
            favoriteProductDetails.map((product) => product.category_id)
          ),
        ]

        // 篩選出相關的類別
        const relevantCategories = allCategories.filter((category) =>
          categoryIds.includes(category.category_id)
        )

        setCategories(relevantCategories)
      } catch (err) {
        console.error('獲取收藏商品失敗:', err)
        setError('獲取收藏資料時出現錯誤，請稍後重試')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  // 處理移除收藏
  const handleRemoveFavorite = async (productId) => {
    if (!user) return

    try {
      const response = await fetch('/api/shop/product_like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
          action: 'remove',
        }),
      })

      if (response.ok) {
        setFavoriteProducts((prev) =>
          prev.filter((product) => product.product_id !== productId)
        )
      } else {
        setError('移除收藏失敗，請稍後重試')
      }
    } catch (err) {
      console.error('移除收藏錯誤:', err)
      setError('移除收藏時出現錯誤，請稍後重試')
    }
  }

  // 處理篩選變更
  const handleFilterChange = (categoryId, isChecked) => {
    setSelectedFilters((prev) => {
      const updatedCategoryFilters = [...prev.category]

      if (isChecked) {
        updatedCategoryFilters.push(categoryId)
      } else {
        const index = updatedCategoryFilters.indexOf(categoryId)
        if (index > -1) {
          updatedCategoryFilters.splice(index, 1)
        }
      }

      return {
        ...prev,
        category: updatedCategoryFilters,
      }
    })
  }

  // 篩選商品列表
  const filteredProducts = favoriteProducts.filter((product) => {
    // 如果沒有選擇任何類別，顯示所有商品
    if (selectedFilters.category.length === 0) return true

    // 否則只顯示選中類別的商品
    return selectedFilters.category.includes(product.category_id)
  })

  // 清除篩選
  const clearFilters = () => {
    setSelectedFilters({
      category: [],
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
        <h2 className="mb-0">我的商品收藏</h2>
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
            <h5 className="mb-3">商品分類</h5>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {categories.map((category) => (
                <Form.Check
                  key={category.category_id}
                  type="checkbox"
                  id={`category-${category.category_id}`}
                  label={category.category_name}
                  checked={selectedFilters.category.includes(
                    category.category_id
                  )}
                  onChange={(e) =>
                    handleFilterChange(category.category_id, e.target.checked)
                  }
                  className="me-3"
                />
              ))}
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearFilters}
            >
              清除篩選
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* 摘要資訊 */}
      <div className="mb-4">
        <p>
          符合條件：<strong>{filteredProducts.length}</strong> 筆 ／ 總數：
          <strong>{favoriteProducts.length}</strong> 筆
        </p>
      </div>

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
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <p>您尚未收藏任何商品，或符合篩選條件的商品。</p>
          <Button variant="primary" onClick={() => router.push('/shop')}>
            瀏覽商品
          </Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredProducts.map((product) => (
            <Col key={product.product_id}>
              <Card className={styles.productCard}>
                <div className={styles.imageContainer}>
                  {product.image_url ? (
                    <Card.Img
                      variant="top"
                      src={product.image_url}
                      alt={product.product_name}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                  <button
                    className={styles.favoriteButton}
                    onClick={() => handleRemoveFavorite(product.product_id)}
                    aria-label="移除收藏"
                  >
                    <FaTrash />
                  </button>
                </div>
                <Card.Body>
                  <Card.Title className={styles.productTitle}>
                    <Link
                      href={`/shop/${product.product_id}`}
                      className={styles.productLink}
                    >
                      {product.product_name}
                    </Link>
                  </Card.Title>
                  <Card.Text className="d-flex justify-content-between align-items-center">
                    <span className={styles.price}>
                      ${product.price}
                      {product.original_price &&
                        product.original_price > product.price && (
                          <del className="ms-2 text-muted">
                            ${product.original_price}
                          </del>
                        )}
                    </span>
                  </Card.Text>
                  <div className="d-grid">
                    <Link
                      href={`/shop/${product.product_id}`}
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

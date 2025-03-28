'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'

// product_menu
import FixedElements from '@/app/shop/_components/FixedElements'
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import categories_styles from '../categories.module.css'
// components
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import {
  FaArrowLeft,
  FaRegHeart,
  FaHeart,
  FaLongArrowAltRight,
} from 'react-icons/fa'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { usePageTitle } from '@/app/context/TitleContext'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())
// auth
import { useAuth } from '@/app/context/AuthContext'

export default function PagesProductTitle() {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid_parent = params?.cidParent
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('latest')
    const [menuOpen, setMenuOpen] = useState(false)

  // 卡片滑動-------------------------------
  const categoryRefs = useRef({})

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

  // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error, mutate } = useSWR('/api/shop', fetcher)
  usePageTitle(
    data?.categories?.find((category) => category.category_id == cid_parent)
      ?.category_name
  )

  // 處理喜愛商品數據
  const toggleLike = async (productId) => {
    // 如果用戶未登入，則提示登入
    if (!isAuthenticated || !user) {
      alert('請先登入才能收藏商品')
      // 儲存當前頁面路徑，以便登入後返回
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      window.location.href = '/member/MemberLogin/login'
      return
    }

    const userId = user.id
    const product_like = data.product_like || []
    const isLiked = product_like.some(
      (product) =>
        product.product_id === productId && product.user_id === userId
    )

    try {
      const response = await fetch('/api/shop/product_like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
          action: isLiked ? 'remove' : 'add',
        }),
      })

      if (response.ok) {
        // 重新獲取商品數據
        mutate()
      } else {
        console.error('收藏操作失敗')
      }
    } catch (error) {
      console.error('收藏操作錯誤:', error)
    }
  }

  // 处理加载状态
  if (!data) return <div>Loading...</div>

  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products
  const product_like = data.product_like || []
  // 判斷商品是否被當前用戶收藏
  const isProductLiked = (productId) => {
    if (!isAuthenticated || !user) return false
    return product_like.some(
      (item) => item.product_id === productId && item.user_id === user.id
    )
  }

  // 檢查是否存在 category_id 等於 cid_parent 的類別
  const currentCategory = categories.find(
    (category) => category.category_id == cid_parent
  )
  // 檢查是否有子類別（其他類別的 parent_id 等於 cid_parent）
  const childCategories = categories.filter(
    (category) => category.parent_id == cid_parent
  )

  // 處理搜索邏輯
  const filteredProducts = products.filter(
    (product) =>
      categories.some(
        (category) =>
          category.parent_id == cid_parent &&
          category.category_id == product.category_id
      ) &&
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // -----------------

  return (
    <>
      <div className={categories_styles.main}>
        {currentCategory && childCategories.length > 0 ? (
          <>
            <FixedElements menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <Breadcrumbs
              title={currentCategory.category_name}
              items={[
                { label: '商城', href: `/shop` },
                {
                  label: currentCategory.category_name,
                  href: `/shop/categories/${cid_parent}`,
                },
              ]}
            />
            <div className={categories_styles.container}>
              <div className={styles.productMenu}>
                <ProductMenu />
              </div>
              <div className={categories_styles.contain_body}>
                <div className={categories_styles.searchBar}>
                  <input
                    type="search"
                    placeholder="搜尋商品..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {filteredProducts.length > 0 && searchQuery ? (
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className={categories_styles.sortSelect}
                    >
                      <option value="latest">最新</option>
                      <option value="price_asc">價格低到高</option>
                      <option value="price_desc">價格高到低</option>
                    </select>
                  ) : null}
                </div>
                {/* 搜尋結果或顯示類別 */}
                {searchQuery ? (
                  <div className={categories_styles.searchGroup}>
                    {/* 計算商品數 */}
                    {filteredProducts.length !== 0 ? (
                      <div className={categories_styles.noProductMessage}>
                        共 {filteredProducts.length} 筆商品
                      </div>
                    ) : (
                      <div className={categories_styles.noProductMessage}>
                        無此商品
                      </div>
                    )}
                    {filteredProducts
                      .sort((a, b) => {
                        if (sortOption === 'latest')
                          return new Date(b.updated_at) - new Date(a.updated_at)
                        if (sortOption === 'price_asc')
                          return (
                            (a.price * (100 - a.discount_percentage)) / 100 -
                            (b.price * (100 - b.discount_percentage)) / 100
                          )
                        if (sortOption === 'price_desc')
                          return (
                            (b.price * (100 - b.discount_percentage)) / 100 -
                            (a.price * (100 - a.discount_percentage)) / 100
                          )
                        return 0
                      })
                      .map((product) => (
                        <Link
                          key={product.product_id}
                          href={`/shop/${product.product_id}`}
                        >
                          <Card
                            image={
                              product.image_url || '/images/default_no_pet.jpg'
                            }
                            title={product.product_name}
                          >
                            <div className={styles.cardText}>
                              {product?.discount_percentage ? (
                                <p>
                                  $
                                  {Math.ceil(
                                    (product.price *
                                      (100 - product.discount_percentage)) /
                                      100
                                  )}{' '}
                                  <del>${product.price}</del>
                                </p>
                              ) : (
                                <p>${product.price}</p>
                              )}
                              <button
                                className={styles.likeButton}
                                onClick={(event) => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  toggleLike(product.product_id)
                                }}
                              >
                                {isProductLiked(product.product_id) ? (
                                  <FaHeart />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </button>
                            </div>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <>
                    {categories
                      .filter((category) => category.parent_id == cid_parent)
                      .map((category) => (
                        <div
                          className={categories_styles.group}
                          key={category.category_id}
                        >
                          <div className={categories_styles.groupTitle}>
                            <p>{category.category_name}</p>
                            <Link
                              href={`/shop/categories/${cid_parent}/${category.category_id}`}
                            >
                              查看更多 <FaLongArrowAltRight />
                            </Link>
                          </div>
                          <div className={categories_styles.groupBody}>
                            <CardSwitchButton
                              direction="left"
                              onClick={() =>
                                scroll(
                                  -1,
                                  categoryRefs.current[category.category_id]
                                )
                              }
                              aria-label="向左滑動"
                            />
                            <div
                              className={categories_styles.cardGroup}
                              ref={(el) =>
                                (categoryRefs.current[category.category_id] = {
                                  current: el,
                                })
                              }
                            >
                              {products
                                .filter(
                                  (product) =>
                                    product.category_id == category.category_id
                                )
                                .map((product) => {
                                  return (
                                    <Link
                                      key={product.product_id}
                                      href={`/shop/${product.product_id}`}
                                    >
                                      <Card
                                        image={
                                          product.image_url ||
                                          '/images/default_no_pet.jpg'
                                        }
                                        title={product.product_name}
                                      >
                                        <div className={styles.cardText}>
                                          {product?.discount_percentage ? (
                                            <p>
                                              $
                                              {Math.ceil(
                                                (product.price *
                                                  (100 -
                                                    product.discount_percentage)) /
                                                  100
                                              )}{' '}
                                              <del>${product.price}</del>
                                            </p>
                                          ) : (
                                            <p>${product.price}</p>
                                          )}
                                          <button
                                            className={styles.likeButton}
                                            onClick={(event) => {
                                              event.preventDefault()
                                              event.stopPropagation()
                                              toggleLike(product.product_id)
                                            }}
                                          >
                                            {isProductLiked(
                                              product.product_id
                                            ) ? (
                                              <FaHeart />
                                            ) : (
                                              <FaRegHeart />
                                            )}
                                          </button>
                                        </div>
                                      </Card>
                                    </Link>
                                  )
                                })}
                            </div>

                            <CardSwitchButton
                              direction="right"
                              onClick={() =>
                                scroll(
                                  1,
                                  categoryRefs.current[category.category_id]
                                )
                              }
                              aria-label="向左滑動"
                            />
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={categories_styles.noCategory}>
            <Link href="/shop">
              <div>
                <FaArrowLeft />
                返回商城
              </div>
            </Link>
            <p>查無此類別</p>
          </div>
        )}
      </div>
    </>
  )
}

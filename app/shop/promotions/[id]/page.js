'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles from '@/app/shop/search/search.module.css'
// card
import Card from '@/app/_components/ui/Card'
import { FaArrowLeft, FaRegHeart, FaHeart } from 'react-icons/fa'

// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { usePageTitle } from '@/app/context/TitleContext'
import FixedElements from '@/app/shop/_components/FixedElements'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())
// auth
import { useAuth } from '@/app/context/AuthContext'

export default function CidPage(props) {
  const params = useParams()
  const promotionId = params?.id
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  
  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error, mutate } = useSWR('/api/shop', fetcher)
  const { data: promotionData, error: promotionError } = useSWR(
    promotionId ? `/api/shop/promotions/${promotionId}` : null,
    fetcher
  )

  usePageTitle(promotionData?.promotion?.promotion_name)
  
  // 在這裡使用 promotion 數據
  

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

  const [searchTerm, setSearchTerm] = useState('')

  const [sortOption, setSortOption] = useState('latest')

  // 处理加载状态
  if (!data || !promotionData) return <div>Loading...</div>

  // 处理错误状态
  if (error || promotionError) return <div>Failed to load</div>

  const promotion = promotionData?.promotion
  const products = data.products
  const product_like = data.product_like || []
  // 判斷商品是否被當前用戶收藏
  const isProductLiked = (productId) => {
    if (!isAuthenticated || !user) return false
    return product_like.some(
      (item) => item.product_id === productId && item.user_id === user.id
    )
  }

  // 搜尋商品
  const filteredProducts = products
  .filter((product) => product.promotion_id == promotionId)
  .filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOption === "latest") return new Date(b.updated_at) - new Date(a.updated_at);
    if (sortOption === "price_asc") return ((a.price * (100 - a.discount_percentage)) / 100) - ((b.price * (100 - b.discount_percentage)) / 100);
    if (sortOption === "price_desc") return ((b.price * (100 - b.discount_percentage)) / 100) - ((a.price * (100 - a.discount_percentage)) / 100);
    return 0;
  });
  // -----------------

  return (
    <>  
      <div className={cid_styles.main}>
        {promotion ? (
          <>
            <FixedElements menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <Breadcrumbs
              title={`活動【${promotion.promotion_name}】 折扣${promotion.discount_percentage}%`}
              items={[
                { label: '商城', href: `/shop` },
                {
                  label: promotion.promotion_name,
                  href: `/shop/promotions/${promotionId}`,
                },
              ]}
            />
            <div className={cid_styles.container}>
              <div className={styles.productMenu}>
                <ProductMenu />
              </div>
              <div className={cid_styles.contain_body}>
                {/* 搜尋與排序選單 */}
                <div  className={cid_styles.filterBar}>
                  <input
                    type="search"
                    placeholder="搜尋商品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cid_styles.searchInput}
                  />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className={cid_styles.sortSelect}
                  >
                    <option value="latest">最新</option>
                    <option value="price_asc">價格低到高</option>
                    <option value="price_desc">價格高到低</option>
                  </select>
                </div>
                <div className={cid_styles.noProductMessage}>
                  {filteredProducts
                  ?(
                    filteredProducts.length === 0
                    ?'無此商品'
                    :`共${filteredProducts.length}筆商品`
                  )
                  :products.length
                  }
                </div>
                <div className={cid_styles.cardGroup}>
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.product_id}
                      href={`/shop/${product.product_id}`}
                    >
                      <Card
                      className={styles.card}
                        image={product.image_url || '/images/default_no_pet.jpg'}
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
              </div>
            </div>
          </>
        ) : (
          <div className={cid_styles.noCategory}>
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

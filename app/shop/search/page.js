'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams,useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePageTitle } from '@/app/context/TitleContext'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles from './search.module.css'
// components
import ProductMenu from '@/app/shop/_components/productMenu'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import FixedElements from '@/app/shop/_components/FixedElements'
// card
import Card from '@/app/_components/ui/Card'
import { FaArrowLeft, FaRegHeart, FaHeart } from 'react-icons/fa'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())
// auth
import { useAuth } from '@/app/context/AuthContext'

export default function SearchPage(props) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const router = useRouter() 
  usePageTitle('搜索商品')
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data : searchData , searchError : searchError  } = useSWR(
    `/api/shop/search?q=${encodeURIComponent(query)}`,
    fetcher
  )
  const { data : shopData, searchError : shopError, mutate: shopMutate } = useSWR('/api/shop', fetcher)


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
    const product_like = shopData .product_like || []
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
        shopMutate()
      } else {
        console.shopError('收藏操作失敗')
      }
    } catch (searchError ) {
      console.shopError('收藏操作錯誤:', searchError )
    }
  }

  const products = searchData ?.products
  const product_like = shopData?.product_like || []
  // 判斷商品是否被當前用戶收藏
  const isProductLiked = (productId) => {
    if (!isAuthenticated || !user) return false
    return product_like.some(
      (item) => item.product_id === productId && item.user_id === user.id
    )
  }
  
  // 搜尋/排序
  const [searchTerm, setSearchTerm] = useState('')
  // 处理搜索按钮点击
  const handleSearch = (e) => {
    e.preventDefault()  // 防止表单默认提交行为
    if (searchTerm.trim()) {
      // 使用 encodeURIComponent 来正确处理 URL 中的特殊字符
      router.push(`/shop/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }
  const [sortOption, setSortOption] = useState('latest')
  

  // 处理加载状态
  if (!searchData || !shopData) return <div>Loading products...</div>

  // 处理错误状态
  if (searchError || shopError) return <div>Failed to load products</div>

  return (
    <div className={cid_styles.main}>
        <FixedElements menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Breadcrumbs
          title={`搜尋【${query}】 /共 ${products.length} 筆資料`}
          items={[
            { label: '商城', href: `/shop` },
            {
              label: `${query}`,
              href: `/shop/search?q=${query}`,
            },
          ]}
        />
        <div className={cid_styles.container}>
          <div className={styles.productMenu}>
            <ProductMenu />
          </div>
          <div className={cid_styles.contain_body}>
            {/* 搜尋與排序選單 */}
            <form  onSubmit={handleSearch} className={cid_styles.filterBar}>
                <input
                  type="search"
                  placeholder="搜尋全站商品..."
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
            </form>
            { products.length > 0
            ? 
              <div className={cid_styles.cardGroup}>
              <div className={cid_styles.noProductMessage}>共{products.length}筆商品</div>
                {products
                    .sort((a, b) => {
                      if (sortOption === "latest") return new Date(b.updated_at) - new Date(a.updated_at);
                      if (sortOption === "price_asc") return ((a.price *(100 - a.discount_percentage)) /100) - ((b.price *(100 - b.discount_percentage)) /100);
                      if (sortOption === "price_desc") return ((b.price *(100 - b.discount_percentage)) /100) - ((a.price *(100 - a.discount_percentage)) /100);
                      return 0;
                    })
                    .map((product) => {
                    return (
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
                                )} <del>${product.price}</del>
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
                    )
                  })}
              </div>
            : (
              <div className={cid_styles.noProductMessage}>查無此商品</div>
            )}
          </div>
        </div>

    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles from './search.module.css'
// components
import ProductMenu from '@/app/shop/_components/productMenu'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
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
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

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
  

  // 处理加载状态
  if (!searchData || !shopData) return <div>Loading products...</div>

  // 处理错误状态
  if (searchError || shopError) return <div>Failed to load products</div>

  return (
    <div className={cid_styles.main}>
      { products
      ? 
        <>
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
            <div className="productMenu">
              <ProductMenu />
            </div>
            <div className={cid_styles.contain_body}>
              <div className="select"></div>
              <div className={cid_styles.cardGroup}>
                {products.map((product) => {
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
                    )
                  })}
              </div>
            </div>
          </div>
        </> 
      : (
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
  )
}

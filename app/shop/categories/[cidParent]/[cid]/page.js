'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles from '@/app/shop/categories/[cidParent]/[cid]/cid.module.css'
// card
import Card from '@/app/_components/ui/Card'
import { FaArrowLeft, FaRegHeart, FaHeart } from 'react-icons/fa'

// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())
// auth
import { useAuth } from '@/app/context/AuthContext'

export default function CidPage(props) {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cidParent = params?.cidParent
  const cid = params?.cid
  const { user, isAuthenticated } = useAuth()

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error, mutate } = useSWR('/api/shop', fetcher)

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

  // 检查当前类别是否存在，以及它的父类别是否正确
  const currentCategory = categories.find(
    (category) => category.category_id == cid
  )
  const parentCategory = categories.find(
    (category) => category.category_id == cidParent
  )
  const isValidCategory =
    currentCategory && currentCategory.parent_id == cidParent


  // -----------------

  return (
    <>
      <div className={cid_styles.main}>
        {isValidCategory ? (
          <>
            <Breadcrumbs
              title={currentCategory.category_name}
              items={[
                { label: '商城', href: `/shop` },
                {
                  label: parentCategory.category_name,
                  href: `/shop/categories/${cidParent}`,
                },
                {
                  label: currentCategory.category_name,
                  href: `/shop/categories/${cidParent}/${cid}`,
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
                  {products
                    .filter((product) => product.category_id == cid)
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

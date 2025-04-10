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
import ProductCard from '@/app/shop/_components/card'
import { FaArrowLeft, FaRegHeart, FaHeart } from 'react-icons/fa'
import { FaCartShopping } from 'react-icons/fa6'

// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { usePageTitle } from '@/app/context/TitleContext'
import FixedElements from '@/app/shop/_components/FixedElements'
import Alert from '@/app/_components/alert'

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
  const { mutate: cartMutate } = useSWR(
    `/api/shop/cart?userId=${user?.id}`,
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

    const userId = user?.id
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
      (item) => item.product_id === productId && item.user_id === user?.id
    )
  }

  // 搜尋商品
  const filteredProducts = products
    .filter((product) => product.promotion_id == promotionId)
    .filter((product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  const getVariant = async (productId) => {
    if (!isAuthenticated || !user) {
      Alert({
        icon: 'error',
        title: '請先登入才能加入購物車',
        showCancelBtn: true,
        showconfirmBtn: true,
        confirmBtnText: '登入',
        cancelBtnText: '取消',
        function: () => {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
          window.location.href = '/member/MemberLogin/login'
        },
      })
      return
    }

    try {
      const response = await fetch(`/api/shop/${productId}`)
      if (!response.ok) throw new Error('獲取商品信息失敗')
      const data = await response.json()
      console.log(data.variants)

      showVariantSelectionAlert(data.product, data.variants,data?.promotion)
    } catch (error) {
      console.error('Error fetching product info:', error)
      Alert({
        icon: 'error',
        title: '獲取商品信息失敗',
        text: '請稍後再試',
      })
    }
  }

  const showVariantSelectionAlert = (product, variants,promotion) => {
    const calculateDiscountedPrice = (price) => {
      if (promotion && promotion[0]?.discount_percentage) {
        return Math.ceil(price * (100 - promotion[0]?.discount_percentage) / 100);
      }
      return price;
    };
    const variantOptions = variants.map(variant => {
      const originalPrice = variant.price;
      const discountedPrice = calculateDiscountedPrice(originalPrice);
      
      return `<div>
      <input type="radio" id="variant-${variant.variant_id}" name="variant" value="${variant.variant_id}">
      <label for="variant-${variant.variant_id}">
        ${variant.variant_name} - ${discountedPrice !== originalPrice 
            ? `$${discountedPrice} <span style="text-decoration: line-through;">$${originalPrice}</span> ` 
            : `$${originalPrice}`
          }
      </label>
    </div>`
  })
      .join('')

    Alert({
      title: `選擇 【${product.product_name}】 的規格`,
      html: `
      <div id="variant-selection">
        ${variantOptions}
      </div>
      <div id="quantity-selection" style="margin-top: 15px;">
        <label for="quantity">數量：</label>
        <input type="number" id="quantity" name="quantity" min="1" value="1" style="width: 60px; padding: 5px;">
      </div>
    `,
      showCancelBtn: true,
      showconfirmBtn: true,
      confirmBtnText: '加入購物車',
      cancelBtnText: '取消',
      function: (result) => {
        if (result.isConfirmed) {
          const quantityInput = Number(
            document.getElementById('quantity').value
          )
          const selectedInput = document.querySelector(
            'input[name="variant"]:checked'
          )
          if (selectedInput) {
            const selectedVariantId = selectedInput.value
            addToCart(product.product_id, selectedVariantId, quantityInput)
          } else {
            Alert({
              icon: 'error',
              title: '無選擇規格',
              timer: 2000,
            })
            return
          }
        }
      },
    })
  }

  async function addToCart(productId, variantId, quantity) {
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
          userId: user?.id,
        }),
      })

      const cartData = await response.json()

      if (cartData.success) {
        Alert({
          icon: 'success',
          title: '成功加入購物車',
          timer: 1000,
        })
        // 如果使用了 SWR，可以在這裡調用 cartMutate 來刷新購物車數據
        cartMutate(`/api/shop/cart/${user?.id}`)
      } else {
        Alert({
          icon: 'error',
          title: '加入購物車失敗',
          timer: 2000,
        })
        console.error('加入購物車失敗:', cartData.message)
      }
    } catch (error) {
      Alert({
        icon: 'error',
        title: '加入購物車時發生錯誤',
        timer: 1000,
      })
      console.error('加入購物車時發生錯誤:', error)
    }
  }
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
                <div className={cid_styles.filterBar}>
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
                    ? filteredProducts.length === 0
                      ? '無此商品'
                      : `共${filteredProducts.length}筆商品`
                    : products.length}
                </div>
                <div className={cid_styles.cardGroup}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                    />
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

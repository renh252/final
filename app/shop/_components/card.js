// FILEPATH: /components/ProductCard.js
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FaHeart, FaRegHeart, FaCartShopping } from 'react-icons/fa6'
import Card from '@/app/_components/ui/Card'
import Alert from '@/app/_components/alert'
import styles from '../shop.module.css'
import Modal from '@/app/_components/modal'
import { useSWRConfig } from 'swr'
import useSWR from 'swr'
import { useAuth } from '@/app/context/AuthContext'

const fetcher = (url) => fetch(url).then((res) => res.json())

const ProductCard = ({ product, isLiked: initialIsLiked }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [modalContent, setModalContent] = useState(null)
  const [warn, setWarn] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)
  const [flyingHeartStyle, setFlyingHeartStyle] = useState({})
  const heartRef = useRef(null)
  const { user, isAuthenticated } = useAuth()
  const { mutate } = useSWRConfig()
  const { data: shopData, error: shopError } = useSWR('/api/shop', fetcher)
  const { data: cartData, mutate: cartMutate } = useSWR(
    user?.id ? `/api/shop/cart?userId=${user?.id}` : null,
    fetcher
  )

  // 計算飛行心形的終點位置 (懸浮按鈕位置)
  useEffect(() => {
    const calculateEndPosition = () => {
      // 獲取視窗大小
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // 計算懸浮按鈕的位置 (右下角)
      const endX = windowWidth - 60 // 右邊距離窗口的距離
      const endY = windowHeight - 60 // 下邊距離窗口的距離

      return { endX, endY }
    }

    // 設置監聽視窗大小變化
    const handleResize = () => {
      const { endX, endY } = calculateEndPosition()
      setFlyingHeartStyle({
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
      })
    }

    // 初始計算
    handleResize()

    // 添加視窗大小變化監聽器
    window.addEventListener('resize', handleResize)

    // 組件卸載時清理
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (shopData && user) {
      const product_like = shopData.product_like || []
      const liked = product_like.some(
        (item) =>
          item.product_id === product.product_id && item.user_id === user.id
      )
      setIsLiked(liked)
    }
  }, [shopData, user, product.product_id])

  const toggleLike = async (event, productId) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated || !user) {
      Alert({
        icon: 'warning',
        title: '請先登入',
        text: '登入後才能收藏商品',
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

    // 紀錄原始收藏狀態，以便確定是否為加入收藏操作
    const isAddingToFavorites = !isLiked

    try {
      // 如果是添加收藏，則觸發飛行愛心動畫
      if (isAddingToFavorites && heartRef.current) {
        // 獲取心形按鈕的位置作為動畫起點
        const heartRect = heartRef.current.getBoundingClientRect()
        const startX = heartRect.left + heartRect.width / 2
        const startY = heartRect.top + heartRect.height / 2

        // 獲取視窗大小
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        // 計算懸浮按鈕的位置 (右下角)
        const endX = windowWidth - 60 // 右邊距離窗口的距離
        const endY = windowHeight - 60 // 下邊距離窗口的距離

        // 創建飛行愛心元素並添加到body
        const flyingHeart = document.createElement('div')
        flyingHeart.className = styles.flyingHeart
        flyingHeart.innerHTML =
          '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>'

        // 設置飛行愛心樣式
        Object.assign(flyingHeart.style, {
          position: 'fixed',
          left: startX + 'px',
          top: startY + 'px',
          transform: 'translate(-50%, -50%)',
          fontSize: '20px',
          color: '#d75951',
          zIndex: '9999',
          pointerEvents: 'none',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${styles.flyToFloatingButton} 1s cubic-bezier(0.17, 0.89, 0.32, 1.49) forwards`,
        })

        // 設置 CSS 變數作為動畫參數
        flyingHeart.style.setProperty('--start-x', `${0}px`)
        flyingHeart.style.setProperty('--start-y', `${0}px`)
        flyingHeart.style.setProperty('--end-x', `${endX - startX}px`)
        flyingHeart.style.setProperty('--end-y', `${endY - startY}px`)

        document.body.appendChild(flyingHeart)

        // 動畫結束後移除元素
        flyingHeart.addEventListener('animationend', () => {
          document.body.removeChild(flyingHeart)
        })

        // 先本地更新UI狀態
        setIsLiked(true)
      }

      // 然後再進行API調用
      const response = await fetch('/api/shop/product_like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
          action: isLiked ? 'remove' : 'add',
        }),
      })

      if (response.ok) {
        if (!isAddingToFavorites) {
          // 如果是取消收藏，才在這裡更新狀態
          setIsLiked(false)
        }
        mutate('/api/shop') // 更新商品列表數據
      } else {
        // 如果API調用失敗，還原UI狀態
        if (isAddingToFavorites) {
          setIsLiked(false)
        }
        throw new Error('收藏操作失敗')
      }
    } catch (error) {
      console.error('收藏操作錯誤:', error)
      Alert({
        icon: 'error',
        title: '操作失敗',
        text: '請稍後再試',
        timer: 1000,
      })
    }
  }

  const getVariant = async (event, productId, productName) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated || !user) {
      Alert({
        icon: 'warning',
        title: '請先登入',
        text: '登入後才能將商品加入購物車',
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

      if (!data) {
        throw new Error(data.message)
      }

      const { variants } = data
      const calculateDiscountedPrice = (price) => {
        return product.discount_percentage
          ? Math.ceil((price * (100 - product.discount_percentage)) / 100)
          : price
      }

      setModalContent(
        <Modal
          isOpen={true}
          onClose={() => setModalContent(null)}
          showCloseButton={true}
          showConfirmButton={true}
          onConfirm={() => {
            const selectedInput = document.querySelector(
              'input[name="variant"]:checked'
            )
            const quantityInput = document.getElementById('quantity')
            const quantity = parseInt(quantityInput.value) || 1
            if (selectedInput) {
              const selectedVariantId = selectedInput.value
              addToCart(product.product_id, selectedVariantId, quantity)
              return true
            } else {
              setWarn('請選擇規格')
              return false
            }
          }}
        >
          <h1>{productName}</h1>
          <div className={styles.cartVariant}>
            {(() => {
              const firstInStockIndex = variants.findIndex(
                (v) => v.stock_quantity > 0
              )
              return variants.map((variant, index) => {
                const originalPrice = variant.price
                const discountedPrice = calculateDiscountedPrice(originalPrice)
                const isOutOfStock = variant.stock_quantity <= 0
                const shouldBeChecked =
                  firstInStockIndex === -1
                    ? index === 0
                    : index === firstInStockIndex
                return (
                  <label key={variant.variant_id}>
                    <input
                      type="radio"
                      id={`variant-${variant.variant_id}`}
                      name="variant"
                      value={variant.variant_id}
                      defaultChecked={shouldBeChecked}
                      disabled={isOutOfStock}
                      onChange={() => {
                        const quantityInput =
                          document.getElementById('quantity')
                        if (quantityInput) {
                          quantityInput.max = variant.stock_quantity
                          if (
                            parseInt(quantityInput.value) >
                            variant.stock_quantity
                          ) {
                            quantityInput.value = variant.stock_quantity
                          }
                        }
                      }}
                    />
                    {variant.variant_name} (庫存: {variant.stock_quantity}) -
                    {discountedPrice !== originalPrice ? (
                      <p>
                        ${discountedPrice} <span>${originalPrice}</span>
                      </p>
                    ) : (
                      <p>${originalPrice}</p>
                    )}
                  </label>
                )
              })
            })()}
          </div>
          <div id="quantity-selection" className={styles.cartquantity}>
            <label>
              數量：
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                defaultValue="1"
                max={
                  variants[
                    variants.findIndex((v) => v.stock_quantity > 0) !== -1
                      ? variants.findIndex((v) => v.stock_quantity > 0)
                      : 0
                  ].stock_quantity
                }
                onChange={(e) => {
                  const selectedVariant = document.querySelector(
                    'input[name="variant"]:checked'
                  )
                  if (selectedVariant) {
                    const variantId = selectedVariant.value
                    const variant = variants.find(
                      (v) => v.variant_id.toString() === variantId
                    )
                    if (variant) {
                      const inputValue = parseInt(e.target.value)
                      if (inputValue > variant.stock_quantity) {
                        e.target.value = variant.stock_quantity
                      } else if (inputValue < 1) {
                        e.target.value = 1
                      }
                    }
                  }
                }}
              />
            </label>
          </div>
        </Modal>
      )
    } catch (error) {
      console.error('Error fetching product info:', error)
      setModalContent(null)
      Alert({
        icon: 'error',
        title: '獲取商品信息失敗',
        text: '請稍後再試',
      })
    }
  }

  const addToCart = async (productId, variantId, quantity) => {
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
        setModalContent(null)
        cartMutate()
        Alert({
          icon: 'success',
          title: '成功加入購物車',
          timer: 1000,
        })
      } else {
        setModalContent(null)
        Alert({
          icon: 'error',
          title: '加入購物車失敗',
          timer: 1000,
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

  return (
    <div className={styles.productCardWrapper}>
      {modalContent}
      <Link href={`/shop/${product.product_id}`}>
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
                  (product.price * (100 - product.discount_percentage)) / 100
                )}{' '}
                <del>${product.price}</del>
              </p>
            ) : (
              <p>${product.price}</p>
            )}
            <div className={styles.cardBtns}>
              <button
                className={styles.likeButton}
                onClick={(event) => toggleLike(event, product.product_id)}
                aria-label={isLiked ? '取消收藏' : '加入收藏'}
                ref={heartRef}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
              <button
                className={styles.cartBtn}
                onClick={(event) =>
                  getVariant(event, product.product_id, product.product_name)
                }
              >
                <FaCartShopping />
              </button>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

export default ProductCard

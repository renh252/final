// FILEPATH: /components/ProductCard.js
import React, { useState,useEffect } from 'react'
import Link from 'next/link'
import { FaHeart, FaRegHeart, FaCartShopping } from 'react-icons/fa6'
import Card from '@/app/_components/ui/Card'
import styles from '@/app/shop/shop.module.css'
import { useAuth } from '@/app/context/AuthContext'
import { useSWRConfig } from 'swr'
import Alert from '@/app/_components/alert'
import Modal from '@/app/_components/modal'
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())



const ProductCard = ({ product, isLiked: initialIsLiked }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [modalContent, setModalContent] = useState(null)
  const [warn, setWarn] = useState('')
  const { user, isAuthenticated } = useAuth()
  const { mutate } = useSWRConfig()
  const { data: shopData, error: shopError } = useSWR('/api/shop', fetcher)
  const { data: cartData, mutate: cartMutate } = useSWR(
    user?.id ? `/api/shop/cart?userId=${user?.id}` : null,
    fetcher
  )

  useEffect(() => {
    if (shopData && user) {
      const product_like = shopData.product_like || []
      const liked = product_like.some(
        (item) => item.product_id === product.product_id && item.user_id === user.id
      )
      setIsLiked(liked)
    }
  }, [shopData, user, product.product_id])

  const toggleLike = async (productId) => {
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

    try {
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
        setIsLiked(!isLiked)
        mutate('/api/shop') // 更新商品列表數據
        Alert({
          icon: 'success',
          title: isLiked ? '已取消收藏' : '已加入收藏',
          timer: 1000,
        })
      } else {
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


  const getVariant = async (productId, productName) => {
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
                        const quantityInput = document.getElementById('quantity')
                        if (quantityInput) {
                          quantityInput.max = variant.stock_quantity
                          if (parseInt(quantityInput.value) > variant.stock_quantity) {
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
                  const selectedVariant = document.querySelector('input[name="variant"]:checked')
                  if (selectedVariant) {
                    const variantId = selectedVariant.value
                    const variant = variants.find((v) => v.variant_id.toString() === variantId)
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
    <>
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
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                toggleLike(product.product_id)
              }}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button
              className={styles.cartBtn}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                getVariant(product.product_id, product.product_name)
              }}
            >
              <FaCartShopping />
            </button>
          </div>
        </div>
      </Card>
    </Link>
    </>
  )
}

export default ProductCard
'use client'

import React, { useRef, useState } from 'react'
import { IconLine } from '@/app/shop/_components/icon_line'
import Link from 'next/link'
// style
import styles from '@/app/shop/shop.module.css'
// card
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaRegHeart, FaHeart,FaLongArrowAltRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
// auth
import { useAuth } from '@/app/context/AuthContext'

//firstPageNav
import FirstPageNav from '@/app/shop/_components/firstPageNav'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PetsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()  
  const [searchTerm, setSearchTerm] = useState('')
  // 处理搜索按钮点击
  const handleSearch = (e) => {
    e.preventDefault()  // 防止表单默认提交行为
    if (searchTerm.trim()) {
      // 使用 encodeURIComponent 来正确处理 URL 中的特殊字符
      router.push(`/shop/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  // 卡片滑動
  const promotionRef = useRef({})
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

  // 获取数据
  const promotions = data.promotions
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

  // 创建一个Set来存储所有有商品的分类ID
  const categoriesWithProducts = new Set(
    products.map((product) => product.category_id)
  )
  // 检查父类别是否有至少一个包含商品的子类别
  const parentHasProductsInChildren = (parentId) => {
    return categories.some(
      (category) =>
        category.parent_id === parentId &&
        categoriesWithProducts.has(category.category_id)
    )
  }

  // 过滤出有商品的子类别
  const getChildrenWithProducts = (parentId) => {
    return categories.filter(
      (category) =>
        category.parent_id === parentId &&
        categoriesWithProducts.has(category.category_id)
    )
  }

  // 过滤出有商品子类别的父类别
  const parentsWithProducts = categories.filter(
    (category) =>
      category.parent_id == null &&
      parentHasProductsInChildren(category.category_id)
  )
  // -----------------
  return (
    <>
      {/* main */}
      <main className={styles.main}>
      {/* search */}
      <form onSubmit={handleSearch} className={styles.search}>
        <input 
          type="search" 
          placeholder="搜尋全站商品..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className='button'>搜尋</button>
      </form>
      <FirstPageNav />
        <div className={styles.contains}>
          {/* 促銷區 */}
          {promotions.map((promotion) => {
            return (
              <div key={promotion.promotion_id} className={styles.contain}>
                <div className={styles.contain_title}>
                  <div className={styles.title}>{promotion.promotion_name}</div>
                  {/* <IconLine
                    key={promotion.promotion_id}
                    title={promotion.promotion_name}
                  /> */}
                  <Link href={`/shop/promotions/${promotion.promotion_id}`} className={styles.viewMore}>
                    <p>查看更多</p> <FaLongArrowAltRight/>
                  </Link>
                </div>
                <div className={styles.contain_body}>
                  <div className={styles.group}>
                    <div className={styles.groupBody}>
                      <CardSwitchButton
                        direction="left"
                        onClick={() =>
                          scroll(
                            -1,
                            promotionRef.current[promotion.promotion_id]
                          )
                        }
                        aria-label="向左滑動"
                      />
                      <div
                        className={styles.cardGroup}
                        ref={(el) =>
                          (promotionRef.current[promotion.promotion_id] = {
                            current: el,
                          })
                        }
                      >
                        {products
                          .filter(
                            (product) =>
                              product.promotion_id == promotion.promotion_id
                          )
                          .map((product) => {
                            return (
                              <Link
                                key={`${promotion.promotion_name}${product.product_id}`}
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
                                  {product?.discount_percentage
                                    ? 
                                    <p>
                                      ${Math.ceil(product.price * (100 - product.discount_percentage) / 100)} <del>${product.price}</del>
                                    </p>
                                    :<p>
                                        ${product.price}
                                      </p> 
                                    }
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
                      {/* <div className={styles.cardContainer}>
                        </div> */}
                      <CardSwitchButton
                        direction="right"
                        onClick={() =>
                          scroll(
                            1,
                            promotionRef.current[promotion.promotion_id]
                          )
                        }
                        aria-label="向右滑動"
                      />
                      {/* <button className={styles.angle}>
                          <FaAngleRight/>
                        </button> */}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* 主分類區 */}
          {parentsWithProducts.map((parent) => (
            <div key={parent.category_id} className={styles.contain}>
              <div className={styles.contain_title}>
                <IconLine
                  key={parent.category_id}
                  title={parent.category_name}
                />
              </div>
              <div className={styles.contain_body}>
                {/* 子分類區 */}
                {getChildrenWithProducts(parent.category_id).map((category) => (
                  <div className={styles.group} key={category.category_id}>
                    <div className={styles.groupTitle}>
                      <p>{category.category_name}</p>
                      <Link href={`/shop/categories/${parent.category_id}/${category.category_id}`} className={styles.viewMore}>
                        <p>查看更多</p> <FaLongArrowAltRight/>
                      </Link>
                    </div>
                    <div className={styles.groupBody}>
                      <CardSwitchButton
                        direction="left"
                        onClick={() =>
                          scroll(-1, categoryRefs.current[category.category_id])
                        }
                        aria-label="向左滑動"
                      />
                      <div
                        className={styles.cardGroup}
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
                                  key={product.product_id}
                                  image={
                                    product.image_url ||
                                    '/images/default_no_pet.jpg'
                                  }
                                  title={product.product_name}
                                >
                                  <div className={styles.cardText}>
                                    {product?.discount_percentage
                                      ? 
                                      <p>
                                        ${Math.ceil(product.price * (100 - product.discount_percentage) / 100)} <del>${product.price}</del>
                                      </p>
                                      :<p>
                                          ${product.price}
                                        </p> 
                                      }
                                      {/* <p>
                                        ${product.price*Math.ceil((100-product.discount_percentage)/100)} <del>${product.price}</del>
                                      </p>  */}
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

                      <CardSwitchButton
                        direction="right"
                        onClick={() =>
                          scroll(1, categoryRefs.current[category.category_id])
                        }
                        aria-label="向左滑動"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

// https://tse3.mm.bing.net/th?id=OIP.qtqz5bqN6loOFszu011VIgHaE8&pid=Api&P=0&h=180

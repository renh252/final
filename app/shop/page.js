'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { usePageTitle } from '@/app/context/TitleContext'
import { useRouter } from 'next/navigation'
// style
import styles from '@/app/shop/shop.module.css'
// card
import ProductCard from '@/app/shop/_components/card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import {  FaLongArrowAltRight } from 'react-icons/fa'
// components
import Carousel from '@/app/shop/_components/carousel'

//firstPageNav
import FirstPageNav from '@/app/shop/_components/firstPageNav'
import FixedElements from '@/app/shop/_components/FixedElements'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ShopPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  usePageTitle('商城')
  // 处理搜索按钮点击
  const handleSearch = (e) => {
    e.preventDefault() // 防止表单默认提交行为
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
  const { data, error } = useSWR('/api/shop', fetcher)



  // 处理加载状态
  if (!data) return <div>Loading...</div>

  // 处理错误状态
  if (error) return <div>Failed to load</div>

  // 获取数据
  const promotions = data.promotions
  const categories = data.categories
  const products = data.products

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

  return (
    <>
      <FixedElements menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
          <button type="submit" className="button">
            搜尋
          </button>
        </form>
        <FirstPageNav />
        <Carousel />
        <div className={styles.contains}>
          <div className={styles.title}>
            <p>毛孩優惠專區</p>
            <span>精選飼料、零食、玩具超值折扣，讓毛孩開心又健康！</span>
          </div>
          {/* 促銷區 */}
          {promotions ? (
            <div className={styles.contain}>
              <div className={styles.contain_title}>促銷活動區</div>
              <div className={styles.contain_body}>
                {promotions?.map((promotion) => {
                  return (
                    <div key={promotion.promotion_id} className={styles.group}>
                      <div className={styles.groupTitle}>
                        <p>{promotion.promotion_name}</p>
                        <Link
                          href={`/shop/promotions/${promotion.promotion_id}`}
                          className={styles.viewMore}
                        >
                          <p>查看更多</p> <FaLongArrowAltRight />
                        </Link>
                      </div>
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
                                <ProductCard
                                  key={product.product_id}
                                  product={product}
                                />
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
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className={styles.title}>
            <p>精選寵物用品</p>
            <span>快來挑選最適合你家寶貝的用品！</span>
          </div>
          {/* 主分類區 */}
          {parentsWithProducts?.map((parent) => (
            <div key={parent.category_id} className={styles.contain}>
              <div className={styles.contain_title}>
                {parent?.category_name}
              </div>
              <div className={styles.contain_body}>
                {/* 子分類區 */}
                {getChildrenWithProducts(parent.category_id).map((category) => (
                  <div className={styles.group} key={category.category_id}>
                    <div className={styles.groupTitle}>
                      <p>{category.category_name}</p>
                      <Link
                        href={`/shop/categories/${parent.category_id}/${category.category_id}`}
                        className={styles.viewMore}
                      >
                        <p>查看更多</p> <FaLongArrowAltRight />
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
                              <ProductCard
                                key={product.product_id}
                                product={product}
                              />
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

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
import ProductCard from '@/app/shop/_components/card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import {
  FaArrowLeft,
  FaLongArrowAltRight,
} from 'react-icons/fa'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { usePageTitle } from '@/app/context/TitleContext'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PagesProductTitle() {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid_parent = params?.cidParent
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
  const { data, error } = useSWR('/api/shop', fetcher)
  usePageTitle(
    data?.categories?.find((category) => category.category_id == cid_parent)
      ?.category_name
  )

  // 处理加载状态
  if (!data) return <div>Loading...</div>

  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products


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
                        <ProductCard
                          key={product.product_id}
                          product={product}
                        />
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

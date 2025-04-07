'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
import FixedElements from '@/app/shop/_components/FixedElements'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles from '@/app/shop/search/search.module.css'
// card
import ProductCard from '@/app/shop/_components/card'
import { FaArrowLeft } from 'react-icons/fa'

// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { usePageTitle } from '@/app/context/TitleContext'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CidPage() {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cidParent = params?.cidParent
  const cid = params?.cid
  const [menuOpen, setMenuOpen] = useState(false)

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
  usePageTitle(
    data?.categories?.find((category) => category.category_id == cid)
      ?.category_name
  )

  const [searchTerm, setSearchTerm] = useState('')

  const [sortOption, setSortOption] = useState('latest')

  // 处理加载状态
  if (!data) return <div>Loading...</div>

  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products

  // 检查当前类别是否存在，以及它的父类别是否正确
  const currentCategory = categories.find(
    (category) => category.category_id == cid
  )
  const parentCategory = categories.find(
    (category) => category.category_id == cidParent
  )
  const isValidCategory =
    currentCategory && currentCategory.parent_id == cidParent

  const filteredProducts = products
    .filter((product) => product.category_id == cid)
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

  // -----------------

  return (
    <>
      <div className={cid_styles.main}>
        {isValidCategory ? (
          <>
            <FixedElements menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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

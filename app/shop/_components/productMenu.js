'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams , usePathname } from 'next/navigation'
// style
import styles from './productMenu.module.css'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ProductMenu(props) {

// 從網址上得到動態路由參數
const params = useParams()
const pathname = usePathname()

// 獲取路徑的最後一個值
const lastPathSegment = pathname.split('/').pop()

 // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products
  const promotions = data.promotions

  // 创建一个Set来存储所有有商品的分类ID
  const categoriesWithProducts = new Set(products.map(product => product.category_id));
 
  // 检查父类别是否有至少一个包含商品的子类别
  const parentHasProductsInChildren = (parentId) => {
    return categories.some(category => 
      category.parent_id === parentId && categoriesWithProducts.has(category.category_id)
    );
  };

  // 过滤出有商品的子类别
  const getChildrenWithProducts = (parentId) => {
    return categories.filter(category => 
      category.parent_id === parentId && categoriesWithProducts.has(category.category_id)
    );
  };

  // 过滤出有商品子类别的父类别
  const parentsWithProducts = categories.filter(category => 
    category.parent_id == null && parentHasProductsInChildren(category.category_id)
  );
  // -----------------

  // 判断是否为活动页面
  const isPromotionPage = pathname.includes('/shop/promotions/')
  // 判断是否为类别页面
  const isCategoryPage = pathname.includes('/shop/categories/')

  return (
    <>
      <div className={styles.productMenu}>
      {promotions?.map((promotion) => (
        <div key={promotion.promotion_id}>
          <Link href = {`/shop/promotions/${promotion.promotion_id}`} className={`${styles.title} ${styles.parent} ${isPromotionPage && lastPathSegment == promotion.promotion_id? styles.active : ''}`}>
            <p>{promotion.promotion_name}</p>
          </Link>
        </div>
      ))}
      {parentsWithProducts.map((parent) => (
          <div key={parent.category_id}>
          <Link href = {`/shop/categories/${parent.category_id} `} className={`${styles.title} ${styles.parent} ${isCategoryPage && lastPathSegment == parent.category_id ? styles.active : ''}`}>
            <p>{parent.category_name}</p>
          </Link>
          {getChildrenWithProducts(parent.category_id).map((child) => (
            
              <Link key={child.category_id} href = {`/shop/categories/${parent.category_id}/${child.category_id}`} className={`${styles.title} ${styles.child} ${isCategoryPage && lastPathSegment == child.category_id ? styles.active : ''}`}
              >
                <p>{child.category_name}</p>
              </Link>
            
          ))}
          {/* {index < parentsWithProducts.length - 1 && <hr />} */}
          </div>
        ))}
        
      </div>
      
    </>
  )
}

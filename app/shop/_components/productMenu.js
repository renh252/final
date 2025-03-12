'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// style
import styles from './productMenu.module.css'
// data
import Category from '../_data/category.json'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ProductMenu(props) {

  
 // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products
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


  return (
    <>
      <div className={styles.productMenu}>
      {parentsWithProducts.map((parent) => (
          <>
          <Link href = {`/shop/categories/${parent.id} `} className={styles.title}>
            <p>{parent.category_name}</p>
          </Link>
          {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
            <>
              <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                <p>{child.category_name}</p>
              </Link>
            </>
          ))}
          <hr />
          </>
        ))}
        
      </div>
      
    </>
  )
}

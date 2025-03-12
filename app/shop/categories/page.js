'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// product_menu
import ProductMenu from '../_components/productMenu'
// style
import styles from '../shop.module.css'
import categories_styles from './categories.module.css'
// card
import Card from '../../_components/card'
import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";
import { FaRegHeart,FaHeart } from "react-icons/fa";
// data
import Products from '../_data/data.json'
import Category from '../_data/category.json'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())


export default function PagesProductTitle({title}) {
  
  // card愛心狀態
  /*
  const initState = Products.map((v) => {
    return { ...v, fav: false }
  })
  const [products, setproducts] = useState(initState)  
  const onToggleFav = (product_id) => {
    const nextProduct = products.map((v) => {
      if (v.id == product_id) {
        return { ...v, fav: !v.fav }
      } else {
        return v
      }
    })
    setproducts(nextProduct)
  }
  */


   // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  const products = data.products
  
  // const product_like = data.product_like

  // -----------------



  return (
    
    <>
      <div className={styles.header_space}></div>
      <div className={categories_styles.main}>
        <div className={styles.pageTitle}>
            <p className={styles.title}>商品類別</p>
            <div className="bread">
              
            </div>
        </div>
        <div className={categories_styles.container}>
          <div className="productMenu">
            <ProductMenu/>
          </div>
            <div className={categories_styles.contain_body}>
              {/* subTitle */}
              {/* subTitle */}
              {Category.filter((category) => category.parent_id == 1).map((category) => (
                <div className={styles.group} key={category.id}>
                  <div className={styles.groupTitle}>
                    <p>{category.category_name}</p>
                  </div>
                  <div className={styles.groupBody}>
                    <button className={styles.angle}>
                      <FaAngleLeft/>
                    </button>
                    <div className={styles.cardGroup}>
                      {products.filter((product) => product.category_id == category.id).map((product) => {
                        return(
                          <>
                            <Link href={``}>
                              <Card
                                key={product.	product_id}
                                image={product.image_url}
                                title={product.product_name}
                              >
                                <div className={styles.cardText}>
                                  <p>${product.price} <del>${product.price}</del></p>
                                  <button className={styles.likeButton} onClick={(event)=>{     
                                    event.preventDefault();
                                    event.stopPropagation();
                                    // onToggleFav(product.id)
                                    }}>
                                    {product.fav ? <FaHeart/> : <FaRegHeart/>}
                                  </button>
                                </div>
                              </Card>
                            </Link>

                          </>
                        )
                      })}
                    </div>
                    <button className={styles.angle}>
                      <FaAngleRight/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          
        </div>
      </div>
    </>
  )
}

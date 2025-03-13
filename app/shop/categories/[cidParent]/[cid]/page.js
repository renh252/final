'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import cid_styles  from './cid.module.css'
// card
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaRegHeart,FaHeart } from "react-icons/fa";

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())



export default function CidPage(props) {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid = params?.cid

  
  // card愛心狀態
  /*const initState = Products.map((v) => {
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
      <div className={cid_styles.main}>
        <div className={styles.pageTitle}>
            <p className={styles.title}>商品類別</p>
            <div className="bread">
              
            </div>
        </div>
        <div className={cid_styles.container}>
          <div className="productMenu">
            <ProductMenu/>
          </div>
            <div className={cid_styles.contain_body}>
              <div className="select">
                
              </div>
              <div className={cid_styles.cardGroup}>
                {products.filter((product) => product.category_id == cid).map((product) => {
                  return(
                    <>
                      <Link href={``}>
                        <Card
                          key={product.	product_id}
                          image={product.image_url ||
                          '/images/default_no_pet.jpg'}
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
            </div>
          
        </div>
      </div>
    </>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
// product_menu
import ProductMenu from '../../../_components/productMenu'
// card
import Card from '../../../_components/card'
import { FaRegHeart,FaHeart } from "react-icons/fa";
// data
import Products from '../../../_data/data.json'
// style
import styles from '../../../shop.module.css'
import cid_styles from './cid.module.css'


export default function CidPage(props) {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid = params?.cid

  
  // card愛心狀態
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
                    <Card
                      key={product.id}
                      image={product.image}
                      title={product.title}
                      text1= {`$${product.price}`}
                      text1_del={`$${product.price}`}
                      btn_text={product.fav ? <FaHeart/> : <FaRegHeart/>}
                      btn_color='red'
                      btn_onclick={() => {onToggleFav(product.id)}}
                    />
                  )
                })}
              </div>
            </div>
          
        </div>
      </div>
    </>
  )
}

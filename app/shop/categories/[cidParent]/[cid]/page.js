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
import { FaArrowLeft,FaRegHeart,FaHeart } from "react-icons/fa";

// components
import {Breadcrumbs} from '@/app/_components/breadcrumbs'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())



export default function CidPage(props) {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cidParent = params?.cidParent
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
  
  
  // 检查当前类别是否存在，以及它的父类别是否正确
  const currentCategory = categories.find(category => category.category_id == cid)
  const parentCategory = categories.find(category => category.category_id == cidParent)
  const isValidCategory = currentCategory && currentCategory.parent_id == cidParent

  // const product_like = data.product_like

  // -----------------

  return (
    <>

      <div className={cid_styles.main}>
      {isValidCategory 
      ? (
        <>
        <Breadcrumbs
            title={currentCategory.category_name}
            items={[
              { label: '商城', href: `/shop` },
              { label: parentCategory.category_name, href: `/shop/categories/${cidParent}` },
              { label: currentCategory.category_name, href: `/shop/categories/${cidParent}/${cid}` }
            ]}
          />
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
                    <Link key={product.	product_id} href={`/shop/${product.product_id}`}>
                      <Card
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
                  )
                })}
              </div>
            </div>
          
        </div>
        </>
      )
      :(
        <div className={cid_styles.noCategory}>
          <Link href='/shop'>
            <div><FaArrowLeft/>返回商城</div>
          </Link>
          <p>查無此類別</p>
        </div>

      )}
      </div>
    </>
  )
}

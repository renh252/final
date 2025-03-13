'use client'

import React, { useState, useEffect ,useRef} from 'react'
import Link from 'next/link'
// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import categories_styles from '../categories.module.css'
// card
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaRegHeart,FaHeart } from "react-icons/fa";
import { useParams } from 'next/navigation'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())


export default function PagesProductTitle() {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid_parent = params?.cidParent

  
  // card愛心狀態
/*  const initState = Products.map((v) => {
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
      {/* <div className={styles.header_space}></div> */}
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
              {categories.filter((category) => category.parent_id == cid_parent).map((category) => (
                <div className={styles.group} key={category.id}>
                  <div className={styles.groupTitle}>
                    <p>{category.category_name}</p>
                  </div>
                  <div className={styles.groupBody}>
                    <CardSwitchButton
                      direction="left"
                      onClick={() => scroll(-1, categoryRefs.current[category.category_id])}
                      aria-label="向左滑動"
                    />
                    <div className={styles.cardGroup} ref={(el) => (categoryRefs.current[category.category_id] = { current: el })}>
                      {products.filter((product) => product.category_id == category.category_id).map((product) => {
                        return(
                            <>
                            <Link href={`/shop/${product.product_id}`}>
                              <Card
                                key={product.	product_id}
                                image={product.image_url || '/images/default_no_pet.jpg'}
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
                    
                    
                    <CardSwitchButton
                      direction="right"
                      onClick={() => scroll(1, categoryRefs.current[category.category_id])}
                      aria-label="向左滑動"
                    />
                  </div>
                </div>
              ))}
            </div>
          
        </div>
      </div>
    </>
  )
}

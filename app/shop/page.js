
'use client'

import React, {  useRef, useState} from 'react'
import IconLine from '@/app/shop/_components/icon_line'
import Link from 'next/link'
// style
import styles from '@/app/shop/shop.module.css'
// card
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaRegHeart,FaHeart } from "react-icons/fa";

//firstPageNav 
import FirstPageNav from '@/app/shop/_components/firstPageNav'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())











export default function PetsPage() {
  



  // 卡片滑動-------------------------------
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
 

/*
  // console.log(Products);
  // 擴充一個能代表是否有加入收藏(我的最愛)的屬性fav，它是一個布林值，預設為false
  const initState = Products.map((v) => {
    return { ...v, fav: false }
  })
  // 因為需要切換網頁上的加入收藏圖示
  const [products, setproducts] = useState(initState)  
  // 處理切換fav屬性(布林值)
  const onToggleFav = (product_id) => {
    
    // 利用map展開陣列
    const nextProduct = products.map((v) => {
      // 在成員(物件)中比對isbn為bookIsbn的成員
      if (v.id == product_id) {
        // 如果比對出isbn為bookIsbn的成員，展開物件後fav布林值"反相"(!v.fav)
        return { ...v, fav: !v.fav }
      } else {
        // 否則直接返回物件
        return v
      }
    })

    // 步驟3: 設定到狀態中
    setproducts(nextProduct)
  }
*/


  // 處理喜愛商品數據
  // const toggleLike = async (productId) => {
  //   const isLiked = product_like.some(product => product.product_id === productId)
  //   const url = '/api/shop/product_like'
  //   const method = isLiked ? 'DELETE' : 'POST'

  //   try {
  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ productId }),
  //     })

  //     if (response.ok) {
  //       // 重新獲取喜愛商品數據
  //       mutate()
  //     }
  //   } catch (error) {
  //     console.error('Error toggling like:', error)
  //   }
  // }

     // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  // 获取 promotions 数据
  const promotions = data.promotions
  const promotion_products = data.promotion_products
  const categories = data.categories
  const products = data.products
  
  // const product_like = data.product_like

 
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
      {/* main */}
      <FirstPageNav/>
      <main className={styles.main}>
        <div className={styles.contains}>
          {/* contain */}
          {promotions.map((promotion) => {
            return(
              <div key={promotion.promotion_id} className={styles.contain}>
                <div className={styles.contain_title}>
                  <IconLine key={promotion.promotion_id} title={promotion.promotion_name}/>
                </div>
                <div className={styles.contain_body}>
                  <div className={styles.group}>
                      <div className={styles.groupBody}>
                        <CardSwitchButton
                          direction="left"
                          onClick={() =>scroll(-1, promotionRef.current[promotion.promotion_id])}
                          aria-label="向左滑動"
                        />
                          <div  className={styles.cardGroup} ref={(el) => (promotionRef.current[promotion.promotion_id] = { current: el })}>
                            {promotion_products.filter((product) => product.promotion_id == promotion.promotion_id).map((product) => {
                              return(
                                <Link
                                key={`${promotion.promotion_name}${product.product_id}`}
                                 href={`/shop/${product.product_id}`}>
                                  <Card
                                    image={product.image_url || '/images/default_no_pet.jpg'}
                                    title={product.product_name}
                                  >
                                    <div className={styles.cardText}>
                                      <p>${product.price} <del>${product.price}</del></p>
                                      <button className={styles.likeButton} onClick={(event)=>{
                                        event.preventDefault();
                                        event.stopPropagation();
                                        // toggleLike(product.product_id);
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
                          {/* <div className={styles.cardContainer}>
                        </div> */}
                    <CardSwitchButton
                      direction="right"
                      onClick={() => scroll(1, promotionRef.current[promotion.promotion_id])}
                      aria-label="向右滑動"
                    />
                        {/* <button className={styles.angle}>
                          <FaAngleRight/>
                        </button> */}
                      </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* contain */}
          {parentsWithProducts.map((parent) => (
          <div key={parent.category_id}  className={styles.contain}>
            <div className={styles.contain_title}>
              <IconLine key={parent.category_id} title={parent.category_name}/>
            </div>
            <div className={styles.contain_body}>
              {/* subTitle */}
              {getChildrenWithProducts(parent.category_id).map((category) => (
                <div className={styles.group} key={category.category_id}>
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
                            <Link key={product.	product_id} href={`/shop/${product.product_id}`}>
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
          ))}
        </div>
      </main>
    </>
  )
}

// https://tse3.mm.bing.net/th?id=OIP.qtqz5bqN6loOFszu011VIgHaE8&pid=Api&P=0&h=180

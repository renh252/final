
'use client'

import React, {  useRef, useState} from 'react'
import IconLine from './_components/icon_line'
import Link from 'next/link'
// style
import styles from './shop.module.css'
// data
import Products from './_data/data.json'
import Category from './_data/category.json'
// card
import Card from '../_components/ui/Card'
import CardSwitchButton from '../_components/ui/CardSwitchButton'
// import Card from './_components/card'
import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";
import { FaRegHeart,FaHeart } from "react-icons/fa";

//firstPageNav 
import FirstPageNav from './_components/firstPageNav'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())











export default function PetsPage() {

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data: petsData, error: petsError } = useSWR(
    '/api/shop-data?type=products',
    fetcher
  )


  // 卡片滑動-------------------------------
  const promotionRef = useRef(null)
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




  console.log(Products);
  // 擴充一個能代表是否有加入收藏(我的最愛)的屬性fav，它是一個布林值，預設為false
  const initState = Products.map((v) => {
    return { ...v, fav: false }
  })
  // 因為需要切換網頁上的加入收藏圖示
  const [products, setproducts] = useState(initState)  
  // 處理切換fav屬性(布林值)
  const onToggleFav = (product_id) => {
    event.stopPropagation(); 
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

  return (
    <>
      {/* main */}
      <FirstPageNav/>
      <main className={styles.main}>
        <div className={styles.contains}>
          {/* contain */}
          <div className={styles.contain}>
            <div className={styles.contain_title}>
              <IconLine key={'8折優惠區'} title={'8折優惠區'}/>
            </div>
            <div className={styles.contain_body}>
              <div className={styles.group}>
                  <div className={styles.groupBody}>
                    <CardSwitchButton
                      direction="left"
                      onClick={() => scroll(-1, promotionRef)}
                      aria-label="向左滑動"
                    />
                      <div className={styles.cardGroup} ref={promotionRef}>
                        {products.map((product) => {
                          return(
                            <>
                            <Link href={``}>
                              <Card
                                key={product.id}
                                image={product.image}
                                title={product.title}
                              >
                                <div className={styles.cardText}>
                                  <p>${product.price} <del>${product.price}</del></p>
                                  <button className={styles.likeButton} onClick={(event)=>{
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onToggleFav(product.id)}}>
                                    {product.fav ? <FaHeart/> : <FaRegHeart/>}
                                  </button>
                                </div>
                              </Card>
                            </Link>
                            </>
                          )
                        })}
                      </div>
                      {/* <div className={styles.cardContainer}>
                    </div> */}
                <CardSwitchButton
                  direction="right"
                  onClick={() => scroll(1, promotionRef)}
                  aria-label="向右滑動"
                />
                    {/* <button className={styles.angle}>
                      <FaAngleRight/>
                    </button> */}
                  </div>
              </div>
            </div>
          </div>

          {/* contain */}
          <div className={styles.contain}>
            <div className={styles.contain_title}>
              <IconLine key={'title'} title={'title'}/>
            </div>
            <div className={styles.contain_body}>
              {/* subTitle */}
              {Category.filter((category) => category.parent_id == 1).map((category) => (
                <div className={styles.group} key={category.id}>
                  <div className={styles.groupTitle}>
                    <p>{category.category_name}</p>
                  </div>
                  <div className={styles.groupBody}>
                    <CardSwitchButton
                      direction="left"
                      onClick={() => scroll(-1, categoryRefs.current[category.id])}
                      aria-label="向左滑動"
                    />
                    <div className={styles.cardGroup} ref={(el) => (categoryRefs.current[category.id] = { current: el })}>
                      {products.filter((product) => product.category_id == category.id).map((product) => {
                        return(
                            <>
                            <Link href={``}>
                              <Card
                                key={product.id}
                                image={product.image}
                                title={product.title}
                              >
                                <div className={styles.cardText}>
                                  <p>${product.price} <del>${product.price}</del></p>
                                  <button className={styles.likeButton} onClick={(event)=>{     
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onToggleFav(product.id)}}>
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
                      onClick={() => scroll(1, categoryRefs.current[category.id])}
                      aria-label="向左滑動"
                    />
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// https://tse3.mm.bing.net/th?id=OIP.qtqz5bqN6loOFszu011VIgHaE8&pid=Api&P=0&h=180

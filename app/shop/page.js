
'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import IconLine from './_components/icon_line'
// import Link from 'next/link'
// style
import styles from './shop.module.css'
// data
import Products from './_data/data.json'
import Category from './_data/category.json'
// card
import Card from './_components/card'
import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";
import { FaRegHeart,FaHeart } from "react-icons/fa";


// 
import FirstPageNav from './_components/firstPageNav'

import Try from './_components/try'


export default function PetsPage() {
  console.log(Products);
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

  return (
    <>
    <Try/>
      {/* <div className={styles.banner}>
        <Image
          src="/images/Banner.jpg"
          alt="圖片描述"
          layout="responsive"
          width={100}
          height={200}
          priority
        />
        <div className={styles.banner_title}>商城</div>
      </div> */}
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
                    <button className={styles.angle}>
                      <FaAngleLeft/>
                    </button>
                    <div className={styles.cardGroup}>
                      {products.map((product) => {
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
                    <button className={styles.angle}>
                      <FaAngleRight/>
                    </button>
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
                    <button className={styles.angle}>
                      <FaAngleLeft/>
                    </button>
                    <div className={styles.cardGroup}>
                      {products.filter((product) => product.category_id == category.id).map((product) => {
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
                    <button className={styles.angle}>
                      <FaAngleRight/>
                    </button>
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

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// styles
import styles from './pid.module.css'
import { FaShareNodes } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

// components


// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())


export default function PidPage(props) {
  const [count, setCount] = useState(0)  

  // 從網址上得到動態路由參數
  const params = useParams()
  const pid = params?.pid

   // 使用 SWR 獲取資料 - 使用整合的 API 路由
    const { data, error } = useSWR(`/api/shop/${pid}`, fetcher)
   // 处理加载状态
    if (!data) return <div>Loading...</div>
      
    // 处理错误状态
    if (error) return <div>Failed to load</div>
  
    // 获取 promotions 数据

    let { product ,product_imgs, promotion, variants } = data
    console.log(variants);
    console.log(promotion);
    
    
    
    
    
     // 检查是否有自定义图片
  const hasCustomImages = (product_imgs && product_imgs.length > 0) || product?.image_url


   

  return (
    
      <main className={styles.main}>
          <div className={styles.row}>
              <div className={styles.imgs}>
                <div className={styles.imgContainer}>
                  <Image 
                    src={product.image_url 
                    ? product.image_url 
                    : '/images/default_no_pet.jpg'}
                    alt={pid} 
                    // className={styles.image} 
                    width={600} 
                    height={600}
                  />
                </div>
                <div className={styles.img_group}>
                  {hasCustomImages 
                    ?(
                    <div className={styles.imgs} key={pid}>
                      <div className={styles.img} key={pid}>
                        <Image 
                        src={product.image_url}
                        alt={product.product_name}
                        width={100}
                        height={100} />
                      </div>
                      {product_imgs?.map((img, index) => (
                        <div className={styles.img} key={pid}>
                          <Image 
                          key={index}
                          src={img.image_url}
                          alt={`Product image ${index + 1}`}
                          width={100}
                          height={100} />
                        </div>
                      ))}
                      </div>
                    )
                    :(
                      <div className={styles.imgs} key={pid}>
                        <div className={styles.imgsContainer}>
                          <Image 
                          src='/images/default_no_pet.jpg'
                          alt='Default product image'
                          width={100}
                          height={100}/>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <div className={styles.col}>
                  <div className={styles.productType}>
                    <p className={styles.h3}>{product.product_name}</p>
                    <div className={styles.iconGroup}>
                      <div className={styles.comment}>
                        庫存:{product.stock_quantity}
                      </div>
                      <div className={styles.comment}>
                      <FaRegHeart />:{product.stock_quantity}
                      </div>
                      <div className={styles.comment}>
                        <FaShareNodes/>
                      </div>
                    </div>
                  </div>
                  <div className={styles.productType}>
                    <div>
                      <p className={styles.h3}>${product.price}</p>
                      <p className={styles.p2}><del>${product.price}</del></p>
                    </div>
                    <div className={styles.iconGroup}>
                      <div className={styles.comment}>
                      <FaRegStar />:{product.stock_quantity}
                      </div>
                      <div className={styles.comment}>
                        <IoChatboxEllipsesOutline />
                      </div>
                    </div>
                  </div>
                  {variants?.length > 0
                  ?
                  <div className={styles.productVariant}>
                    <div>
                      <p className={styles.p2}>款式</p>
                    </div>
                    <div>
                      {variants.map(variant => {
                        return(
                          <div key={variant.variant_id} className={styles.comment}>
                            {variant.variant_name}
                          </div>
                        )
                      }
                      )}
                    </div>
                  </div>
                  :''}
                  <div className={styles.productType}>
                    <div className={styles.countBtn}>
                      <FaPlus onClick={()=>{}}/>
                      {count}
                      <FaMinus onClick={()=>{}}/>
                    </div>
                    <div className={styles.countBtn}>
                    <FaCartShopping />
                    加入購物車
                    </div>
                  </div>
                  {promotion.length > 0
                  ?
                  promotion.map((p) => {
                    return(
                    <div key={p.promotion_id} className={styles.productPromotion}>
                      <IoCheckmarkDoneSharp />
                      {/* <Link href={'/'}> */}
                        {p.promotion_name}
                      {/* </Link> */}
                    </div>
                    )
                  })
                  :
                  ''
                  }
                  
              </div>
          </div>

      </main>
  )
}

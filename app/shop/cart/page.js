'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// styles
import styles from './cart.module.css'
import { FaPlus, FaMinus ,FaX } from 'react-icons/fa6'
// components
import Alert from '@/app/_components/alert'

// 連接資料庫
import useSWR, { mutate } from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CartPage() {
  
  const { data, error } = useSWR('/api/shop/cart', fetcher)

  const handleDeleteCart = async () => {
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'DELETE',
      })
      if (response.ok) {
        // 重新獲取購物車數據
        mutate('/api/shop/cart')
      } else {
        console.error('刪除購物車失敗')
      }
    } catch (error) {
      console.error('刪除購物車時發生錯誤:', error)
    }
  }


  const handleClick = () => {
    Alert({ 
      title:'確定要清除購物車嗎?',
      // text:'確定要清除購物車嗎?',
      // icon:'success',

      showconfirmBtn: true,
      confirmBtnText: '確認',

      showCancelBtn: true,
      cancelBtnText: '取消',
      
      function:()=>handleDeleteCart(),
      icon2:'success',
      title2:'購物車已清除',
      timer2: 1000,

    });
  };




  if (error) return <div>獲取購物車時發生錯誤</div>
  if (!data) return <div>加載中...</div>

  if (error) return <div>獲取購物車時發生錯誤</div>
  if (!data) return <div>載入中...</div>

  const cart = data.data
  const totalQuantity = data.totalQuantity
  console.log(cart);
  
  
  if (data?.error || !cart || cart.length === 0) {
    console.log(data?.error);
    return (
      <div>購物車目前沒有商品</div>
    )
  }

  return (
    <>
      <div className={styles.main}>Cart Page
        <div className={styles.row}>
          <div className={styles.productGroup}>
            {cart?.map((product) => (
              <div key={product.cart_id} className={styles.item}>
                <button className={styles.delItemBtn}><FaX/></button>
                <div className={styles.image}>
                  <Image 
                  src={product.image_url || '/images/default_no_pet.jpg'}
                  alt={product.product_name}
                  width={200}
                  height={200}
                  />
                </div>
                <div className={styles.info}>
                  <div className={styles.infoTop}>
                    <p className={styles.h2}>{product.product_name}</p>
                    <p className={styles.p1}>{product?.variant_name}</p>
                  </div>
                  <div className={styles.infoBottom}>
                    <p className={styles.h2}>${product.price}</p>
                    <div className={styles.count}>
                      <button><FaMinus/></button>
                      <input value={product.quantity}/>
                      <button><FaPlus/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.detail}>
            <div className={styles.detailTitle}>
              <p>訂單明細</p>
            </div>
            <div className={styles.detailContent}>
              <div className={styles.item}>
                <p>商品總數</p>
                <p>{totalQuantity}</p>
              </div>
              <div className={styles.item}>
                <p>商品金額</p>
                <p>{}</p>
              </div>
              <div className={styles.item}>
                <p>折扣</p>
                <p>{}</p>
              </div>
              <div className={styles.item}>
                <p>運費</p>
                <p>{}</p>
              </div>
              <hr />
              <div className={styles.item}>
                <p>合計</p>
                <p>{}</p>
              </div>
            </div>
            <div className={styles.detailBtn}>
              <button>前往結帳</button>
              <button>繼續逛逛</button>
            </div>

          </div>
        </div>
      </div>




      {/* <button onClick=
      {()=>{handleClick()}}>刪除商品</button> */}
    </>
  )
}

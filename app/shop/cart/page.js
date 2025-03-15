'use client'

import React, { useMemo} from 'react'
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



  // 清除購物車
  const handleClick = () => {
    Alert({ 
      title:'確定要清除購物車嗎?',
      // text:'確定要清除購物車嗎?',
      // icon:'success',

      showconfirmBtn: true,
      confirmBtnText: '確認',

      showCancelBtn: true,
      cancelBtnText: '取消',
      
      function:async () => {
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
      },
      icon2:'success',
      title2:'購物車已清除',
      timer2: 1000,

    });
  };

  // 修改商品數量
  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return; // 防止數量小於1

    try {
      const response = await fetch(`/api/shop/cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        // 重新獲取購物車數據
        mutate('/api/shop/cart');
      } else {
        console.error('更新購物車數量失敗');
      }
    } catch (error) {
      console.error('更新購物車數量時發生錯誤:', error);
    }
  };

  // 計算總金額和總折扣
  const { totalAmount, totalDiscount ,totalOriginalPrice} = useMemo(() => {
    if (!data?.data) return { totalAmount: 0, totalDiscount: 0 , totalOriginalPrice: 0};
    return data.data.reduce((acc, item) => {
      const originalPrice = item.price * item.quantity;
      const discountedPrice = item.promotion 
        ? item.price * (100 - item.promotion.discount_percentage) / 100 * item.quantity
        : originalPrice;

      acc.totalOriginalPrice += originalPrice;
      acc.totalAmount += discountedPrice;
      acc.totalDiscount += originalPrice - discountedPrice;
      
      return acc;
    }, { totalAmount: 0, totalDiscount: 0 , totalOriginalPrice: 0});
  }, [data]);


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
                <Link href={`/shop/${product.product_id}`}>
                  <div className={styles.image}>
                    <Image 
                    src={product.image_url || '/images/default_no_pet.jpg'}
                    alt={product.product_name}
                    width={200}
                    height={200}
                    />
                  </div>
                </Link>
                <div className={styles.info}>
                  <div className={styles.infoTop}>
                    <Link href={`/shop/${product.product_id}`}>
                    <p className={styles.h2}>{product.product_name}</p>
                    </Link>
                    <p className={styles.p1}>{product?.variant_name}</p>
                  </div>
                  <div className={styles.infoBottom}>
                  {product?.promotion
                  ?<>
                    <p className={styles.h2}>${product.price * (100-product.promotion.discount_percentage)/100}</p>
                    <p className={styles.h2}><del>${product.price}</del></p>
                  </>
                  :<p className={styles.h2}>${product.price}</p>
                  
                  }
                    <div className={styles.count}>
                      <button  onClick={() => handleQuantityChange(product.cart_id, Number(product.quantity) - 1)}><FaMinus/></button>
                      <input value={product.quantity} onChange={(event)=>{handleQuantityChange(product.cart_id, event.target.value)}}/>
                      <button  onClick={() => handleQuantityChange(product.cart_id, Number(product.quantity) + 1)}><FaPlus/></button>
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
            <hr/>
            <div className={styles.detailContent}>
              <div className={styles.item}>
                <p>商品總數</p>
                <p>{totalQuantity}</p>
              </div>
              <div className={styles.item}>
                <p>商品金額</p>
                <p>{totalOriginalPrice}</p>
              </div>
              <div className={styles.item}>
                <p>折扣</p>
                <p>- {totalDiscount }</p>
              </div>
              {/* <div className={styles.item}>
                <p>運費</p>
                <p>{}</p>
              </div> */}
              <hr />
              <div className={styles.item}>
                <p>合計</p>
                <p>{totalAmount}</p>
              </div>
            </div>
            <div className={styles.detailBtn}>
              <button>前往結帳</button>
              <Link href={'/shop'}>繼續逛逛</Link>
            </div>

          </div>
        </div>
      </div>




      <button onClick=
      {()=>{handleClick()}}>清空購物車</button>
    </>
  )
}

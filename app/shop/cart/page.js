'use client'

import React, { useState, useEffect } from 'react'
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
  if (!data) return <div>加載中...</div>

  const cart = data.data
  console.log(cart);
  
  
  if (data.error) {
    return <div>{data.error}</div>
  }

  return (
    <>
      <div>Cart Page</div>
      <button onClick=
      {()=>{handleClick()}}>刪除商品</button>
    </>
  )
}

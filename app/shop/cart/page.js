'use client'

import React, { useState, useEffect } from 'react'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CartPage() {
  
  const { data, error } = useSWR('/api/shop/cart', fetcher)

  if (error) return <div>獲取購物車時發生錯誤</div>
  if (!data) return <div>加載中...</div>

  const cart = data.data
  console.log(cart);
  

  return (
    <>
      <div>Cart Page</div>
      
    </>
  )
}

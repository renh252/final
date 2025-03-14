'use client'

import React, { useState, useEffect } from 'react'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CartPage() {

  const fetcher = (url, data) => fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
  
  // 在组件中使用
  const { data, error } = useSWR(['/api/shop/cart', { userId: 123 }], fetcher)

  return (
    <>
      <div>Cart Page</div>
    </>
  )
}

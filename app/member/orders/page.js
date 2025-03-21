'use client'
import styles from './orders.module.css'
import Link from 'next/link'

import React, { useState, useEffect } from 'react'
// components
import List from '../_components/list'
import { FaList  } from "react-icons/fa6";

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function OrdersPage() {

    // 使用 SWR 獲取資料 - 使用整合的 API 路由
    const { data, error } = useSWR('/api/shop/orders', fetcher)
    // 处理加载状态
    if (!data) return <div>Loading...</div>
    // 处理错误状态
    if (error) return <div>Failed to load</div>

    // 获取 orders 数据
    const orders = data.orders
    const totalOrders = data.totalOrders
    console.log(data);
    
    console.log(orders);

    // 修改日期格式
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      });
    }


  return (
    <>
    <div className={styles.top}>
      <select name="" id="">
        <option value="">訂單狀態</option>
      </select>
      <select name="" id="">
        <option value="">日期</option>
      </select>
      <p>共{totalOrders}筆資料</p>
    </div>
      <List 
        title=        
        <div className={styles.containTitle}>
          <div><FaList /></div>
          <div>編號</div>
          <div>訂單狀態</div>
          <div>付款狀態</div>
          <div>金額</div>
          <div>備註</div>
          <div>日期</div>
        </div>
        body=        
        <div className={styles.containBody}>
        {orders.map((order)=>{return (
          <div className={styles.order} key={order.order_id }>
            <div><Link href={`/member/orders/${order.order_id}`}><FaList /></Link></div>
            <div>{order.order_id }</div>
            <div>{order.order_status}</div>
            <div>{order.payment_status}</div>
            <div>${order.total_price}</div>
            <div>{order.remark}</div>
            <div>{formatDate(order.created_at)}</div>
          </div>
        )})}
        </div>
      />
    </>
  ) 
}

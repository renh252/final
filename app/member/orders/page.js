'use client'
import styles from './orders.module.css'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
// components
import List from '../_components/list'
import { FaList  } from "react-icons/fa6";
import RecordPage from '../_components/RecordPage'
import StatusBadge from '../_components/StatusBadge'

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
    <RecordPage
      titleText="訂單紀錄"
      fetchUrl="/api/shop/orders"
      recordKey='orders'
      recordKeyField='order_id'
      detailPagePath='/member/orders'
      statusFilter={{
        title: '訂單狀態',
        key: 'order_status',
        options: ['全部','待付款', '待出貨', '已出貨', '已完成'],
      }}
      additionalFilters={[
      {
        title: '付款狀態',
        key: 'payment_status',  // 这应该与记录中的属性名匹配
        options: ['全部', '已付款', '付款失敗'],
      }
    ]}
      formatRecord={(order)=>(
        <div>
            <p>金額 : NT$  {order.total_price}</p>
            <p>日期 : {formatDate(order.created_at)}</p>
            <p>備註 :  {order.remark}</p>
            <p>狀態 : <StatusBadge status={order.payment_status} /> <StatusBadge status={order.order_status} /></p>
          </div>
      )
      }
    />
    </>
  ) 
}

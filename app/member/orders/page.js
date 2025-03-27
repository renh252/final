'use client'
import styles from './orders.module.css'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
// components
import List from '../_components/list'
import { FaList } from 'react-icons/fa6'
import RecordPage from '@/app/member/_components/RecordPage'
import StatusBadge from '../_components/StatusBadge'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return <div>載入中...</div>
  if (!user) return <div>請先登入</div>

  const user_id = user.id

  // 修改日期格式
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleClick = (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/member/orders/${orderId}?scrollTo=products`)
  }

  return (
    <>
      <RecordPage
        titleText="訂單紀錄"
        fetchUrl={`/api/shop/orders?user_id=${user_id}`}
        recordKey="orders"
        recordKeyField="order_id"
        detailPagePath="/member/orders"
        statusFilter={{
          title: '訂單狀態',
          key: 'order_status',
          options: ['全部', '未付款', '待出貨', '已出貨', '已完成'],
        }}
        formatRecord={(order) => (
    <div className={styles.orderContainer}>
      <p className={styles.orderInfo}>金額 : NT$ {order.total_price}</p>
      <p className={styles.orderInfo}>日期 : {formatDate(order.created_at)}</p>
      <p className={styles.orderInfo}>備註 : {order.remark}</p>
      
      <div className={styles.statusContainer}>
        <div className={styles.statusBadges}>
          狀態 : {order.payment_status == '已付款' 
          ? <StatusBadge status={order.order_status} /> 
          : <StatusBadge status={order.payment_status} />}
        </div>
        {order.order_status === '已完成'
          ? 
          <button 
            onClick={(e) => handleClick(e, order.order_id)} 
            className={styles.reviewButton}>
            查看/前往評論
          </button>
          : ''
        }
      </div>
    </div>
        )}
      />
    </>
  )
}
    // <div>
    //         <p>金額 : NT$ {order.total_price}</p>
    //         <p>日期 : {formatDate(order.created_at)}</p>
    //         <p>備註 : {order.remark}</p>
    //         <p>
    //           狀態 : <StatusBadge status={order.payment_status} />{' '}
    //           <StatusBadge status={order.order_status} />
    //         </p>
    //       </div>
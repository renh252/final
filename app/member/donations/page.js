'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import List from '../_components/list'
import styles from './donations.module.css'
import Link from 'next/link'
import FilterBar from '../_components/FilterBar'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DonationPage() {
  const { data, error } = useSWR('/api/donate/donations', fetcher)

  // 篩選條件
  const [statusFilter, setStatusFilter] = useState('全部')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (!data) return <div className={styles.loading}>載入中...</div>
  if (error) return <div className={styles.error}>載入失敗，請稍後再試</div>

  const { donations, totalDonations } = data

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // **篩選捐款紀錄**
  const filteredDonations = donations.filter((donate) => {
    if (statusFilter !== '全部' && donate.transaction_status !== statusFilter) {
      return false
    }
    const donationDate = new Date(donate.create_datetime)
    if (startDate && donationDate < new Date(startDate)) return false
    if (endDate && donationDate > new Date(endDate)) return false
    return true
  })

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>我的捐款紀錄</h2>

      {/* 篩選區（使用 FilterBar 元件） */}
      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* 🔹 統計資訊 */}
      <div className={styles.summary}>
        符合條件 <strong>{filteredDonations.length}</strong> 筆 ／ 總捐款{' '}
        <strong>{totalDonations}</strong> 筆
      </div>

      {/* 🔹 捐款紀錄列表 */}
      <div className={styles.listContainer}>
        {filteredDonations.length > 0 ? (
          filteredDonations.map((donate) => (
            <List
              key={donate.id}
              title={
                <Link
                  href={`/member/donations/${donate.trade_no}`}
                  className={styles.link}
                >
                  捐款編號：{donate.trade_no}
                </Link>
              }
              body={
                <div className={styles.details}>
                  <p>金額：NT$ {donate.amount}</p>
                  <p>日期：{formatDate(donate.create_datetime)}</p>
                  <p>付款方式：{donate.payment_method}</p>
                  <p className={styles.status}>
                    狀態：
                    <span
                      className={
                        donate.transaction_status === '已付款'
                          ? styles.success
                          : styles.pending
                      }
                    >
                      {donate.transaction_status}
                    </span>
                  </p>
                </div>
              }
            />
          ))
        ) : (
          <p className={styles.noData}>⚠️目前沒有符合條件的捐款紀錄</p>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import List from '../_components/list'
import FilterBar from './FilterBar'
import StatusBadge from './StatusBadge'
import styles from './recordPage.module.css'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'

export default function RecordPage({
  titleText = '紀錄',
  fetchUrl,
  recordKey = 'records',
  statusOptions = ['全部', '已付款', '處理中', '失敗'],
  formatRecord, // 自定義每筆資料的顯示
  detailPagePath, // 🔹 這是要導航的頁面路徑
}) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('全部')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { data, error } = useSWR(fetchUrl, (url) =>
    fetch(url).then((res) => res.json())
  )

  if (!data) return <div className={styles.loading}>載入中...</div>
  if (error) return <div className={styles.error}>載入失敗，請稍後再試</div>

  const records = data[recordKey] || []
  const total = data.total || records.length

  const filteredRecords = records.filter((record) => {
    if (statusFilter !== '全部' && record.transaction_status !== statusFilter)
      return false
    const date = new Date(record.create_datetime)
    if (startDate && date < new Date(startDate)) return false
    if (endDate && date > new Date(endDate)) return false
    return true
  })

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.header}>我的{titleText}</h2>{' '}
        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          statusOptions={statusOptions}
        />{' '}
        <div className={styles.summary}>
          <p>
            符合條件：<strong>{filteredRecords.length}</strong> 筆 ／ 總數：
            <strong>{total}</strong> 筆
          </p>
        </div>
      </div>

      <div className={styles.list}>
        <div className={styles.listContainer}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <List
                key={record.id}
                title={`編號：${record.trade_no || record.order_id}`}
                body={formatRecord(record)}
                onClick={() => {
                  if (record.trade_no) {
                    router.push(`/member/donations/${record.trade_no}`)
                  } else {
                    alert('此筆紀錄缺少捐款編號，無法查看詳細資料')
                  }
                }} // 🔹 用傳入的 `detailPagePath`
              />
            ))
          ) : (
            <p className={styles.noData}>目前沒有資料</p>
          )}
        </div>

      </div>
    </div>
  )
}

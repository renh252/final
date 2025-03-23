// FILEPATH: c:/Users/USER/ispan/final/app/member/_components/RecordPage.js

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
  recordKey = 'records', // 資料表名稱
  recordKeyField = 'id', // primary key 欄位名稱
  statusFilter = {
    title: '狀態',
    key: 'payment_status',
    options: ['全部', '已付款', '未付款', '付款失敗'],
  },
  formatRecord,
  additionalFilters = [],
}) {
  const router = useRouter()
  const [filterValues, setFilterValues] = useState({
    [statusFilter.key]: statusFilter.options[0],
    ...additionalFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.options[0];
      return acc;
    }, {})
  });

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { data, error } = useSWR(fetchUrl, (url) =>
    fetch(url).then((res) => res.json())
  )

  const updateFilter = (key, value) => {
    setFilterValues(prev => ({...prev, [key]: value}));
  };

  const filters = [
    {
      ...statusFilter,
      value: filterValues[statusFilter.key],
      onChange: (value) => updateFilter(statusFilter.key, value),
    },
    ...additionalFilters.map(filter => ({
      ...filter,
      value: filterValues[filter.key],
      onChange: (value) => updateFilter(filter.key, value),
    })),
  ]

  if (!data) return <div className={styles.loading}>載入中...</div>
  if (error) return <div className={styles.error}>載入失敗，請稍後再試</div>

  const records = data[recordKey] || []
  const total = data.total || records.length

  const filteredRecords = records.filter((record) => {
    for (let filter of filters) {
      const filterValue = filterValues[filter.key];
      if (filterValue !== '全部' && record[filter.key] !== filterValue) {
        return false;
      }
    }

    let date = ''
    if (record.create_datetime) {
      date = new Date(record.create_datetime) 
    } else if (record.created_at) {
      date = new Date(record.created_at) 
    }
    if (startDate && date < new Date(startDate)) return false
    if (endDate && date > new Date(endDate)) return false
    return true
  })

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.header}>我的{titleText}</h2>
        <FilterBar
          filters={filters}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
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
                key={record[recordKeyField]}
                title={`編號：${record.trade_no || record[recordKeyField]}`}
                body={formatRecord(record)}
                onClick={() => {
                  if (record.trade_no) {
                    router.push(`/member/donations/${record.trade_no}`)
                  } else if (record.order_id) {
                    router.push(`/member/orders/${record.order_id}`)
                  } else {
                    alert('此筆紀錄缺少捐款編號，無法查看詳細資料')
                  }
                }}
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
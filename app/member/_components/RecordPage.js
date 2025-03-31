'use client'

import React, { useState } from 'react'
import List from '../_components/list'
import FilterBar from './FilterBar'
import StatusBadge from './StatusBadge'
import styles from './recordPage.module.css'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { IoMdArrowDropdown, IoMdArrowDropright } from 'react-icons/io'

export default function RecordPage({
  titleText = '紀錄',
  fetchUrl,
  recordKey = 'records', // 資料表名稱
  recordKeyField = 'id', // primary key 欄位名稱
  statusFilter = {
    title: '狀態',
    key: 'transaction_status',
    options: ['全部', '已付款', '未付款', '付款失敗', '訂單取消'],
  },
  formatRecord,
  additionalFilters = [],
}) {
  const router = useRouter()
  const [filterValues, setFilterValues] = useState({
    [statusFilter.key]: statusFilter.options[0],
    ...additionalFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.options[0]
      return acc
    }, {}),
  })

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showRecurring, setShowRecurring] = useState(false)
  const { data, error } = useSWR(fetchUrl ? fetchUrl : null, (url) =>
    fetch(url).then((res) => res.json())
  )
  useEffect(() => {
    console.log('fetchUrl:', fetchUrl)
  }, [fetchUrl])

  const updateFilter = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  const filters = [
    {
      ...statusFilter,
      value: filterValues[statusFilter.key],
      onChange: (value) => updateFilter(statusFilter.key, value),
    },
    ...additionalFilters.map((filter) => ({
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
      const filterValue = filterValues[filter.key]
      if (filterValue !== '全部' && record[filter.key] !== filterValue) {
        return false
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

  // 工具函式：計算下次扣款日（加一個月）
  const getNextDate = (dateString) => {
    const date = new Date(dateString)
    date.setMonth(date.getMonth() + 1)
    return date.toLocaleDateString('zh-TW')
  }

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.header}>我的{titleText}</h2>{' '}
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
        {data.recurringDonations?.length > 0 && (
          <div className={styles.recurringReminder}>
            <button
              className={styles.sectionTitle}
              onClick={() => setShowRecurring(!showRecurring)}
            >
              {showRecurring ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}{' '}
              定期定額提醒（
              {data.recurringDonations.length} 筆）
            </button>
            <p className={styles.sectionSub}>
              您目前有<strong>{data.recurringDonations.length}</strong>
              筆定期定額正在進行中
            </p>
            {showRecurring && (
              <div className={styles.recurringList}>
                {data.recurringDonations.map((donation) => (
                  <div className={styles.recurringCard} key={donation.id}>
                    <div className={styles.cardTitle}>
                      {donation.donation_type}
                    </div>
                    <p>
                      訂單編號：
                      <button
                        className={styles.tradeNo}
                        onClick={() => {
                          router.push(`/member/donations/${donation.trade_no}`)
                        }}
                      >
                        {donation.trade_no}
                      </button>
                    </p>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>上次付款日：</span>
                      <span>
                        {new Date(donation.create_datetime).toLocaleDateString(
                          'zh-TW'
                        )}
                      </span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>下次扣款日：</span>
                      <span>{getNextDate(donation.create_datetime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.list}>
        <div className={styles.listContainer}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <List
                key={record[recordKeyField]}
                title={`編號：${
                  record.retry_trade_no ||
                  record.trade_no ||
                  record[recordKeyField]
                }`}
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

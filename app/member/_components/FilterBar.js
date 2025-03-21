import React from 'react'
import styles from './filterBar.module.css'

export default function FilterBar({
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className={styles.filterContainer}>
      <label>
        狀態：
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="全部">全部</option>
          <option value="已付款">已付款</option>
          <option value="處理中">處理中</option>
          <option value="失敗">失敗</option>
        </select>
      </label>

      <label>
        起始日期：
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label>
        結束日期：
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>
    </div>
  )
}

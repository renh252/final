import React from 'react'
import styles from './filterBar.module.css'

export default function FilterBar({
  filters = [
    {
      title: '狀態',
      options: ['全部', '已付款', '未付款', '付款失敗'],
      value: '',
      onChange: () => {},
    }
  ],
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className={styles.filterContainer}>
      {filters.map((filter, index) => (
        <label key={index}>
          {filter.title}：
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}

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
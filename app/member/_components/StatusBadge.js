import React from 'react'
import styles from './statusBadge.module.css'

export default function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status) {
      case '已付款':
      case '已完成':
        return styles.success
      case '未付款':
      case '待出貨':
        return styles.pending
      case '付款失敗':
      case '取消':
        return styles.failed
      default:
        return styles.default
    }
  }

  return <span className={`${styles.badge} ${getStatusClass()}`}>{status}</span>
}

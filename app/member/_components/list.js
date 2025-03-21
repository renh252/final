'use client'

import React from 'react'
import styles from './list.module.css'

/* 用法範例：
import List from '@/app/member/_components/list'

<List
  title={<div>標題</div>}
  body={<div>內容</div>}
  onClick={() => console.log('點擊項目')}
/>
*/

export default function List({ title, body, onClick }) {
  return (
    <div
      className={styles.container}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
    </div>
  )
}

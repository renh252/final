'use client'

import React, { useState, useEffect } from 'react'
import styles from './list.module.css'

/* 用法
import List from '@/app/member/_components/list'

  <List
    title=
      <div>
        <div>標題</div>
        <div>標題</div>
      </div>
    body=
      <div>
        <div>內容群組</div>
        <div class='內容群組範例'>
          <div>內容</div>
          <div>內容</div>
        </div>
      </div>
    />
*/

export default function List({title, body}) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
          {title}
      </div>
      <div className={styles.body}>
          {body}
      </div>
    </div>
  )
}

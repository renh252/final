'use client'
import styles from './orders.module.css'

import React, { useState, useEffect } from 'react'

export default function OrdersPage(props) {
  return (
    <>
      <div className={styles.top}>
        <select name="" id="">
          <option value="">訂單狀態</option>
        </select>
        <select name="" id="">
          <option value="">日期</option>
        </select>
        <p>共...筆資料</p>
      </div>
      <div className={styles.container}>
        <div className={styles.containTitle}>
          <div>查看</div>
          <div>編號</div>
          <div>狀態</div>
          <div>金額</div>
          <div>備註</div>
          <div>日期</div>
        </div>
        <div className={styles.containBody}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  ) 
}

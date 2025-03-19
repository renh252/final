'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
// styles
import styles from './summary.module.css'
import { BsPatchCheck } from "react-icons/bs";

// components
import {Breadcrumbs} from '@/app/_components/breadcrumbs'



export default function SummaryPage(props) {
  return (
    <> 
      <Breadcrumbs
        title='訂單明細'
        items={[
          { label: '購物車', href: '/shop/cart' },
          { label: '訂單明細', href: '/shop/checkout/summary' },
        ]}
        />
        <div className={styles.main}>
          <div>
            <BsPatchCheck />
            <p>訂單成立</p>
          </div>
          <div>
            <Link href=''>查看訂單</Link>
            <Link href='/shop'>繼續逛逛</Link>
          </div>
          <div className={styles.container}>
            <div className={styles.containTitle}>

            </div>
            <div className={styles.containBody}>

            </div>
            <div className={styles.containFooter}>
              
            </div>
          </div>
        </div>
    </>
  )
}

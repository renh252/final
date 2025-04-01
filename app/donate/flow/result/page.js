'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '../flow.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { BsPatchCheckFill, BsPatchExclamationFill } from 'react-icons/bs'

export default function ResultPage(props) {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('status') === 'success'

  return (
    <>
      <div className={styles.flow_container}>
        <h1>線上捐款</h1>
        <hr />
      </div>
      <div className={styles.order_container}>
        <div className={styles.result}>
          {isSuccess ? (
            <BsPatchCheckFill className={styles.successIcon} />
          ) : (
            <BsPatchExclamationFill
              className={styles.successIcon}
              style={{ color: '#d25445' }}
            />
          )}

          <div>
            {isSuccess ? (
              <h1 className={styles.title}>捐款成功</h1>
            ) : (
              <h1 className={styles.title} style={{ color: '#d25445' }}>
                捐款失敗
              </h1>
            )}
          </div>
        </div>{' '}
        {/* 按鈕區塊 */}
        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/member/donations')}
          >
            查看捐款紀錄
          </button>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/donate')}
          >
            回到捐款頁
          </button>
        </div>
      </div>
    </>
  )
}

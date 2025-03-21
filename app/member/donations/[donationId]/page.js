'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import styles from './donationDetail.module.css'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DonationDetailPage() {
  const { donationId } = useParams()
  const router = useRouter()

  // 取得捐款詳情
  const { data, error } = useSWR(`/api/donate/donations/${donationId}`, fetcher)

  if (error) return <div className={styles.error}> 加載失敗，請稍後再試</div>
  if (!data) return <div className={styles.loading}> 加載中...</div>

  const donation = data.donation

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>捐款詳情</h2>

      <div className={styles.detailBox}>
        <p>
          <strong>捐款編號：</strong>
          {donation.trade_no}
        </p>
        <p>
          <strong>金額：</strong>NT$ {donation.amount}
        </p>
        <p>
          <strong>交易狀態：</strong>
          <span
            className={
              donation.transaction_status === '已付款'
                ? styles.success
                : styles.pending
            }
          >
            {donation.transaction_status}
          </span>
        </p>
        <p>
          <strong>付款方式：</strong>
          {donation.payment_method}
        </p>
        <p>
          <strong>捐款時間：</strong>
          {new Date(donation.create_datetime).toLocaleString()}
        </p>
        <p>
          <strong>是否需要收據：</strong>
          {donation.is_receipt_needed === '是' ? '✔ 需要' : '✖ 不需要'}
        </p>
      </div>

      <button
        className={styles.backButton}
        onClick={() => router.push('/member/donations')}
      >
        返回捐款紀錄
      </button>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../flow.module.css'
import Image from 'next/image'
import Link from 'next/link'

export default function ResultPage(props) {
  const [countdown, setCountdown] = useState(5) // 初始倒數時間 5 秒
  const router = useRouter()

  useEffect(() => {
    if (countdown === 0) {
      router.push('/member/donations') // 倒數結束後跳轉捐款紀錄頁
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000) // 每秒更新一次

    return () => clearTimeout(timer) // 清除計時器
  }, [countdown, router])
  return (
    <>
      <div className={styles.flow_container}>
        <h1>線上捐款</h1>
        <hr />
      </div>
      <div className={styles.order_container}>
        <div className={styles.result}>
          <Image
            src="/images/donate/icon/result.png"
            alt="success"
            width={150}
            height={150}
          />
          <div>
            <h1>捐款成功</h1>
            <p>
              將於<span style={{ color: 'red' }}>{countdown}</span>秒後跳至
              <Link href="/member/donations" style={{ color: 'blue' }}>
                捐款紀錄頁面
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

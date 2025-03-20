
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from "@/app/member/MemberCenter/member.module.css";

export default function MemberLayout({ children }) {
  return (
    <div className="member-layout">

      <div className={styles.logos_grid}>
      <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/member/orders">我的訂單</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/pets">我的寵物</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/forum">我的論壇</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/donate">我的捐款</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/">回首頁</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/">登出</Link>
              </button>
      </div>
      <main style={{ margin: '30px auto'}} >
        {children}
      </main>
    </div>
  )
}


import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from "@/app/member/MemberCenter/member.module.css";

export default function MemberLayout({ children }) {
  return (
    <div className="member-layout">
        <header>
              {/* <Image 
              src="../images\member\Frame 312.jpg" 
              alt='會員頁面'
              style={{ width: '1340px', height: '600px'}}
              height={600}
              width={1340}
               /> */}
        </header>


      <div className={styles.logos_grid}>
      <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/shop">我的購物車</Link>
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
      <main className="member-content">
        {children}
      </main>
    </div>
  )
}

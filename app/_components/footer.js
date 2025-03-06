'use client'

import React, { useState, useEffect } from 'react'
import styles from './footer.module.css'
import Image from 'next/image'

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footer_container}>
          <ul className={styles.ul}>
            <li>聯絡地址：台南市永康區南台街１號</li>
            <li>連絡電話：0912-345-678</li>
            <li>傳真：01-2345-6789</li>
            <li>Email：test@test.com</li>
          </ul>
          <ul className={styles.ul}>
            <li>
              <Image
                src="/images/logo.png"
                alt="圖片描述"
                width={120}
                height={30}
              />
            </li>
            <li>關於我們</li>
            <li>隱私權政策</li>
            <li>常見問題</li>
          </ul>
          <ul className={styles.ul}>
            <li>立即捐款!</li>
            <li>關懷浪浪從你我做起</li>
            <li>付款方式</li>
          </ul>
        </div>
      </footer>
    </>
  )
}

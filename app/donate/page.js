'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './donate.module.css'

export default function DonatePage(props) {
  return (
    <>
      <div className={styles.donate_container}>
        <div>
          <Image
            src="/images/donate/donate.jpg"
            alt="donate.jpg"
            width={300}
            height={600}
            className={styles.image}
          />
        </div>
        <div>
          <ul>
            <li>線上捐款</li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>
    </>
  )
}

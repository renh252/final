'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './donate.module.css'
import Dropdown from './_components/options'

export default function DonatePage(props) {
  return (
    <>
      <div className={styles.donate_container}>
        <div className={styles.donate_item}>
          <Image
            src="/images/donate/donate.jpg"
            alt="donate.jpg"
            width={300}
            height={600}
            className={styles.image}
          />
        </div>
        <div className={styles.donate_item}>
          <ul className={styles.ul}>
            <li>
              <h2>線上捐款</h2>
            </li>
            <li>
              <p>
                捐款支持浪浪，改變牠們的未來 🐾❤️
                您的每一筆捐款，都是給浪浪們一個溫暖的承諾！我們將善款用於醫療照護、食物供應、收容環境改善，讓更多毛孩能夠健康成長，找到幸福的家。
                🌟 您的愛心，可以讓牠們擁有新希望！
              </p>
            </li>
            <li style={{ display: 'flex', 'align-items': 'center' }}>
              <h5 style={{ 'margin-right': '5px' }}>支援付款方式</h5>
              <Image
                src="/images/credit_card/jcb.png"
                alt="jcb.png"
                width={45}
                height={29}
                className={styles.li_image}
              ></Image>
              <Image
                src="/images/credit_card/mastercard.png"
                alt="mastercard.png"
                width={45}
                height={29}
                className={styles.li_image}
              ></Image>
              <Image
                src="/images/credit_card/visa.png"
                alt="visa.png"
                width={45}
                height={29}
                className={styles.li_image}
              ></Image>
            </li>
            <li style={{ display: 'flex', 'align-items': 'center' }}>
              <h5 style={{ 'margin-right': '5px' }}>選擇捐款種類</h5>
              <Dropdown />
            </li>
            <li></li>
          </ul>
        </div>
      </div>
    </>
  )
}

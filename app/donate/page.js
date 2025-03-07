'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './donate.module.css'
import Dropdown from './_components/options'
import Link from 'next/link'

export default function DonatePage(props) {
  const [activeSection, setActiveSection] = useState('method') // 用來儲存顯示的區塊

  const handleButtonClick = (section) => {
    // 當點擊按鈕時，更新 activeSection 來顯示對應的區塊
    setActiveSection(section)
  }
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
            <li style={{ display: 'flex', 'justify-content': 'end' }}>
              <button
                class="button"
                style={{ width: '120px', height: '50px', 'font-size': '28px' }}
              >
                <Link href="/donate/flow">捐款</Link>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <ul className={styles.ul2}>
          <li>
            <button
              class="button"
              type="button"
              onClick={() => handleButtonClick('method')}
            >
              捐款方式
            </button>
          </li>
          <li>
            <button
              class="button"
              type="button"
              onClick={() => handleButtonClick('instructions')}
            >
              種類說明
            </button>
          </li>
        </ul>
      </div>
      <div className={styles.donate_container2}>
        {/* 顯示 "捐款方式" 區塊 */}
        {activeSection === 'method' && (
          <div>
            <ul className={styles.ul2}>
              <li>
                <button class="button" type="button">
                  信用卡
                </button>
              </li>
              <li>
                <button class="button" type="button">
                  銀行ATM
                </button>
              </li>
              <li>
                <button class="button" type="button">
                  郵局
                </button>
              </li>
              <li>
                <button class="button" type="button">
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        )}
        {/* 顯示 "種類說明" 區塊 */}
        {activeSection === 'instructions' && (
          <div>
            <ul className={styles.ul2}>
              <li>
                <button class="button" type="button">
                  救援醫療
                </button>
              </li>
              <li>
                <button class="button" type="button">
                  線上認養
                </button>
              </li>
              <li>
                <button class="button" type="button">
                  支出一覽
                </button>
              </li>
            </ul>
          </div>
        )}
        {activeSection === 'method' && (
          <div>
            <div className={styles.method_item}>
              <div className={styles.icon}>
                <Image
                  src="images/donate/icon/card1.png"
                  alt="visa.png"
                  width={150}
                  height={150}
                ></Image>
              </div>
              <div className={styles.content}>
                <h5>支援信用卡付款</h5>
                <p>
                  支援VISA/MASTER/JCB等發卡組織，方便您快速進行付款。
                  每筆手續費為捐款金額的2.75%，由本會負擔。
                </p>
              </div>
            </div>
            <div className={styles.method_item}>
              <div className={styles.icon}>
                <Image
                  src="images/donate/icon/card1.png"
                  alt="visa.png"
                  width={150}
                  height={150}
                ></Image>
              </div>
              <div className={styles.content}>
                <h5>定期定額交易</h5>
                <p>
                  可設定按照日/月/年自動定期支付固定金額，方便您輕鬆一次結帳。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import styles from './donate.module.css'

import Dropdown from './_components/options'
import MethodItem from './_components/methodItem'

export default function DonatePage() {
  const [activeSection, setActiveSection] = useState('method') // 控制主選單（捐款方式/種類說明）
  const [selectedMethod, setSelectedMethod] = useState('credit_card') // 控制捐款方式內的按鈕
  const [activeButton, setActiveButton] = useState('method') // 初始選擇 'method' 或其他默認值

  const cards = ['jcb', 'mastercard', 'visa']
  const sections = [
    { id: 'credit_card', label: '信用卡' },
    { id: 'bank_atm', label: '銀行ATM' },
    { id: 'post_office', label: '郵局' },
    { id: 'faq', label: 'FAQ' },
  ]

  const methodContent = {
    credit_card: (
      <>
        <MethodItem
          imgSrc="/images/donate/icon/card1.png"
          alt="card1"
          title="支援信用卡付款"
          description={
            <>
              <p>
                支援VISA/MASTER/JCB等發卡組織，方便您快速進行付款。
                每筆手續費為捐款金額的2.75%，由本會負擔。
              </p>
            </>
          }
        />
        <MethodItem
          imgSrc="/images/donate/icon/card2.png"
          alt="card2"
          title="定期定額交易"
          description={
            <>
              <p>
                可設定按照日/月/年自動定期支付固定金額，方便您輕鬆一次結帳。
              </p>
            </>
          }
        />
      </>
    ),
    bank_atm: (
      <>
        <MethodItem
          imgSrc="/images/donate/icon/atm1.png"
          alt="atm1"
          description={
            <>
              <p>戶名：社團法人新北市流浪貓狗再生保護協會</p>
              <p>捐款帳號：中國信託/ 新店分行</p>
              <p>銀行代號：822</p>
              <p>銀行帳號：3145-4046-2742</p>
            </>
          }
        />
        <MethodItem
          imgSrc="/images/donate/icon/atm2.png"
          alt="atm2"
          title="捐款資料"
          description={
            <>
              <p>
                捐款如需要收據請私訊提供以下資料收據抬頭 、捐款金額 、後五碼，
                如要報稅者需再提供ID或統一編號、收據收件地址 、收件人。 感謝您！
              </p>
            </>
          }
        />
      </>
    ),
    post_office: (
      <>
        <MethodItem
          imgSrc="/images/donate/icon/atm1.png"
          alt="atm1"
          description={
            <>
              <p>戶名：新北市流浪貓狗再生保護協會</p>
              <p>銀行代號：822</p>
              <p>帳號：3145-4046-2742</p>
            </>
          }
        />
        <MethodItem
          imgSrc="/images/donate/icon/atm2.png"
          alt="atm2"
          title="捐款資料"
          description={
            <>
              <p>
                捐款如需要收據請私訊提供以下資料收據抬頭 、捐款金額 、後五碼，
                如要報稅者需再提供ID或統一編號、收據收件地址 、收件人。 感謝您！
              </p>
            </>
          }
        />
      </>
    ),
    faq: (
      <MethodItem
        title="常見問題"
        description={
          <>
            <p>
              捐款如需要收據請私訊提供以下資料收據抬頭 、捐款金額 、後五碼，
              如要報稅者需再提供ID或統一編號、收據收件地址 、收件人。 感謝您！
            </p>
          </>
        }
      />
    ),
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
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginRight: '5px' }}>支援付款方式</h5>
              {cards.map((card) => (
                <Image
                  key={card}
                  src={`/images/credit_card/${card}.png`}
                  alt={card}
                  width={45}
                  height={29}
                  className={styles.li_image}
                />
              ))}
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginRight: '5px' }}>選擇捐款種類</h5>
              <Dropdown />
            </li>
            <li style={{ display: 'flex', justifyContent: 'end' }}>
              <button
                className="button"
                style={{ width: '120px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/donate/flow">捐款</Link>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 捐款方式與種類說明按鈕 */}
      <div>
        <ul className={styles.ul2}>
          {['method', 'instructions'].map((section) => (
            <li key={section}>
              <button
                className="button"
                onClick={() => {
                  setActiveSection(section)
                  setActiveButton(section) // 改變選擇的按鈕}}
                }}
                style={{
                  backgroundColor:
                    activeButton === section ? '#cda274' : '#003459', // 點擊後的顏色變化
                }}
              >
                {section === 'method' ? '捐款方式' : '種類說明'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 捐款方式 & 種類說明內容 */}
      {activeSection === 'method' ? (
        <>
          {/* 捐款方式按鈕 */}
          <div className={styles.donate_container2}>
            <ul className={styles.ul2}>
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <button
                    className="button"
                    onClick={() => setSelectedMethod(id)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            {methodContent[selectedMethod]}
          </div>
        </>
      ) : (
        <>
          <div className={styles.donate_container2}>
            <div>
              <h5>捐款種類說明</h5>
              <p>詳細說明各種捐款類型的使用方式與影響。</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}

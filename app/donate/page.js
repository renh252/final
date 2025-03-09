'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import styles from './donate.module.css'

import Dropdown from './_components/options'
import MethodItem from './_components/methodItem'

import Contents from './_data/Contents'

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
  const sections2 = [
    { id: 'rescue', label: '醫療救援' },
    { id: 'pets', label: '線上認養' },
    { id: 'expenditure', label: '平台支出' },
  ]

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
                  width: '160px',
                  fontSize: '24px',
                }}
              >
                {section === 'method' ? '捐款方式' : '種類說明'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 捐款方式內容 */}
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
            {Contents[selectedMethod]?.map((item, index) => (
              <MethodItem
                key={index}
                imgSrc={item.imgSrc}
                alt={item.alt}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 種類說明內容 */}
          <div className={styles.donate_container2}>
            <ul className={styles.ul2}>
              {sections2.map(({ id, label }) => (
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
            <div>
              <div className={styles.instructions_item}>
                <div className={styles.instructions_content}>
                  <h2>救援行動流程</h2>
                  <h5>請您加入捐款支持我們，讓我們能持續這份神聖使命。</h5>
                </div>
                <Image
                  src="/images/donate/RescueFollowups.jpg"
                  alt="donate.jpg"
                  width={1100}
                  height={400}
                />
              </div>
              <div className={styles.instructions_item}>
                <div className={styles.instructions_content}>
                  <h2>救援個案</h2>
                  <h5>
                    目前許多流浪動物因為生病、受傷或營養不良，需要緊急醫療救助。
                  </h5>
                  <h5>
                    您的捐款將用於疫苗接種、疾病治療、手術費用及基本健康檢查，幫助牠們恢復健康，迎接新生活。
                  </h5>
                </div>
                <Image
                  src="/images/donate/RescueFollowups.jpg"
                  alt="donate.jpg"
                  width={1100}
                  height={400}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

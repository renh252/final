'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './donate.module.css'
import Dropdown from './_components/options'
import Link from 'next/link'

export default function DonatePage() {
  const [activeSection, setActiveSection] = useState('method') // 主選單
  const [selectedMethod, setSelectedMethod] = useState('credit_card') // 捐款方式

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
          title="支援信用卡付款"
          description="支援VISA/MASTER/JCB等發卡組織，手續費2.75%由本會負擔。"
        />
        <MethodItem
          imgSrc="/images/donate/icon/card2.png"
          title="定期定額交易"
          description="可設定按照日/月/年自動定期支付固定金額。"
        />
      </>
    ),
    bank_atm: (
      <>
        <MethodItem
          imgSrc="/images/donate/icon/atm1.png"
          description={
            <>
              戶名：新北市流浪貓狗再生保護協會
              <br />
              銀行代號：822
              <br />
              帳號：3145-4046-2742
            </>
          }
        />
        <MethodItem
          imgSrc="/images/donate/icon/atm2.png"
          title="捐款資料"
          description="如需收據請提供抬頭、金額、後五碼、報稅者需提供ID或統一編號。"
        />
      </>
    ),
    post_office: (
      <>
        <MethodItem
          imgSrc="/images/donate/icon/atm1.png"
          description={
            <>
              戶名：新北市流浪貓狗再生保護協會
              <br />
              郵政劃撥：5029-8902
            </>
          }
        />
        <MethodItem
          imgSrc="/images/donate/icon/atm2.png"
          title="捐款資料"
          description="如需收據請提供抬頭、金額、後五碼、報稅者需提供ID或統一編號。"
        />
      </>
    ),
    faq: (
      <MethodItem
        title="常見問題"
        description="如有問題請聯絡客服，我們會盡快回覆！"
      />
    ),
  }

  return (
    <>
      <div className={styles.donate_container}>
        <div className={styles.donate_item}>
          <Image
            src="/images/donate/donate.jpg"
            alt="donate"
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
              <p>捐款支持浪浪，改變牠們的未來 🐾❤️</p>
            </li>
            <li className={styles.payment_options}>
              <h5>支援付款方式</h5>
              {['jcb', 'mastercard', 'visa'].map((card) => (
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
            <li>
              <h5>選擇捐款種類</h5>
              <Dropdown />
            </li>
            <li className={styles.donate_button}>
              <Link href="/donate/flow" className="button">
                捐款
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div>
        <div>
          <ul className={styles.ul2}>
            {['method', 'instructions'].map((section) => (
              <li key={section}>
                <button
                  className="button"
                  onClick={() => setActiveSection(section)}
                >
                  {section === 'method' ? '捐款方式' : '種類說明'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.donate_container2}>
          {activeSection === 'method' ? (
            <>
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
            </>
          ) : (
            <div>
              <h5>捐款種類說明</h5>
              <p>詳細說明各種捐款類型的使用方式與影響。</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function MethodItem({ imgSrc, title, description }) {
  return (
    <div className={styles.method_item}>
      {imgSrc && (
        <div className={styles.icon}>
          <Image src={imgSrc} alt="icon" width={150} height={150} />
        </div>
      )}
      <div className={styles.content}>
        {title && <h5>{title}</h5>}
        <p>{description}</p>
      </div>
    </div>
  )
}

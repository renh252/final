'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import styles from './donate.module.css'

import SelectBasicExample from './_components/options'
import MethodItem from './_components/methodItem'

import Contents from './_data/Contents'
import useSWR from 'swr'

import Card from '@/app/_components/ui/Card'

//swr專用的獲取函式
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function DonatePage() {
  const url = '/api/donate' // 接救援醫療資料
  const url2 = '/api/pets?type=pets' // 接救援醫療資料

  // 向伺服器fetch
  const { data } = useSWR(url, fetcher)
  const { data: petsData } = useSWR(url2, fetcher) // 接線上認養資料

  // 解出所需資料
  const cases = data?.data?.cases
  const pets = petsData?.pets ? [...petsData.pets] : []

  const router = useRouter()
  const [donationType, setDonationType] = useState('')
  const handleDonate = () => {
    if (!donationType) {
      alert('請選擇捐款類型！')
      return
    }

    // 跳轉到 flow 頁面，並帶上選擇的捐款類型
    router.push(`/donate/flow?donationType=${encodeURIComponent(donationType)}`)
  }

  const [activeSection, setActiveSection] = useState('method') // 控制主選單（捐款方式/種類說明）
  const [selectedMethod, setSelectedMethod] = useState('credit_card') // 控制捐款方式內的按鈕
  const [activeButton, setActiveButton] = useState('method') // 初始選擇 'method'
  const [selectedCategory, setSelectedCategory] = useState('rescue') // 初始選擇 'rescue'

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
            priority
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
                  priority
                />
              ))}
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginRight: '5px' }}>選擇捐款種類</h5>
              <SelectBasicExample
                value={donationType}
                onChange={setDonationType}
              />
            </li>
            <li style={{ display: 'flex', justifyContent: 'end' }}>
              <button
                className="button"
                style={{ width: '120px', height: '50px', fontSize: '28px' }}
                onClick={handleDonate}
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
                  // 改變選擇的按鈕
                  setActiveSection(section)
                  setActiveButton(section)
                }}
                style={{
                  backgroundColor:
                    activeButton === section ? '#cda274' : '#003459',
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
                    style={{
                      backgroundColor: selectedMethod === id ? '#cda274' : '',
                    }}
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
                    onClick={() => setSelectedCategory(id)}
                    style={{
                      backgroundColor: selectedCategory === id ? '#cda274' : '',
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {selectedCategory === 'rescue' && (
              <>
                <div className={styles.instructions_item}>
                  <div className={styles.instructions_content}>
                    <h2>救援行動流程</h2>
                    <h5>請您加入捐款支持我們，讓我們能持續這份神聖使命。</h5>
                  </div>
                  <div>
                    <Image
                      src="/images/donate/RescueFollowups.jpg"
                      alt="Rescue Process"
                      layout="responsive"
                      width={1100}
                      height={400}
                      className={styles.img_size}
                      priority
                    />
                  </div>
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
                  <ul
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      padding: '0',
                    }}
                  >
                    {cases?.map((post) => (
                      <li key={post.id} className={styles.cases}>
                        {/* 顯示第一張圖片 */}
                        {post.images?.[0] ? (
                          <Image
                            src={post.images[0]}
                            alt="Case Image"
                            width={300}
                            height={300}
                            objectFit="cover"
                            className={styles.cases_img}
                            priority
                          />
                        ) : (
                          // 若沒有圖片時顯示的訊息
                          <p>No images available</p>
                        )}
                        <h5>{post.title}</h5>
                        <button type="button" className="button">
                          查看詳情
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button"
                    style={{ width: '180px', height: '50px', fontSize: '28px' }}
                  >
                    <Link href="/donate">立即捐款</Link>
                  </button>
                </div>
              </>
            )}
            {selectedCategory === 'pets' && (
              <>
                <div className={styles.instructions_item}>
                  <div className={styles.instructions_content}>
                    <h2>毛孩們</h2>
                    <h5>領養代替購買，給浪浪一個家</h5>
                  </div>
                </div>
                <div className={styles.instructions_content}>
                  <div className={styles.petContainer}>
                    <ul className={styles.petList}>
                      {pets.map((pet) => (
                        <li key={pet.id} className={styles.petItem}>
                          <Link
                            href={`/pets/${pet.id}`}
                            className={styles.cardLink}
                          >
                            <Card
                              image={
                                pet.image_url ||
                                pet.main_photo ||
                                '/images/default_no_pet.jpg'
                              }
                              title={pet.name}
                            >
                              <p>品種：{pet.variety}</p>
                              <p>
                                <span>年齡：{pet.age}</span>
                                <span className={styles.separator}>・</span>
                                <span>{pet.gender}</span>
                              </p>
                              <p>地點：{pet.location}</p>
                            </Card>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.donate_container3}>
                    <ul className={styles.ul2}>
                      <li>
                        <button
                          className="button"
                          style={{
                            width: '180px',
                            height: '50px',
                            fontSize: '28px',
                          }}
                        >
                          <Link href="/pets">寵物列表</Link>
                        </button>
                      </li>
                      <li>
                        <button
                          className="button"
                          style={{
                            width: '180px',
                            height: '50px',
                            fontSize: '28px',
                          }}
                        >
                          <Link href="/donate">立即捐款</Link>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {selectedCategory === 'expenditure' && (
              <div className={styles.instructions_item}>
                <div className={styles.instructions_content}>
                  <h2>協會的開支與收入來源</h2>
                  <h5>
                    透明運用每一分資源，讓愛心發揮最大價值！
                    本協會的收入來自捐款支持、義賣活動與合作計畫，
                  </h5>
                  <h5>
                    並將善款用於醫療救援、食物供應、收容改善與認養推廣，確保每一筆資金都真正幫助到需要的浪浪。
                  </h5>
                </div>
                <div>
                  <Image
                    src="/images/donate/Details.jpg"
                    alt="Rescue Process"
                    layout="responsive"
                    width={1100}
                    height={400}
                    className={styles.img_size}
                    priority
                  />
                </div>
                <div style={{ marginTop: '32px' }}>
                  <button
                    className="button"
                    style={{ width: '180px', height: '50px', fontSize: '28px' }}
                  >
                    <Link href="/donate">立即捐款</Link>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

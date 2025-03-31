'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'

import styles from './donate.module.css'
import SelectBasicExample from './_components/options'
import RescueModal from './_components/modal'
import MethodItem from './_components/methodItem'
import PetFilterBar from './_components/petFilterBar'

import Contents from './_data/Contents'

import Card from '@/app/_components/ui/Card'
import Alert from '../_components/alert'

//swr專用的獲取函式
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function DonatePage() {
  const url = '/api/donate' // 接救援醫療資料
  const url2 = '/api/pets?type=pets&pageSize=100' // 接寵物認養資料，取100筆

  // 向伺服器fetch
  const { data } = useSWR(url, fetcher)
  const { data: petsData } = useSWR(url2, fetcher) // 接線上認養資料

  // 解出所需資料
  const cases = data?.data?.cases
  const pets = petsData?.pets ? [...petsData.pets] : []

  const router = useRouter()
  const [donationType, setDonationType] = useState('')
  const [selectedPet, setSelectedPet] = useState('')
  const [selectedPetId, setSelectedPetId] = useState('')

  const [searchTerm, setSearchTerm] = useState('') // 搜尋字串
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // 選單狀態
  const [highlightIndex, setHighlightIndex] = useState(-1) // 鍵盤選擇索引

  // 線上認養區設置懶加載
  const [visibleCount, setVisibleCount] = useState(6) // 每次顯示的寵物數量

  // 寵物篩選欄
  const [searchTerm2, setSearchTerm2] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  // 過濾符合搜尋條件的寵物
  const filteredPets = pets
    .filter((pet) =>
      pet.name?.toLowerCase().includes(searchTerm2.toLowerCase())
    )
    .filter((pet) => {
      if (selectedSpecies && pet.species !== selectedSpecies) return false
      if (selectedGender && pet.gender !== selectedGender) return false
      return true
    })

  // 救援醫療
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)

  // 開關Modal
  const openModal = (rescueCase) => {
    setSelectedCase(rescueCase)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleDonate = (e) => {
    e.preventDefault()

    if (!donationType) {
      Alert({
        title: '請選擇捐款類型！',
        icon: 'warning',
        timer: 1000,
      })
      return
    }
    if (donationType === '線上認養' && !selectedPet) {
      Alert({
        title: '請選擇認養的寵物！',
        icon: 'warning',
        timer: 1000,
      })
      return
    }

    let query = `donationType=${encodeURIComponent(donationType)}`

    // 如果選擇的是「線上認養」，則將 selectedPet 也加入網址參數
    if (donationType === '線上認養' && selectedPet && selectedPetId) {
      query += `&pet=${encodeURIComponent(selectedPet)}&petId=${selectedPetId}`
    }

    router.push(`/donate/flow?${query}`)
  }

  // 選擇寵物
  const handleSelectPet = (pet) => {
    setSelectedPet(pet.name)
    setSelectedPetId(pet.id)
    setSearchTerm('')
    setIsDropdownOpen(false) // 確保關閉選單
  }

  // 監聽鍵盤操作
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) return

    if (e.key === 'ArrowDown') {
      setHighlightIndex((prev) => Math.min(prev + 1, filteredPets.length - 1))
    } else if (e.key === 'ArrowUp') {
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      handleSelectPet(filteredPets[highlightIndex])
    }
  }

  const [activeSection, setActiveSection] = useState('method') // 控制主選單（捐款方式/種類說明）
  const [selectedMethod, setSelectedMethod] = useState('credit_card') // 控制捐款方式內的按鈕
  const [activeButton, setActiveButton] = useState('method') // 初始選擇 'method'
  const [selectedCategory, setSelectedCategory] = useState('rescue') // 初始選擇 'rescue'

  const cards = ['jcb', 'mastercard', 'visa']
  const sections = [
    { id: 'credit_card', label: '信用卡' },
    { id: 'bank_atm', label: 'ATM轉帳' },
    { id: 'post_office', label: '超商繳款' },
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
              <div>
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
                / ATM轉帳 / 超商繳款
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginRight: '5px' }}>選擇捐款種類</h5>
              <SelectBasicExample
                value={donationType}
                onChange={setDonationType}
              />
            </li>{' '}
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginRight: '5px' }}>選擇認養寵物</h5>
              <div className={styles.searchableDropdown}>
                {/* 點擊顯示輸入框 */}
                <input
                  type="text"
                  className={styles.input}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown} // 確保 `keydown` 事件作用於輸入框
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={selectedPet || '請選擇'}
                  disabled={donationType !== '線上認養'}
                  style={{
                    backgroundColor: donationType !== '線上認養' ? '#ccc' : '', // 灰色背景
                    cursor: donationType !== '線上認養' ? 'not-allowed' : '', // 禁用時滑鼠樣式
                  }}
                />

                {/* 選單內容 */}
                {isDropdownOpen && (
                  <ul className={styles.list}>
                    {filteredPets.length > 0 ? (
                      filteredPets.map((pet, index) => (
                        <li key={pet.id} className={styles.listItem}>
                          <button
                            type="button"
                            onClick={() => handleSelectPet(pet)}
                            className={styles.selectPetButton}
                          >
                            {pet.name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className={styles.noResults}>找不到匹配的寵物</li>
                    )}
                  </ul>
                )}
              </div>
            </li>
            {donationType === '線上認養' && ''}
            <li style={{ display: 'flex', justifyContent: 'end' }}>
              <button
                className="button"
                style={{ width: '120px', height: '50px', fontSize: '28px' }}
                onClick={handleDonate}
              >
                捐款
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
                className={`button`}
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
                    className={`button ${styles.ul2_btn}`}
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
                        <div className={styles.caseImg_container}>
                          {post.images?.[0] ? (
                            <Image
                              src={post.images[0]}
                              alt="Case Image"
                              layout="fill"
                              objectFit="cover"
                              className={styles.cases_img}
                              priority
                            />
                          ) : (
                            // 若沒有圖片時顯示的訊息
                            <p>No images available</p>
                          )}
                        </div>
                        <h5>{post.title}</h5>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            openModal(post)
                          }}
                        >
                          查看詳情
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button"
                    style={{ width: '180px', height: '50px', fontSize: '28px' }}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    立即捐款
                  </button>
                  {/* Modal - 當 selectedCase 存在時顯示 */}
                  {selectedCase && (
                    <RescueModal
                      isOpen={isModalOpen}
                      closeModal={closeModal}
                      title={selectedCase.title}
                      content={selectedCase.content}
                      images={selectedCase.images}
                    />
                  )}
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
                <PetFilterBar
                  searchTerm={searchTerm2}
                  setSearchTerm={setSearchTerm2}
                  selectedSpecies={selectedSpecies}
                  setSelectedSpecies={setSelectedSpecies}
                  selectedGender={selectedGender}
                  setSelectedGender={setSelectedGender}
                  pets={pets}
                />
                <div className={styles.instructions_content}>
                  <div className={styles.petContainer}>
                    <ul className={styles.petList}>
                      {filteredPets.slice(0, visibleCount).map((pet) => (
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
                    {visibleCount < pets.length && (
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <button
                          className={styles.loadMoreButton}
                          onClick={() => setVisibleCount((prev) => prev + 6)}
                        >
                          顯示更多
                        </button>
                      </div>
                    )}
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
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          立即捐款
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
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    立即捐款
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

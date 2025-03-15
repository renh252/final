'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './pet-detail.module.css'
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaChevronLeft,
  FaChevronRight,
  FaMars,
  FaVenus,
  FaNeuter,
  FaDog,
  FaCat,
  FaInfoCircle,
  FaUtensils,
  FaRunning,
  FaHeart,
  FaMedkit,
  FaPaw,
  FaWeight,
  FaPalette,
  FaTags,
  FaCalendarAlt,
  FaClipboardList,
  FaStar,
} from 'react-icons/fa'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { Button, Badge, ProgressBar } from 'react-bootstrap'

export default function PetDetailPage() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    async function fetchPet() {
      try {
        const response = await fetch(`/api/pets/${id}`)
        if (!response.ok) {
          throw new Error('無法獲取寵物資料')
        }
        const data = await response.json()
        setPet(data.pet)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [id])

  // 處理照片輪播
  const nextPhoto = () => {
    if (pet?.photos && pet.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === pet.photos.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevPhoto = () => {
    if (pet?.photos && pet.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === 0 ? pet.photos.length - 1 : prevIndex - 1
      )
    }
  }

  const getCurrentPhotoUrl = () => {
    if (!pet?.photos || pet.photos.length === 0) {
      return pet?.main_image || '/images/pet-placeholder.jpg'
    }
    return pet.photos[currentPhotoIndex]?.photo_url || pet.main_image
  }

  // 取得性別圖標
  const getGenderIcon = () => {
    switch (pet?.gender) {
      case 'M':
        return <FaMars size={20} color="#2e86de" />
      case 'F':
        return <FaVenus size={20} color="#e84393" />
      default:
        return <FaNeuter size={20} color="#8e44ad" />
    }
  }

  // 取得寵物類型圖標
  const getTypeIcon = () => {
    switch (pet?.type?.toLowerCase()) {
      case 'dog':
        return <FaDog size={20} color="#e67e22" />
      case 'cat':
        return <FaCat size={20} color="#8e44ad" />
      default:
        return <FaPaw size={20} color="#3498db" />
    }
  }

  // 根據寵物類型獲取標籤顏色
  const getTypeColor = () => {
    switch (pet?.type?.toLowerCase()) {
      case 'dog':
        return '#e67e22'
      case 'cat':
        return '#8e44ad'
      default:
        return '#3498db'
    }
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知日期'
    const date = new Date(dateString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>載入寵物資訊中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaInfoCircle size={40} color="#e74c3c" />
        <h2>載入錯誤</h2>
        <p>{error}</p>
        <Link href="/pets" className={styles.backButton}>
          <FaArrowLeft /> 返回寵物列表
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: '首頁', href: '/' },
          { label: '尋找寵物', href: '/pets' },
          { label: pet?.name || '寵物詳情', href: `/pets/${id}` },
        ]}
      />

      <Link href="/pets" className={styles.backButton}>
        <FaArrowLeft /> 返回寵物列表
      </Link>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <Image
              src={getCurrentPhotoUrl()}
              alt={pet?.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {pet?.photos && pet.photos.length > 1 && (
              <>
                <button
                  className={`${styles.photoNavButton} ${styles.prevButton}`}
                  onClick={prevPhoto}
                  aria-label="上一張照片"
                >
                  <FaChevronLeft />
                </button>
                <button
                  className={`${styles.photoNavButton} ${styles.nextButton}`}
                  onClick={nextPhoto}
                  aria-label="下一張照片"
                >
                  <FaChevronRight />
                </button>
                <div className={styles.photoIndicator}>
                  {pet.photos.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.dot} ${
                        index === currentPhotoIndex ? styles.activeDot : ''
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.petTraits}>
            <div className={styles.traitsContainer}>
              {pet?.vaccinated && (
                <div className={styles.traitBadge} title="已施打疫苗">
                  <FaMedkit size={16} />
                  <span>已接種疫苗</span>
                </div>
              )}
              {pet?.neutered && (
                <div className={styles.traitBadge} title="已結紮">
                  <FaNeuter size={16} />
                  <span>已絕育</span>
                </div>
              )}
              {pet?.fur_length && (
                <div
                  className={styles.traitBadge}
                  title={`毛長: ${pet.fur_length}`}
                >
                  <FaPaw size={16} />
                  <span>
                    {pet.fur_length === 'short'
                      ? '短毛'
                      : pet.fur_length === 'medium'
                      ? '中毛'
                      : '長毛'}
                  </span>
                </div>
              )}
              {pet?.size && (
                <div className={styles.traitBadge} title={`體型: ${pet.size}`}>
                  <FaWeight size={16} />
                  <span>
                    {pet.size === 'small'
                      ? '小型'
                      : pet.size === 'medium'
                      ? '中型'
                      : '大型'}
                  </span>
                </div>
              )}
              {pet?.color && (
                <div className={styles.traitBadge} title={`顏色: ${pet.color}`}>
                  <FaPalette size={16} />
                  <span>{pet.color}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <div className={styles.nameContainer}>
              <h1 className={styles.name}>{pet?.name}</h1>
              <div className={styles.genderAge}>
                {getGenderIcon()}
                <span className={styles.age}>
                  {pet?.age_year || 0} 歲 {pet?.age_month || 0} 個月
                </span>
              </div>
            </div>

            <div
              className={styles.typeBadge}
              style={{ backgroundColor: getTypeColor() }}
            >
              {getTypeIcon()}
              <span>
                {pet?.type === 'dog'
                  ? '狗'
                  : pet?.type === 'cat'
                  ? '貓'
                  : '其他'}
              </span>
            </div>
          </div>

          <div className={styles.breedLocation}>
            <p className={styles.breed}>
              {getTypeIcon()} 品種：{pet?.breed || pet?.variety || '未知'}
            </p>
            {pet?.store_name && (
              <p className={styles.location}>
                <FaMapMarkerAlt /> 收容所：{pet.store_name}
              </p>
            )}
          </div>

          <div className={styles.adoptStatus}>
            <div className={styles.statusBadge}>
              <span
                className={`${styles.statusDot} ${
                  styles[pet?.adopt_status || 'available']
                }`}
              ></span>
              {pet?.adopt_status === 'available'
                ? '可領養'
                : pet?.adopt_status === 'pending'
                ? '領養申請中'
                : '已領養'}
            </div>
            {pet?.adopt_fee ? (
              <div className={styles.adoptFee}>
                領養費用: <span className={styles.fee}>NT${pet.adopt_fee}</span>
              </div>
            ) : (
              <div className={styles.adoptFee}>免費領養</div>
            )}
          </div>

          <div className={styles.tabContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'description' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('description')}
              >
                基本資訊
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'medical' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('medical')}
              >
                健康資訊
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'habits' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('habits')}
              >
                習性與飲食
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'traits' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('traits')}
              >
                寵物特質
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === 'activities' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('activities')}
              >
                活動記錄
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.description}>
                  <h2>關於 {pet?.name}</h2>
                  <p>{pet?.description || '目前沒有更多資訊'}</p>
                </div>
              )}

              {activeTab === 'medical' && (
                <div className={styles.medicalInfo}>
                  <h2>健康資訊</h2>
                  <div className={styles.medicalDetail}>
                    <FaMedkit />
                    <div>
                      <h3>醫療記錄</h3>
                      <p>{pet?.medical_history || '目前沒有醫療記錄'}</p>
                    </div>
                  </div>

                  <div className={styles.vaccinationStatus}>
                    <h3>基本健康狀況</h3>
                    <div className={styles.statusItem}>
                      <span>疫苗接種</span>
                      <div className={styles.statusIndicator}>
                        {pet?.vaccinated ? '已完成' : '未完成'}
                      </div>
                    </div>
                    <div className={styles.statusItem}>
                      <span>絕育狀態</span>
                      <div className={styles.statusIndicator}>
                        {pet?.neutered ? '已絕育' : '未絕育'}
                      </div>
                    </div>
                    {pet?.chip_id && (
                      <div className={styles.statusItem}>
                        <span>晶片編號</span>
                        <div className={styles.statusIndicator}>
                          {pet.chip_id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'habits' && (
                <div className={styles.habitsInfo}>
                  <h2>習性與飲食</h2>
                  <div className={styles.habitDetail}>
                    <FaUtensils />
                    <div>
                      <h3>飲食習慣</h3>
                      <p>{pet?.diet_habits || '目前沒有飲食習慣記錄'}</p>
                    </div>
                  </div>

                  <div className={styles.habitDetail}>
                    <FaRunning />
                    <div>
                      <h3>活動需求</h3>
                      <p>{pet?.activity_needs || '目前沒有活動需求記錄'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'traits' && (
                <div className={styles.traitsInfo}>
                  <h2>
                    <FaTags /> {pet?.name} 的特質
                  </h2>

                  {!pet?.traits || pet.traits.length === 0 ? (
                    <p className={styles.noDataMessage}>目前沒有特質記錄</p>
                  ) : (
                    <div className={styles.traitsList}>
                      {pet.traits.map((trait) => (
                        <div key={trait.trait_id} className={styles.traitItem}>
                          <FaStar className={styles.traitIcon} />
                          <div className={styles.traitContent}>
                            <h3>{trait.trait_tag}</h3>
                            <p>{trait.trait_description || '無特質描述'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div className={styles.activitiesInfo}>
                  <h2>
                    <FaClipboardList /> 最近活動記錄
                  </h2>

                  {!pet?.recent_activities ||
                  pet.recent_activities.length === 0 ? (
                    <p className={styles.noDataMessage}>目前沒有最近活動記錄</p>
                  ) : (
                    <div className={styles.activitiesList}>
                      {pet.recent_activities.map((activity) => (
                        <div key={activity.id} className={styles.activityItem}>
                          <div className={styles.activityDate}>
                            <FaCalendarAlt />
                            <span>{formatDate(activity.date)}</span>
                          </div>
                          <div className={styles.activityContent}>
                            <p>{activity.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link href={`/pets/${id}/appointment`} className={styles.adoptButton}>
            <FaHeart /> 申請領養
          </Link>
        </div>
      </div>
    </div>
  )
}

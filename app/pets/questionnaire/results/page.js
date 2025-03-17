'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './results.module.css'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import {
  FaPaw,
  FaHome,
  FaRunning,
  FaUserAlt,
  FaClock,
  FaWeight,
  FaBirthdayCake,
  FaArrowRight,
  FaExclamationTriangle,
  FaHeart,
  FaVenusMars,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPercentage,
  FaStar,
  FaCheck,
  FaTimes,
} from 'react-icons/fa'

// 將代碼映射為可讀文字的函數
const mapCodeToText = (code, category) => {
  const mappings = {
    livingEnvironment: {
      apartment: '公寓/大廈',
      house: '獨立住宅',
      rural: '鄉村/農場',
    },
    activityLevel: {
      low: '低（喜歡待在家裡）',
      medium: '中等（偶爾外出活動）',
      high: '高（經常運動和外出）',
    },
    experienceLevel: {
      none: '無經驗（第一次養寵物）',
      some: '有一些經驗（養過寵物）',
      experienced: '經驗豐富（養過多種寵物）',
    },
    timeAvailable: {
      little: '少於2小時',
      moderate: '2-4小時',
      plenty: '4小時以上',
    },
    preferredSize: {
      small: '小型（10公斤以下）',
      medium: '中型（10-25公斤）',
      large: '大型（25公斤以上）',
      any: '不限',
    },
    preferredAge: {
      young: '幼年（2歲以下）',
      adult: '成年（2-8歲）',
      senior: '年長（8歲以上）',
      any: '不限',
    },
  }

  return mappings[category]?.[code] || code
}

// 獲取問題標題
const getQuestionTitle = (category) => {
  const titles = {
    livingEnvironment: '居住環境',
    activityLevel: '活動程度',
    experienceLevel: '飼養經驗',
    timeAvailable: '可投入時間',
    preferredSize: '偏好體型',
    preferredAge: '偏好年齡',
    allergies: '過敏情況',
    hasChildren: '家中有兒童',
    hasOtherPets: '家中有其他寵物',
  }
  return titles[category] || category
}

// 獲取問題圖標
const getQuestionIcon = (category) => {
  switch (category) {
    case 'livingEnvironment':
      return <FaHome />
    case 'activityLevel':
      return <FaRunning />
    case 'experienceLevel':
      return <FaUserAlt />
    case 'timeAvailable':
      return <FaClock />
    case 'preferredSize':
      return <FaWeight />
    case 'preferredAge':
      return <FaBirthdayCake />
    default:
      return <FaPaw />
  }
}

export default function QuestionnaireResultPage() {
  const searchParams = useSearchParams()
  const questionnaireId = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionnaireData, setQuestionnaireData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [petTraits, setPetTraits] = useState({})

  // 獲取問卷數據和推薦結果
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 獲取問卷數據
        const questionnaireResponse = await fetch(
          questionnaireId
            ? `/api/pets/questionnaire/${questionnaireId}`
            : '/api/pets/questionnaire/latest'
        )

        if (!questionnaireResponse.ok) {
          throw new Error('無法獲取問卷數據')
        }

        const questionnaireData = await questionnaireResponse.json()
        setQuestionnaireData(questionnaireData)

        // 獲取推薦結果
        const recommendationsResponse = await fetch(
          questionnaireId
            ? `/api/pets/questionnaire/recommendations?id=${questionnaireId}`
            : '/api/pets/questionnaire/recommendations'
        )

        if (!recommendationsResponse.ok) {
          throw new Error('無法獲取推薦結果')
        }

        const recommendationsData = await recommendationsResponse.json()
        setRecommendations(recommendationsData.recommendations || [])

        // 獲取寵物特徵數據
        const traitsResponse = await fetch('/api/pets/traits')
        if (traitsResponse.ok) {
          const traitsData = await traitsResponse.json()
          const traitsMap = {}
          traitsData.forEach((trait) => {
            traitsMap[trait.id] = trait
          })
          setPetTraits(traitsMap)
        }
      } catch (err) {
        console.error('獲取數據失敗:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [questionnaireId])

  // 獲取推薦寵物相匹配的特徵
  const getMatchingTraits = (petTraitIds, preferredTraits) => {
    if (!petTraitIds || !preferredTraits) return []
    return petTraitIds.filter((id) => preferredTraits.includes(id))
  }

  // 渲染載入中狀態
  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs
          title="問卷結果"
          items={[
            {
              label: '寵物領養',
              href: '/pets',
            },
            {
              label: '寵物問卷推薦',
              href: '/pets/questionnaire',
            },
            {
              label: '問卷結果',
              href: '/pets/questionnaire/results',
            },
          ]}
        />

        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>正在為您尋找最適合的寵物夥伴...</p>
        </div>
      </div>
    )
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs
          title="問卷結果"
          items={[
            {
              label: '寵物領養',
              href: '/pets',
            },
            {
              label: '寵物問卷推薦',
              href: '/pets/questionnaire',
            },
            {
              label: '問卷結果',
              href: '/pets/questionnaire/results',
            },
          ]}
        />

        <div className={styles.errorContainer}>
          <FaExclamationTriangle size={50} color="#e53e3e" />
          <h2 className={styles.errorTitle}>獲取推薦結果時出錯</h2>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/pets/questionnaire" className={styles.retryButton}>
            重新進行問卷
          </Link>
        </div>
      </div>
    )
  }

  // 沒有問卷數據或推薦結果
  if (!questionnaireData || recommendations.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs
          title="問卷結果"
          items={[
            {
              label: '寵物領養',
              href: '/pets',
            },
            {
              label: '寵物問卷推薦',
              href: '/pets/questionnaire',
            },
            {
              label: '問卷結果',
              href: '/pets/questionnaire/results',
            },
          ]}
        />

        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>沒有找到合適的推薦結果</h2>
          <p className={styles.errorMessage}>
            很抱歉，基於您的問卷內容，我們暫時沒有找到合適的寵物推薦。
            您可以嘗試調整問卷選項，或瀏覽我們的所有可領養寵物。
          </p>
          <div className={styles.actionButtons}>
            <Link href="/pets/questionnaire" className={styles.retryButton}>
              重新進行問卷
            </Link>
            <Link
              href="/pets"
              className={`${styles.retryButton} ${styles.browseButton}`}
            >
              瀏覽所有寵物
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 解析問卷數據
  const preferredTraits = JSON.parse(questionnaireData.preferred_traits || '[]')

  return (
    <div className={styles.container}>
      <Breadcrumbs
        title="問卷結果"
        items={[
          {
            label: '寵物領養',
            href: '/pets',
          },
          {
            label: '寵物問卷推薦',
            href: '/pets/questionnaire',
          },
          {
            label: '問卷結果',
            href: '/pets/questionnaire/results',
          },
        ]}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>您的寵物推薦結果</h1>
        <p className={styles.subtitle}>
          根據您的問卷回答，我們為您找到了以下最適合的寵物夥伴
        </p>
      </div>

      {/* 用戶問卷回答 */}
      <div className={styles.resultSection}>
        <h2 className={styles.sectionTitle}>
          <FaUserAlt /> 您的問卷回答
        </h2>
        <div className={styles.userAnswersContainer}>
          {Object.entries(questionnaireData)
            .filter(
              ([key]) =>
                !['id', 'user_id', 'created_at', 'preferred_traits'].includes(
                  key
                )
            )
            .map(([key, value]) => {
              // 處理布爾值
              if (typeof value === 'number' && (value === 0 || value === 1)) {
                return (
                  <div key={key} className={styles.answerCard}>
                    <div className={styles.questionTitle}>
                      {getQuestionIcon(key)} {getQuestionTitle(key)}
                    </div>
                    <div className={styles.answerText}>
                      {value === 1 ? (
                        <span className={styles.booleanYes}>
                          <FaCheck /> 是
                        </span>
                      ) : (
                        <span className={styles.booleanNo}>
                          <FaTimes /> 否
                        </span>
                      )}
                    </div>
                  </div>
                )
              }

              // 處理其他值
              return (
                <div key={key} className={styles.answerCard}>
                  <div className={styles.questionTitle}>
                    {getQuestionIcon(key)} {getQuestionTitle(key)}
                  </div>
                  <div className={styles.answerText}>
                    {mapCodeToText(value, key)}
                  </div>
                </div>
              )
            })}
        </div>

        {/* 特徵偏好 */}
        <div className={styles.traitsPreference}>
          <h3 className={styles.traitsTitle}>
            <FaPaw /> 您偏好的寵物特徵
          </h3>
          <div className={styles.traitsList}>
            {preferredTraits.map((traitId) => (
              <div key={traitId} className={styles.traitItem}>
                {petTraits[traitId]?.trait_tag || `特徵 ${traitId}`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 推薦寵物 */}
      <div className={styles.resultSection}>
        <h2 className={styles.sectionTitle}>
          <FaHeart /> 為您推薦的寵物
        </h2>
        <div className={styles.petMatchesContainer}>
          {recommendations.map((pet) => {
            const matchingTraits = getMatchingTraits(
              pet.traits || [],
              preferredTraits
            )
            const matchScore = Math.round(pet.match_score * 100)

            return (
              <div key={pet.id} className={styles.petCard}>
                <div className={styles.petImageContainer}>
                  {pet.main_photo ? (
                    <Image
                      src={pet.main_photo}
                      alt={pet.name}
                      className={styles.petImage}
                      width={300}
                      height={220}
                      objectFit="cover"
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <FaPaw size={40} />
                      <span>無圖片</span>
                    </div>
                  )}
                  <div className={styles.matchBadge}>
                    <FaPercentage /> 匹配度 {matchScore}%
                  </div>
                </div>
                <div className={styles.petContent}>
                  <h3 className={styles.petName}>
                    <FaStar
                      className={
                        matchScore >= 90 ? styles.starIcon : styles.hiddenIcon
                      }
                    />
                    {pet.name}
                  </h3>
                  <div className={styles.petDetails}>
                    <div className={styles.petDetail}>
                      <FaVenusMars />
                      {pet.gender === 'M' ? '公' : '母'}
                    </div>
                    <div className={styles.petDetail}>
                      <FaPaw />
                      {pet.species === 'cat' ? '貓' : '狗'}
                    </div>
                    <div className={styles.petDetail}>
                      <FaWeight />
                      {pet.weight} 公斤
                    </div>
                    <div className={styles.petDetail}>
                      <FaCalendarAlt />
                      {pet.age} 歲
                    </div>
                  </div>
                  <div className={styles.petTraits}>
                    {pet.traits &&
                      pet.traits.map((traitId) => (
                        <div
                          key={traitId}
                          className={`${styles.traitTag} ${
                            matchingTraits.includes(traitId)
                              ? styles.matchingTraitTag
                              : ''
                          }`}
                          title={
                            matchingTraits.includes(traitId)
                              ? '符合您的偏好'
                              : ''
                          }
                        >
                          {petTraits[traitId]?.trait_tag || `特徵 ${traitId}`}
                          {matchingTraits.includes(traitId) && (
                            <span className={styles.matchIcon}>✓</span>
                          )}
                        </div>
                      ))}
                  </div>
                  <div className={styles.petLocation}>
                    <FaMapMarkerAlt />
                    {pet.store_name || '未知收容所'}
                  </div>
                  <div className={styles.petActions}>
                    <Link
                      href={`/pets/${pet.id}`}
                      className={styles.viewButton}
                    >
                      查看詳情 <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <Link href="/pets/questionnaire" className={styles.retryButton}>
          重新進行問卷
        </Link>
        <Link
          href="/pets"
          className={`${styles.retryButton} ${styles.browseButton}`}
        >
          瀏覽所有寵物
        </Link>
      </div>
    </div>
  )
}

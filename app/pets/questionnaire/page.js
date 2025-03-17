'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './questionnaire.module.css'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import {
  FaPaw,
  FaHome,
  FaRunning,
  FaUserAlt,
  FaClock,
  FaWeight,
  FaBirthdayCake,
  FaCheck,
  FaInfoCircle,
  FaArrowRight,
} from 'react-icons/fa'

// 寵物特徵數據
const petTraits = [
  { id: 1, tag: '活蹦亂跳', description: '精力充沛，喜歡玩耍' },
  { id: 2, tag: '溫柔似水', description: '性格溫和，容易親近' },
  { id: 3, tag: '獨來獨往', description: '喜歡獨處，不愛群居' },
  { id: 4, tag: '黏人精', description: '離不開主人，渴望關注' },
  { id: 5, tag: '膽小如鼠', description: '容易緊張害怕' },
  { id: 6, tag: '勇敢無畏', description: '不怕生，愛冒險' },
  { id: 7, tag: '聰明伶俐', description: '學習能力強，聰明過人' },
  { id: 8, tag: '固執己見', description: '很有主見，不易改變' },
  { id: 9, tag: '親和力強', description: '喜歡與人互動' },
  { id: 10, tag: '社交達人', description: '喜歡結交新朋友' },
  { id: 11, tag: '怕生害羞', description: '對陌生人警覺' },
  { id: 12, tag: '忠心耿耿', description: '對主人忠誠' },
  { id: 13, tag: '戶外派', description: '喜歡戶外活動' },
  { id: 14, tag: '宅在家', description: '喜歡待在家裡' },
  { id: 15, tag: '需要空間', description: '需要寬敞的活動空間' },
  { id: 16, tag: '適應力強', description: '適應環境能力強' },
  { id: 17, tag: '耐熱', description: '不怕熱' },
  { id: 18, tag: '怕冷', description: '怕冷' },
  { id: 19, tag: '愛乾淨', description: '很愛乾淨' },
  { id: 20, tag: '大胃王', description: '食量很大' },
]

export default function QuestionnaireForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [userId, setUserId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // 表單狀態
  const [formData, setFormData] = useState({
    livingEnvironment: '',
    activityLevel: '',
    experienceLevel: '',
    timeAvailable: '',
    preferredSize: '',
    preferredAge: '',
    preferredTraits: [],
    allergies: false,
    hasChildren: false,
    hasOtherPets: false,
  })

  // 檢查用戶登入狀態
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(data.success)
          if (data.success && data.data) {
            setUserId(data.data.user_id)
          }
        }
      } catch (error) {
        console.error('檢查登入狀態時出錯:', error)
      }
    }

    checkLoginStatus()
  }, [])

  // 處理輸入改變
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 處理特徵標籤選擇
  const handleTraitToggle = (traitId) => {
    setFormData((prev) => {
      const traits = [...prev.preferredTraits]
      if (traits.includes(traitId)) {
        return {
          ...prev,
          preferredTraits: traits.filter((id) => id !== traitId),
        }
      } else {
        return {
          ...prev,
          preferredTraits: [...traits, traitId],
        }
      }
    })
  }

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setNotification({ message: '', type: '' })

    try {
      const response = await fetch('/api/pets/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '提交問卷時出錯')
      }

      setNotification({ message: '問卷提交成功！', type: 'success' })

      // 導航到結果頁面
      if (data.questionnaireId) {
        router.push(`/pets/questionnaire/results?id=${data.questionnaireId}`)
      } else {
        router.push('/pets/questionnaire/results')
      }
    } catch (err) {
      setError(err.message)
      setNotification({ message: '提交失敗：' + err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // 檢查當前步驟是否完成
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.livingEnvironment &&
          formData.activityLevel &&
          formData.experienceLevel
        )
      case 2:
        return (
          formData.timeAvailable &&
          formData.preferredSize &&
          formData.preferredAge
        )
      case 3:
        return formData.preferredTraits.length > 0
      case 4:
        return true // 最後一步總是可以提交
      default:
        return false
    }
  }

  // 下一步
  const handleNextStep = () => {
    if (currentStep < totalSteps && isStepComplete()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // 上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // 檢查表單是否完成填寫
  const isFormValid = () => {
    return (
      formData.livingEnvironment &&
      formData.activityLevel &&
      formData.experienceLevel &&
      formData.timeAvailable &&
      formData.preferredSize &&
      formData.preferredAge &&
      formData.preferredTraits.length > 0
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs
        title="寵物問卷推薦"
        items={[
          {
            label: '寵物領養',
            href: '/pets',
          },
          {
            label: '寵物問卷推薦',
            href: '/pets/questionnaire',
          },
        ]}
      />

      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>尋找您的理想寵物夥伴</h1>
        <p className={styles.subtitle}>
          填寫以下問卷，我們將為您推薦最適合的寵物夥伴！
        </p>
      </div>

      {!isLoggedIn && (
        <div className={styles.loginAlert}>
          <FaInfoCircle className={styles.alertIcon} />
          <div>
            <p>您尚未登入，登入後可保存問卷結果並獲得更精準的推薦。</p>
            <Link href="/member/login" className={styles.loginLink}>
              點擊此處登入
            </Link>
          </div>
        </div>
      )}

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className={styles.stepIndicators}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`${styles.stepIndicator} ${
                currentStep > index ? styles.completed : ''
              } ${currentStep === index + 1 ? styles.current : ''}`}
            >
              {currentStep > index ? <FaCheck /> : index + 1}
            </div>
          ))}
        </div>
        <div className={styles.stepLabels}>
          <span className={currentStep === 1 ? styles.currentStep : ''}>
            基本資訊
          </span>
          <span className={currentStep === 2 ? styles.currentStep : ''}>
            偏好條件
          </span>
          <span className={currentStep === 3 ? styles.currentStep : ''}>
            性格特徵
          </span>
          <span className={currentStep === 4 ? styles.currentStep : ''}>
            其他考量
          </span>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 步驟 1: 基本資訊 */}
        {currentStep === 1 && (
          <div className={styles.formStep}>
            {/* 居住環境 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaHome className={styles.questionIcon} />
                您的居住環境是？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.livingEnvironment === 'apartment'
                      ? styles.selected
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="livingEnvironment"
                    value="apartment"
                    checked={formData.livingEnvironment === 'apartment'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>公寓/大廈</span>
                    <span className={styles.radioDescription}>
                      空間較小，可能有噪音限制
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.livingEnvironment === 'house'
                      ? styles.selected
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="livingEnvironment"
                    value="house"
                    checked={formData.livingEnvironment === 'house'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>獨立住宅</span>
                    <span className={styles.radioDescription}>
                      有較大空間和可能的庭院
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.livingEnvironment === 'rural'
                      ? styles.selected
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="livingEnvironment"
                    value="rural"
                    checked={formData.livingEnvironment === 'rural'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>鄉村/農場</span>
                    <span className={styles.radioDescription}>
                      開放空間，適合活動量大的寵物
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* 活動程度 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaRunning className={styles.questionIcon} />
                您的日常活動程度是？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.activityLevel === 'low' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value="low"
                    checked={formData.activityLevel === 'low'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>低</span>
                    <span className={styles.radioDescription}>
                      喜歡待在家裡，很少運動
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.activityLevel === 'medium' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value="medium"
                    checked={formData.activityLevel === 'medium'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>中等</span>
                    <span className={styles.radioDescription}>
                      偶爾外出活動和運動
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.activityLevel === 'high' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value="high"
                    checked={formData.activityLevel === 'high'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>高</span>
                    <span className={styles.radioDescription}>
                      經常運動和戶外活動
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* 經驗程度 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaUserAlt className={styles.questionIcon} />
                您的寵物飼養經驗是？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.experienceLevel === 'none' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value="none"
                    checked={formData.experienceLevel === 'none'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>無經驗</span>
                    <span className={styles.radioDescription}>
                      第一次養寵物
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.experienceLevel === 'some' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value="some"
                    checked={formData.experienceLevel === 'some'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>有一些經驗</span>
                    <span className={styles.radioDescription}>
                      曾經養過寵物
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.experienceLevel === 'experienced'
                      ? styles.selected
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value="experienced"
                    checked={formData.experienceLevel === 'experienced'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>經驗豐富</span>
                    <span className={styles.radioDescription}>
                      養過多種寵物
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 步驟 2: 偏好條件 */}
        {currentStep === 2 && (
          <div className={styles.formStep}>
            {/* 可用時間 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaClock className={styles.questionIcon} />
                您每天能夠陪伴寵物的時間？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.timeAvailable === 'little' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="timeAvailable"
                    value="little"
                    checked={formData.timeAvailable === 'little'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>少於2小時</span>
                    <span className={styles.radioDescription}>
                      工作繁忙，時間有限
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.timeAvailable === 'moderate' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="timeAvailable"
                    value="moderate"
                    checked={formData.timeAvailable === 'moderate'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>2-4小時</span>
                    <span className={styles.radioDescription}>
                      有一定的陪伴時間
                    </span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.timeAvailable === 'plenty' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="timeAvailable"
                    value="plenty"
                    checked={formData.timeAvailable === 'plenty'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>4小時以上</span>
                    <span className={styles.radioDescription}>
                      有充足的陪伴時間
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* 偏好體型 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaWeight className={styles.questionIcon} />
                您偏好的寵物體型？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredSize === 'small' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredSize"
                    value="small"
                    checked={formData.preferredSize === 'small'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>小型</span>
                    <span className={styles.radioDescription}>10公斤以下</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredSize === 'medium' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredSize"
                    value="medium"
                    checked={formData.preferredSize === 'medium'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>中型</span>
                    <span className={styles.radioDescription}>10-25公斤</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredSize === 'large' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredSize"
                    value="large"
                    checked={formData.preferredSize === 'large'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>大型</span>
                    <span className={styles.radioDescription}>25公斤以上</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredSize === 'any' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredSize"
                    value="any"
                    checked={formData.preferredSize === 'any'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>不限</span>
                    <span className={styles.radioDescription}>
                      體型不是考慮因素
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* 偏好年齡 */}
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaBirthdayCake className={styles.questionIcon} />
                您偏好的寵物年齡？
              </label>
              <div className={styles.optionGroup}>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredAge === 'young' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredAge"
                    value="young"
                    checked={formData.preferredAge === 'young'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>幼年</span>
                    <span className={styles.radioDescription}>2歲以下</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredAge === 'adult' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredAge"
                    value="adult"
                    checked={formData.preferredAge === 'adult'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>成年</span>
                    <span className={styles.radioDescription}>2-8歲</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredAge === 'senior' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredAge"
                    value="senior"
                    checked={formData.preferredAge === 'senior'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>年長</span>
                    <span className={styles.radioDescription}>8歲以上</span>
                  </span>
                </label>
                <label
                  className={`${styles.radioOption} ${
                    formData.preferredAge === 'any' ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredAge"
                    value="any"
                    checked={formData.preferredAge === 'any'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioContent}>
                    <span className={styles.radioTitle}>不限</span>
                    <span className={styles.radioDescription}>
                      年齡不是考慮因素
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 步驟 3: 性格特徵 */}
        {currentStep === 3 && (
          <div className={styles.formStep}>
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>
                <FaPaw className={styles.questionIcon} />
                您希望寵物具備哪些性格特徵？（至少選擇3個）
              </label>
              <p className={styles.traitInstruction}>
                點擊標籤選擇，再次點擊取消選擇
              </p>
              <div className={styles.traitsContainer}>
                {petTraits.map((trait) => (
                  <div
                    key={trait.id}
                    className={`${styles.traitTag} ${
                      formData.preferredTraits.includes(trait.id)
                        ? styles.traitTagSelected
                        : ''
                    }`}
                    onClick={() => handleTraitToggle(trait.id)}
                    title={trait.description}
                  >
                    {trait.tag}
                  </div>
                ))}
              </div>
              {formData.preferredTraits.length > 0 && (
                <div className={styles.selectedCount}>
                  已選擇 {formData.preferredTraits.length} 個特徵
                  {formData.preferredTraits.length < 3 && (
                    <span className={styles.warningText}>
                      （請至少選擇3個）
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 步驟 4: 其他考量 */}
        {currentStep === 4 && (
          <div className={styles.formStep}>
            <div className={styles.formGroup}>
              <label className={styles.questionLabel}>其他重要考量因素</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="allergies"
                    checked={formData.allergies}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>
                    <span className={styles.checkboxTitle}>
                      我或家人有過敏問題
                    </span>
                    <span className={styles.checkboxDescription}>
                      我們會推薦低過敏性的寵物品種
                    </span>
                  </span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="hasChildren"
                    checked={formData.hasChildren}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>
                    <span className={styles.checkboxTitle}>
                      家中有12歲以下的兒童
                    </span>
                    <span className={styles.checkboxDescription}>
                      我們會推薦性格溫和、適合與兒童相處的寵物
                    </span>
                  </span>
                </label>
                <label className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    name="hasOtherPets"
                    checked={formData.hasOtherPets}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>
                    <span className={styles.checkboxTitle}>
                      家中已有其他寵物
                    </span>
                    <span className={styles.checkboxDescription}>
                      我們會推薦能與其他寵物和平相處的寵物
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
        )}

        <div className={styles.navigationButtons}>
          {currentStep > 1 && (
            <button
              type="button"
              className={styles.prevButton}
              onClick={handlePrevStep}
            >
              上一步
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleNextStep}
              disabled={!isStepComplete()}
            >
              下一步 <FaArrowRight />
            </button>
          ) : (
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  處理中...
                </>
              ) : (
                '獲取推薦結果'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

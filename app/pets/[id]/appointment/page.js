'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Image from 'next/image'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap'
import {
  FaPaw,
  FaCalendarAlt,
  FaHome,
  FaUsers,
  FaCheck,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaMars,
  FaVenus,
  FaNeuter,
  FaQuestionCircle,
  FaArrowLeft,
} from 'react-icons/fa'
import Link from 'next/link'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import styles from './appointment.module.css'
import { usePageTitle } from '@/app/context/TitleContext'

export default function PetAppointmentPage() {
  usePageTitle('寵物領養')
  const router = useRouter()
  const params = useParams()
  const { user, token, isAuthenticated } = useAuth()

  // 狀態設定
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [availableTimes, setAvailableTimes] = useState([
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
  ])

  // 表單狀態
  const [formData, setFormData] = useState({
    pet_id: params.id,
    store_id: '',
    appointment_date: '',
    appointment_time: '',
    house_type: '',
    adult_number: 1,
    child_number: 0,
    adopted_experience: false,
    other_pets: '',
    note: '',
    agreed_terms: false,
  })

  // 閱讀進度相關
  const [readingProgress, setReadingProgress] = useState(0)
  const termsRef = useRef(null)

  // 獲取寵物資料和可用時段
  useEffect(() => {
    const fetchPetAndAvailability = async () => {
      try {
        // 獲取寵物資料
        const response = await fetch(`/api/pets/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '無法獲取寵物資料')
        }

        if (data.pet.is_adopted) {
          setError('此寵物已被領養')
          return
        }

        setPet(data.pet)

        // 獲取該日期的預約時段
        if (formData.appointment_date) {
          await checkTimeSlotAvailability(formData.appointment_date)
        }
      } catch (err) {
        console.error('Error fetching pet:', err)
        setError('獲取寵物資料時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchPetAndAvailability()
  }, [params.id, formData.appointment_date])

  // 檢查時段可用性
  const checkTimeSlotAvailability = async (date) => {
    try {
      // 確保日期格式正確
      const formattedDate = new Date(date + 'T00:00:00')
        .toISOString()
        .split('T')[0]

      const response = await fetch(
        `/api/pets/appointments/availability?date=${formattedDate}&pet_id=${params.id}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '無法獲取可用時段')
      }

      // 更新可用時段
      const updatedTimes = availableTimes.map((timeSlot) => ({
        ...timeSlot,
        available: !data.bookedTimes.includes(timeSlot.time),
      }))

      setAvailableTimes(updatedTimes)
    } catch (err) {
      console.error('Error checking availability:', err)
      setError('檢查可用時段時發生錯誤')
    }
  }

  // 處理表單變更
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target

    // 清除對應欄位的錯誤訊息
    setFormErrors({
      ...formErrors,
      [name]: '',
    })

    const newValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // 如果是日期變更，檢查時段可用性
    if (name === 'appointment_date' && value) {
      await checkTimeSlotAvailability(value)
    }
  }

  // 處理時間段選擇
  const handleTimeSelect = (time) => {
    const timeInfo = availableTimes.find((t) => t.time === time)
    if (timeInfo && timeInfo.available) {
      setFormData((prev) => ({
        ...prev,
        appointment_time: time,
      }))
      setFormErrors((prev) => ({
        ...prev,
        appointment_time: '',
      }))
    }
  }

  // 處理閱讀進度
  const handleScroll = () => {
    if (termsRef.current) {
      const element = termsRef.current
      const totalHeight = element.scrollHeight - element.clientHeight
      const scrollPosition = element.scrollTop

      if (totalHeight > 0) {
        // 計算閱讀進度百分比
        const progress = Math.min(
          Math.floor((scrollPosition / totalHeight) * 100),
          100
        )
        setReadingProgress(progress)
      } else {
        setReadingProgress(100) // 內容少於容器高度時直接設為100%
      }
    }
  }

  // 同意規章狀態變更
  const handleTermsToggle = (e) => {
    const { checked } = e.target

    // 如果閱讀進度未達100%，不允許設為同意
    if (readingProgress < 100 && checked) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      agreed_terms: checked,
    }))

    setFormErrors({
      ...formErrors,
      agreed_terms: '',
    })
  }

  // 表單驗證
  const validateForm = () => {
    const errors = {}

    // 設定今天凌晨的時間
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 設定選擇日期凌晨的時間
    const selectedDate = new Date(formData.appointment_date + 'T00:00:00')

    // 設定兩週後凌晨的時間
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    twoWeeksLater.setHours(0, 0, 0, 0)

    if (!formData.appointment_date) {
      errors.appointment_date = '請選擇預約日期（未來14天內）'
    } else if (selectedDate < today) {
      errors.appointment_date = '不能選擇過去的日期'
    } else if (selectedDate > twoWeeksLater) {
      errors.appointment_date = '只能預約未來14天內的時段'
    }

    if (!formData.appointment_time) {
      errors.appointment_time = '請選擇預約時間'
    }

    if (!formData.house_type) {
      errors.house_type = '請選擇住宅類型'
    }

    if (formData.adult_number < 1) {
      errors.adult_number = '成人人數至少為1'
    }

    if (formData.child_number < 0) {
      errors.child_number = '兒童人數不能為負數'
    }

    if (!formData.agreed_terms) {
      errors.agreed_terms = '請閱讀並同意領養規章'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('請先登入')
      router.push('/member/MemberLogin/login')
      return
    }

    // 確保已同意領養規章
    if (!formData.agreed_terms) {
      setFormErrors({
        ...formErrors,
        agreed_terms: '請閱讀並同意領養規章',
      })

      // 滾動到規章區域
      if (termsRef.current) {
        termsRef.current.scrollIntoView({ behavior: 'smooth' })
      }

      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/pets/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
          store_id: pet.store_id,
          appointment_time: formData.appointment_time + ':00',
          adult_number: parseInt(formData.adult_number),
          child_number: parseInt(formData.child_number),
          adopted_experience: Boolean(formData.adopted_experience),
          other_pets: formData.other_pets || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '預約失敗')
      }

      // 預約成功
      setSuccess(true)
    } catch (err) {
      console.error('Error submitting appointment:', err)
      setError(err.message || '預約過程中發生錯誤，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  // 獲取性別圖標
  const getGenderIcon = () => {
    if (!pet) return null

    switch (pet.gender) {
      case 'M':
        return <FaMars className="text-primary" />
      case 'F':
        return <FaVenus className="text-danger" />
      default:
        return <FaNeuter className="text-secondary" />
    }
  }

  // 獲取可用時間標籤樣式
  const getTimeButtonClass = (time) => {
    const timeInfo = availableTimes.find((t) => t.time === time)
    if (!timeInfo) return styles.timeUnavailable

    if (!timeInfo.available) return styles.timeUnavailable
    return formData.appointment_time === time
      ? styles.timeSelected
      : styles.timeAvailable
  }

  // 渲染載入中狀態
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>載入中，請稍候...</p>
        </div>
      </Container>
    )
  }

  // 渲染錯誤狀態
  if (error && !pet) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>發生錯誤</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => router.back()}>
              返回
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }

  // 渲染成功狀態
  if (success) {
    return (
      <Container className="py-5">
        <Card className={`border-0 shadow ${styles.successCard}`}>
          <Card.Body className="text-center p-5">
            <div className={styles.successIcon}>
              <FaCheck size={50} className="text-success" />
            </div>
            <h2 className="mt-4 mb-3">預約成功！</h2>
            <p className="mb-4">
              您已成功預約與 {pet?.name}{' '}
              的見面。我們會盡快審核您的申請，並通過電子郵件或電話與您聯繫確認詳情。
            </p>
            <div className={styles.successInfo}>
              <div className={styles.successDetail}>
                <FaCalendarAlt />
                <span>預約日期：{formData.appointment_date}</span>
              </div>
              <div className={styles.successDetail}>
                <FaClock />
                <span>預約時間：{formData.appointment_time}</span>
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="primary" as={Link} href={`/pets/${params.id}`}>
                返回寵物頁面
              </Button>
              <Button
                variant="outline-primary"
                as={Link}
                href="/member/appointments"
              >
                查看我的預約
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <Container className={`py-5 ${styles.appointmentContainer}`}>
      <Breadcrumbs
        title="寵物預約"
        items={[
          {
            label: '寵物領養',
            href: '/pets',
          },
          {
            label: pet?.name || '寵物',
            href: `/pets/${params.id}`,
          },
          {
            label: '預約',
            href: `/pets/${params.id}/appointment`,
          },
        ]}
      />

      <Row className="mt-4">
        <Col lg={4} md={5}>
          {/* 寵物資訊卡 */}
          <Card className={`border-0 shadow-sm mb-4 ${styles.petCard}`}>
            <div className={styles.petImageWrapper}>
              {pet?.photos?.length > 0 ? (
                <Image
                  src={
                    pet.photos.find((photo) => photo.is_main)?.photo_url ||
                    pet.photos[0].photo_url
                  }
                  alt={pet.name}
                  className={styles.petImage}
                  width={400}
                  height={300}
                  priority
                />
              ) : (
                <div className={styles.petImagePlaceholder}>
                  <FaPaw size={40} />
                  <span>無圖片</span>
                </div>
              )}

              <div className={styles.petStatus}>
                <span className={styles.statusDot}></span>
                可領養
              </div>
            </div>

            <Card.Body>
              <div className={styles.petNameSection}>
                <Card.Title className={styles.petName}>{pet?.name}</Card.Title>
                <div className={styles.petGender}>{getGenderIcon()}</div>
              </div>

              <div className={styles.petBasicInfo}>
                <Badge bg="light" text="dark" className="me-2 mb-2">
                  {pet?.species === 'dog'
                    ? '狗'
                    : pet?.species === 'cat'
                    ? '貓'
                    : '其他'}
                </Badge>
                {pet?.age_year > 0 && (
                  <Badge bg="light" text="dark" className="me-2 mb-2">
                    {pet.age_year}歲
                    {pet.age_month > 0 ? `${pet.age_month}個月` : ''}
                  </Badge>
                )}
                {pet?.age_year === 0 && pet?.age_month > 0 && (
                  <Badge bg="light" text="dark" className="me-2 mb-2">
                    {pet.age_month}個月
                  </Badge>
                )}
                {pet?.vaccinated && (
                  <Badge bg="success" className="me-2 mb-2">
                    已接種疫苗
                  </Badge>
                )}
                {pet?.neutered && (
                  <Badge bg="info" className="me-2 mb-2">
                    已絕育
                  </Badge>
                )}
              </div>

              <hr />

              <div className={styles.petDetailInfo}>
                <div className={styles.petInfoItem}>
                  <strong>品種：</strong> {pet?.breed || pet?.variety || '混種'}
                </div>
                {pet?.color && (
                  <div className={styles.petInfoItem}>
                    <strong>毛色：</strong> {pet.color}
                  </div>
                )}
                {pet?.store_name && (
                  <div className={styles.petInfoItem}>
                    <strong>
                      <FaMapMarkerAlt className="me-1" /> 收容所：
                    </strong>{' '}
                    {pet.store_name}
                  </div>
                )}
                {pet?.adopt_fee > 0 ? (
                  <div className={styles.petInfoItem}>
                    <strong>領養費用：</strong>{' '}
                    <span className={styles.adoptFee}>NT${pet.adopt_fee}</span>
                  </div>
                ) : (
                  <div className={styles.petInfoItem}>
                    <strong>領養費用：</strong> 免費
                  </div>
                )}
              </div>

              <div className="mt-3">
                <Link
                  href={`/pets/${params.id}`}
                  className="btn btn-outline-primary btn-sm w-100"
                >
                  查看詳情
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* 預約須知 */}
          <Card className={`border-0 shadow-sm ${styles.notesCard}`}>
            <Card.Body>
              <Card.Title className={styles.notesTitle}>
                <FaInfoCircle className="me-2 text-primary" />
                預約須知
              </Card.Title>
              <hr />
              <ul className={styles.notesList}>
                <li>預約成功後，我們會在1-2個工作日內與您聯繫確認</li>
                <li>請務必準時赴約，如需取消請提前24小時通知</li>
                <li>參觀時請遵守收容所規定，不要驚擾其他動物</li>
                <li>未滿18歲需由家長陪同</li>
                <li>領養需符合相關條件並通過審核</li>
              </ul>

              <Alert variant="warning" className={styles.warningAlert}>
                <FaExclamationTriangle className="me-2" />
                為確保能順利完成預約，請確認您的會員資料中的聯絡電話是正確的。
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className={`border-0 shadow ${styles.formCard}`}>
            <Card.Body className="p-4">
              <h2 className={styles.formTitle}>
                <FaCalendarAlt className="me-2 text-primary" />
                預約看寵物
              </h2>

              {error && <Alert variant="danger">{error}</Alert>}

              {!isAuthenticated && (
                <Alert variant="warning" className={styles.loginAlert}>
                  <div className="d-flex align-items-center">
                    <FaInfoCircle size={20} className="me-3 text-warning" />
                    <div>
                      <p className="mb-1">您尚未登入，無法進行預約。</p>
                      <p className="mb-0">
                        請先{' '}
                        <Link
                          href={`/member/MemberLogin/login?redirect=/pets/${params.id}/appointment`}
                          className="alert-link"
                        >
                          登入會員
                        </Link>{' '}
                        後再進行預約流程。
                      </p>
                    </div>
                  </div>
                </Alert>
              )}

              {/* 領養規章 */}
              <div className={styles.formSection}>
                <h5 className={styles.sectionTitle}>
                  <FaInfoCircle className="me-2 text-primary" />
                  領養規章與須知
                </h5>

                <div className={styles.termsContainer}>
                  <div
                    ref={termsRef}
                    className={styles.termsScroll}
                    onScroll={handleScroll}
                  >
                    <h6>保障動物權益與健康的領養守則</h6>
                    <p>
                      感謝您考慮透過領養來為浪浪提供一個永久的家。為確保動物福利及雙方權益，請您詳細閱讀以下規章：
                    </p>

                    <h6>1. 領養前評估</h6>
                    <p>
                      • 確認您的生活環境、時間和經濟狀況是否適合長期飼養寵物。
                    </p>
                    <p>• 考慮寵物的品種特性、大小、活動需求及預期壽命。</p>
                    <p>• 所有同住成員應對領養決定達成共識。</p>

                    <h6>2. 基本責任</h6>
                    <p>• 提供適當的食物、清潔水源、舒適住所及定期運動。</p>
                    <p>• 按時接種疫苗、驅蟲及進行健康檢查。</p>
                    <p>• 保持寵物清潔並維持生活環境衛生。</p>
                    <p>• 為寵物辦理寵物登記、晶片植入等法定程序。</p>

                    <h6>3. 領養承諾</h6>
                    <p>• 視寵物為家庭成員，提供終生照顧。</p>
                    <p>• 不得隨意棄養、轉讓或售賣領養的寵物。</p>
                    <p>• 如遇特殊情況無法繼續飼養，需先聯繫本平台尋求協助。</p>

                    <h6>4. 追蹤服務</h6>
                    <p>
                      •
                      領養後3個月內，我們將進行家訪或視訊訪問，確認寵物適應情況。
                    </p>
                    <p>• 領養人需配合提供寵物近況照片或視訊。</p>

                    <h6>5. 退養規定</h6>
                    <p>• 領養2週內發現重大健康問題，可申請退養評估。</p>
                    <p>• 退養需經本平台確認，不得自行處置。</p>

                    <h6>6. 寵物死亡報告</h6>
                    <p>• 若寵物不幸死亡，需通知本平台並提供相關證明。</p>

                    <h6>7. 法律責任</h6>
                    <p>• 領養人需承擔寵物可能造成的一切損害賠償責任。</p>
                    <p>
                      • 嚴禁將領養寵物用於繁殖、實驗、鬥獸等商業或不當用途。
                    </p>
                  </div>

                  <div className={styles.termsAgree}>
                    <Form.Check
                      type="checkbox"
                      id="agreed_terms"
                      name="agreed_terms"
                      checked={formData.agreed_terms}
                      onChange={handleTermsToggle}
                      disabled={readingProgress < 100}
                      label="我已閱讀並同意遵守上述領養規章"
                      className={styles.termsCheckbox}
                      isInvalid={!!formErrors.agreed_terms}
                    />
                    {formErrors.agreed_terms && (
                      <div className="text-danger small mt-1">
                        {formErrors.agreed_terms}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>
                    <FaCalendarAlt className="me-2 text-primary" />
                    選擇預約時間
                  </h5>

                  <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="appointment_date">
                      <Form.Label>
                        預約日期 <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="date"
                          name="appointment_date"
                          value={formData.appointment_date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          isInvalid={!!formErrors.appointment_date}
                          required
                          id="appointment_date_input"
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.appointment_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      預約時間 <span className="text-danger">*</span>
                    </Form.Label>
                    {formErrors.appointment_time && (
                      <div className="text-danger mb-2 small">
                        {formErrors.appointment_time}
                      </div>
                    )}

                    <div className={styles.timeSlots}>
                      {availableTimes.map((timeInfo) => (
                        <button
                          key={timeInfo.time}
                          type="button"
                          className={getTimeButtonClass(timeInfo.time)}
                          onClick={() => handleTimeSelect(timeInfo.time)}
                          disabled={!timeInfo.available}
                        >
                          {timeInfo.time}
                          {!timeInfo.available && (
                            <span className={styles.unavailableText}>已滿</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <Form.Text className="text-muted">
                      藍色時段表示可預約，灰色時段表示已滿
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>
                    <FaHome className="me-2 text-primary" />
                    居住環境資訊
                  </h5>

                  <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="house_type">
                      <Form.Label>
                        住宅類型 <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="house_type"
                        value={formData.house_type}
                        onChange={handleChange}
                        isInvalid={!!formErrors.house_type}
                        required
                      >
                        <option value="">請選擇住宅類型</option>
                        <option value="apartment">公寓</option>
                        <option value="house">獨立房屋</option>
                        <option value="townhouse">連棟房屋</option>
                        <option value="other">其他</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.house_type}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        此資訊有助於我們評估寵物適合的生活環境
                      </Form.Text>
                    </Form.Group>
                  </Row>

                  <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="adult_number">
                      <Form.Label>成人人數</Form.Label>
                      <Form.Control
                        type="number"
                        name="adult_number"
                        value={formData.adult_number}
                        onChange={handleChange}
                        min="1"
                        isInvalid={!!formErrors.adult_number}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.adult_number}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} md={6} controlId="child_number">
                      <Form.Label>兒童人數</Form.Label>
                      <Form.Control
                        type="number"
                        name="child_number"
                        value={formData.child_number}
                        onChange={handleChange}
                        min="0"
                        isInvalid={!!formErrors.child_number}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.child_number}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>

                  <Row className="mb-4">
                    <Form.Group as={Col} md={6} controlId="adopted_experience">
                      <Form.Check
                        type="checkbox"
                        label="是否有養寵物經驗"
                        name="adopted_experience"
                        checked={formData.adopted_experience}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        有養寵物經驗會提高領養審核通過的機會
                      </Form.Text>
                    </Form.Group>
                  </Row>

                  <Form.Group className="mb-3" controlId="other_pets">
                    <Form.Label>家中是否有其他寵物？請說明</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="other_pets"
                      value={formData.other_pets}
                      onChange={handleChange}
                      placeholder="例如：有一隻3歲的柴犬"
                    />
                    <Form.Text className="text-muted">
                      若有其他寵物，請說明品種、年齡和數量
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="note">
                    <Form.Label>備註</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="有任何問題或特殊需求，請在此說明"
                    />
                  </Form.Group>
                </div>

                <div className={styles.formActions}>
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    className={styles.submitButton}
                    disabled={submitting || !isAuthenticated}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        提交中...
                      </>
                    ) : (
                      '提交預約申請'
                    )}
                  </Button>

                  <p className={styles.submitNote}>
                    <FaInfoCircle className="me-1" />
                    提交後，我們將會審核您的申請並盡快與您聯繫
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

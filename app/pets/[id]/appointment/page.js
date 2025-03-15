'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import styles from './appointment.module.css'

export default function PetAppointmentPage({ params }) {
  const router = useRouter()
  const { id } = params

  // 狀態設定
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)
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
    appointment_date: '',
    appointment_time: '',
    house_type: '',
    adult_number: 1,
    child_number: 0,
    adopted_experience: false,
    other_pets: '',
    note: '',
  })

  // 獲取寵物資料
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/pets/${id}`)
        const data = await response.json()

        if (data.pet) {
          setPet(data.pet)
          // 模擬獲取可用時間段
          generateAvailableTimes(data.pet.id)
        } else {
          setError('無法獲取寵物資料')
        }
      } catch (err) {
        console.error('Error fetching pet:', err)
        setError('獲取寵物資料時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    // 模擬獲取可用時間段的函數
    const generateAvailableTimes = (petId) => {
      // 在實際應用中，這應該是從API獲取的數據
      // 這裡我們使用模擬數據
      const mockAvailability = [
        { time: '10:00', available: Math.random() > 0.3 },
        { time: '11:00', available: Math.random() > 0.3 },
        { time: '13:00', available: Math.random() > 0.3 },
        { time: '14:00', available: Math.random() > 0.3 },
        { time: '15:00', available: Math.random() > 0.3 },
        { time: '16:00', available: Math.random() > 0.3 },
      ]
      setAvailableTimes(mockAvailability)
    }

    // 檢查用戶登入狀態
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()

        if (data.success && data.user) {
          setUser(data.user)
        }
      } catch (err) {
        console.error('Error checking auth:', err)
      }
    }

    fetchPet()
    checkAuth()
  }, [id])

  // 處理表單變更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // 清除對應欄位的錯誤訊息
    setFormErrors({
      ...formErrors,
      [name]: '',
    })

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 表單驗證
  const validateForm = () => {
    const errors = {}

    if (!formData.appointment_date) {
      errors.appointment_date = '請選擇預約日期'
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

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 處理時間段選擇
  const handleTimeSelect = (time) => {
    const timeInfo = availableTimes.find((t) => t.time === time)
    if (timeInfo && timeInfo.available) {
      setFormData({
        ...formData,
        appointment_time: time,
      })
      setFormErrors({
        ...formErrors,
        appointment_time: '',
      })
    }
  }

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 檢查用戶是否登入
    if (!user) {
      setError('請先登入後再預約')
      router.push(`/member/login?redirect=/pets/${id}/appointment`)
      return
    }

    // 驗證表單
    if (!validateForm()) {
      setError('請修正表單中的錯誤')
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
          pet_id: id,
          user_id: user.user_id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // 重置表單
        setFormData({
          appointment_date: '',
          appointment_time: '',
          house_type: '',
          adult_number: 1,
          child_number: 0,
          adopted_experience: false,
          other_pets: '',
          note: '',
        })
      } else {
        setError(data.message || '預約失敗，請稍後再試')
      }
    } catch (err) {
      console.error('Error submitting appointment:', err)
      setError('提交預約時發生錯誤')
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
              <Button variant="primary" as={Link} href={`/pets/${id}`}>
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
      <Link href={`/pets/${id}`} className={styles.backLink}>
        <FaArrowLeft className="me-2" /> 返回寵物詳情
      </Link>

      <Row className="mt-4">
        <Col lg={4} md={5}>
          {/* 寵物資訊卡 */}
          <Card className={`border-0 shadow-sm mb-4 ${styles.petCard}`}>
            <div className={styles.petImageWrapper}>
              {pet?.main_image ? (
                <Image
                  src={pet.main_image}
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
                  {pet?.type === 'dog'
                    ? '狗'
                    : pet?.type === 'cat'
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
                  href={`/pets/${id}`}
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

              {!user && (
                <Alert variant="warning" className={styles.loginAlert}>
                  <div className="d-flex align-items-center">
                    <FaInfoCircle size={20} className="me-3 text-warning" />
                    <div>
                      <p className="mb-1">您尚未登入，無法進行預約。</p>
                      <p className="mb-0">
                        請先{' '}
                        <Link
                          href={`/member/login?redirect=/pets/${id}/appointment`}
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
                      <Form.Control
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        isInvalid={!!formErrors.appointment_date}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.appointment_date}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        請選擇未來14天內的日期
                      </Form.Text>
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
                    disabled={submitting || !user}
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

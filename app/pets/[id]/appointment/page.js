'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap'
import {
  FaPaw,
  FaCalendarAlt,
  FaHome,
  FaUsers,
  FaCheck,
  FaInfoCircle,
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

        if (data.success) {
          setPet(data.data)
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
    if (
      !formData.appointment_date ||
      !formData.appointment_time ||
      !formData.house_type
    ) {
      setError('請填寫所有必填欄位')
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

  // 渲染載入中狀態
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">載入中...</p>
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
        <Card className="border-0 shadow">
          <Card.Body className="text-center p-5">
            <div className={styles.successIcon}>
              <FaCheck size={50} className="text-success" />
            </div>
            <h2 className="mt-4 mb-3">預約成功！</h2>
            <p className="mb-4">
              您已成功預約與 {pet?.name}{' '}
              的見面。我們會盡快審核您的申請，並通過電子郵件或電話與您聯繫確認詳情。
            </p>
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
    <Container className="py-5">
      <Row>
        <Col lg={4} md={5}>
          {/* 寵物資訊卡 */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Img
              variant="top"
              src={pet?.main_image || '/images/pet-placeholder.jpg'}
              alt={pet?.name}
              className={styles.petImage}
            />
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <FaPaw className="me-2 text-primary" />
                {pet?.name}
              </Card.Title>
              <hr />
              <div className={styles.petInfo}>
                <div>
                  <strong>品種：</strong> {pet?.breed || '混種'}
                </div>
                <div>
                  <strong>性別：</strong>{' '}
                  {pet?.gender === 'M'
                    ? '公'
                    : pet?.gender === 'F'
                    ? '母'
                    : '未知'}
                </div>
                <div>
                  <strong>年齡：</strong>{' '}
                  {pet?.age_year ? `${pet.age_year}年` : ''}{' '}
                  {pet?.age_month ? `${pet.age_month}個月` : ''}
                </div>
                <div>
                  <strong>狀態：</strong>{' '}
                  <span className="text-success">可領養</span>
                </div>
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
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
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
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <h2 className="mb-4 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-primary" />
                預約看寵物
              </h2>

              {error && <Alert variant="danger">{error}</Alert>}

              {!user && (
                <Alert variant="warning">
                  您尚未登入。請先{' '}
                  <Link
                    href={`/member/login?redirect=/pets/${id}/appointment`}
                    className="alert-link"
                  >
                    登入
                  </Link>{' '}
                  後再進行預約。
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="appointment_date">
                    <Form.Label>預約日期 *</Form.Label>
                    <Form.Control
                      type="date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={6} controlId="appointment_time">
                    <Form.Label>預約時間 *</Form.Label>
                    <Form.Select
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">請選擇時間</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </Form.Select>
                  </Form.Group>
                </Row>

                <hr className="my-4" />
                <h5 className="mb-3 d-flex align-items-center">
                  <FaHome className="me-2 text-primary" />
                  居住環境資訊
                </h5>

                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="house_type">
                    <Form.Label>住宅類型 *</Form.Label>
                    <Form.Select
                      name="house_type"
                      value={formData.house_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">請選擇住宅類型</option>
                      <option value="apartment">公寓</option>
                      <option value="house">獨立房屋</option>
                      <option value="townhouse">連棟房屋</option>
                      <option value="other">其他</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group as={Col} md={3} controlId="adult_number">
                    <Form.Label>成人人數</Form.Label>
                    <Form.Control
                      type="number"
                      name="adult_number"
                      value={formData.adult_number}
                      onChange={handleChange}
                      min="1"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={3} controlId="child_number">
                    <Form.Label>兒童人數</Form.Label>
                    <Form.Control
                      type="number"
                      name="child_number"
                      value={formData.child_number}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md={6} controlId="adopted_experience">
                    <Form.Check
                      type="checkbox"
                      label="是否有養寵物經驗"
                      name="adopted_experience"
                      checked={formData.adopted_experience}
                      onChange={handleChange}
                    />
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

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
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
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

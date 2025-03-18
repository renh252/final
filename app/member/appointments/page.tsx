'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Container,
  Row,
  Col,
  Badge,
  Card,
  Button,
  Alert,
  Nav,
  Modal,
} from 'react-bootstrap'
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaPaw,
  FaInfoCircle,
  FaTable,
  FaCalendarDay,
  FaTimes,
} from 'react-icons/fa'
import Link from 'next/link'
import styles from './appointments.module.css'
import dynamic from 'next/dynamic'

// 使用動態導入避免伺服器端渲染錯誤
const MemberAppointmentCalendar = dynamic(
  () => import('../_components/MemberAppointmentCalendar'),
  { ssr: false }
)

// 定義視圖模式類型
type ViewMode = 'table' | 'calendar'

// 定義預約狀態類型
type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

// 定義預約資料介面
interface Appointment {
  id: number
  pet_id: number
  pet_name: string
  pet_image: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  store_name: string
  created_at: string
  updated_at: string
}

// 定義用戶資料類型
interface User {
  user_id: number
  name: string
  email: string
}

// 模擬預約資料
const mockAppointments: Appointment[] = [
  {
    id: 1,
    pet_id: 101,
    pet_name: '小白',
    pet_image: '/images/pets/pet1.jpg',
    appointment_date: '2025-03-01',
    appointment_time: '14:00',
    status: 'pending',
    store_name: '台北寵物之家',
    created_at: '2025-03-01T10:00:00',
    updated_at: '2025-03-01T10:00:00',
  },
  {
    id: 2,
    pet_id: 102,
    pet_name: '黑妞',
    pet_image: '/images/pets/pet2.jpg',
    appointment_date: '2025-03-11',
    appointment_time: '15:00',
    status: 'approved',
    store_name: '新北寵物中心',
    created_at: '2025-03-10T14:30:00',
    updated_at: '2025-03-11T09:00:00',
  },
  {
    id: 3,
    pet_id: 103,
    pet_name: '橘子',
    pet_image: '/images/pets/pet3.jpg',
    appointment_date: '2025-03-15',
    appointment_time: '10:30',
    status: 'pending',
    store_name: '台中寵物收容所',
    created_at: '2025-03-14T08:15:00',
    updated_at: '2025-03-14T08:15:00',
  },
  {
    id: 4,
    pet_id: 104,
    pet_name: '小灰',
    pet_image: '/images/pets/pet4.jpg',
    appointment_date: '2025-03-19',
    appointment_time: '11:00',
    status: 'completed',
    store_name: '高雄動物之家',
    created_at: '2025-03-17T16:45:00',
    updated_at: '2025-03-18T12:30:00',
  },
]

// 狀態追蹤組件
const AppointmentStatusTracker = ({
  status,
}: {
  status: AppointmentStatus
}) => {
  const steps = [
    { label: '預約提交', value: 'pending' },
    { label: '預約確認', value: 'approved' },
    { label: '完成領養', value: 'completed' },
  ]

  const getStepStatus = (stepValue: string) => {
    switch (status) {
      case 'pending':
        return stepValue === 'pending' ? 'active' : ''
      case 'approved':
        return ['pending', 'approved'].includes(stepValue) ? 'active' : ''
      case 'completed':
        return ['pending', 'approved', 'completed'].includes(stepValue)
          ? 'active'
          : ''
      case 'cancelled':
        return 'cancelled'
      default:
        return ''
    }
  }

  return (
    <div className={styles.statusTracker}>
      {steps.map((step, index) => (
        <div
          key={step.value}
          className={`${styles.step} ${styles[getStepStatus(step.value)]}`}
        >
          <div className={styles.stepNumber}>{index + 1}</div>
          <div className={styles.stepLabel}>{step.label}</div>
          {index < steps.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  )
}

// 預約狀態標籤組件
const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const statusConfig = {
    pending: { label: '待審核', variant: 'warning' },
    approved: { label: '已確認', variant: 'success' },
    completed: { label: '已完成', variant: 'info' },
    cancelled: { label: '已取消', variant: 'danger' },
  }

  const config = statusConfig[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

// 預約詳情彈出視窗組件
const AppointmentDetailModal = ({
  appointment,
  show,
  onHide,
  onCancel,
}: {
  appointment: Appointment | null
  show: boolean
  onHide: () => void
  onCancel: (id: number) => void
}) => {
  if (!appointment) return null

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      className={styles.appointmentDetailModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>預約詳情</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.modalPetInfo}>
          <div className={styles.modalPetImageContainer}>
            <Image
              src={appointment.pet_image}
              alt={appointment.pet_name}
              width={180}
              height={180}
              className={styles.modalPetImage}
            />
          </div>
          <div className={styles.modalPetDetails}>
            <div className="d-flex justify-content-between align-items-start">
              <h3>{appointment.pet_name}</h3>
              <StatusBadge status={appointment.status} />
            </div>

            <div className={styles.modalDetailItem}>
              <div className={styles.modalDetailIcon}>
                <FaCalendarAlt />
              </div>
              <div>
                <strong>預約日期：</strong>
                {appointment.appointment_date}
              </div>
            </div>

            <div className={styles.modalDetailItem}>
              <div className={styles.modalDetailIcon}>
                <FaClock />
              </div>
              <div>
                <strong>預約時間：</strong>
                {appointment.appointment_time}
              </div>
            </div>

            <div className={styles.modalDetailItem}>
              <div className={styles.modalDetailIcon}>
                <FaMapMarkerAlt />
              </div>
              <div>
                <strong>預約地點：</strong>
                {appointment.store_name}
              </div>
            </div>
          </div>
        </div>

        <h4 className={styles.sectionTitle}>預約狀態</h4>
        <AppointmentStatusTracker status={appointment.status} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          關閉
        </Button>
        <Link
          href={`/pets/${appointment.pet_id}`}
          className="btn btn-outline-primary"
        >
          查看寵物資訊
        </Link>
        {appointment.status === 'pending' && (
          <Button
            variant="danger"
            onClick={() => {
              onCancel(appointment.id)
              onHide()
            }}
          >
            取消預約
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  )
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)

  useEffect(() => {
    // 檢查用戶登入狀態
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/member/me')

        if (!response.ok) {
          console.log('User not logged in')
          return
        }

        const data = await response.json()

        if (data.success && data.data) {
          setUser(data.data)
        }
      } catch (err) {
        console.error('Error checking auth:', err)
      }
    }

    // 模擬 API 請求
    const fetchAppointments = async () => {
      try {
        // 實際專案中，這裡會呼叫 API
        // const response = await fetch('/api/member/appointments')
        // const data = await response.json()

        // 使用模擬資料
        setTimeout(() => {
          setAppointments(mockAppointments)
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setError('獲取預約資料時發生錯誤')
        setLoading(false)
      }
    }

    checkAuth()
    fetchAppointments()
  }, [])

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      // 實際專案中，這裡會呼叫 API
      // await fetch(`/api/member/appointments/${appointmentId}`, {
      //   method: 'DELETE',
      // })

      // 模擬取消預約
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId
            ? { ...app, status: 'cancelled' as AppointmentStatus }
            : app
        )
      )
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setError('取消預約時發生錯誤')
    }
  }

  // 處理日曆事件點擊
  const handleCalendarEventClick = (appointmentId: number) => {
    setSelectedAppointment(appointmentId)
    setShowDetailModal(true)
  }

  // 處理表格視圖中的詳情查看
  const handleViewDetails = (appointmentId: number) => {
    setSelectedAppointment(appointmentId)
    setShowDetailModal(true)
  }

  // 切換視圖模式
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  // 取得當前選中的預約
  const getSelectedAppointment = () => {
    if (selectedAppointment === null) return null
    return appointments.find((app) => app.id === selectedAppointment) || null
  }

  // 關閉詳情模態框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
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

  // 渲染提示訊息
  const renderAlerts = () => (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {!user && (
        <Alert variant="warning" className="mb-4">
          <FaInfoCircle className="me-2" />
          請先登入以查看您的預約記錄。
          <Link href="/member/login" className="alert-link ms-2">
            立即登入
          </Link>
        </Alert>
      )}
    </>
  )

  // 渲染空狀態
  const renderEmptyState = () => (
    <Card className="text-center p-5">
      <Card.Body>
        <FaPaw size={40} className="text-muted mb-3" />
        <h3>尚無預約記錄</h3>
        <p className="text-muted">
          您目前沒有任何寵物預約記錄。
          <br />
          立即瀏覽可愛的寵物，開始您的領養之旅！
        </p>
        <Link href="/pets" className="btn btn-primary">
          瀏覽寵物
        </Link>
          </Card.Body>
        </Card>
  )

  // 渲染表格視圖
  const renderTableView = () => (
    <>
      {appointments.map((appointment) => (
        <Card key={appointment.id} className={`mb-4 ${styles.appointmentCard}`}>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className={styles.petImageContainer}>
                <Image
                    src={appointment.pet_image}
                    alt={appointment.pet_name}
                    width={200}
                    height={200}
                  className={styles.petImage}
                />
                </div>
              </Col>
              <Col md={6}>
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentHeader}>
                    <h3 className={styles.petName}>{appointment.pet_name}</h3>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <div className={styles.appointmentDetails}>
                    <p>
                      <FaCalendarAlt className="me-2" />
                      預約日期：{appointment.appointment_date}
                    </p>
                    <p>
                      <FaClock className="me-2" />
                      預約時間：{appointment.appointment_time}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2" />
                      預約地點：{appointment.store_name}
                    </p>
                  </div>
                  <AppointmentStatusTracker status={appointment.status} />
                </div>
              </Col>
              <Col md={3} className="d-flex flex-column justify-content-center">
                <div className={styles.appointmentActions}>
                  <Button
                    variant="outline-primary"
                    className="mb-2 w-100"
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    查看詳情
                  </Button>
                  <Link
                    href={`/pets/${appointment.pet_id}`}
                    className="btn btn-outline-primary mb-2 w-100"
                  >
                    查看寵物資訊
                  </Link>
                  {appointment.status === 'pending' && (
                    <Button
                      variant="danger"
                      className="w-100"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      取消預約
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
            </Card.Body>
          </Card>
      ))}
    </>
  )

  return (
    <Container className="py-5">
      <h2 className={styles.pageTitle}>
        <FaCalendarAlt className="me-2" />
        我的預約記錄
      </h2>

      {renderAlerts()}

      {appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Nav
            variant="tabs"
            className={`mb-4 ${styles.viewToggleTabs}`}
            activeKey={viewMode}
            onSelect={(k) => handleViewModeChange(k as ViewMode)}
          >
            <Nav.Item>
              <Nav.Link eventKey="table">
                <FaTable className="me-2" />
                列表視圖
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="calendar">
                <FaCalendarDay className="me-2" />
                日曆視圖
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {viewMode === 'table' ? (
            renderTableView()
          ) : (
            <MemberAppointmentCalendar
              appointments={appointments}
              onEventClick={handleCalendarEventClick}
            />
          )}

          <AppointmentDetailModal
            appointment={getSelectedAppointment()}
            show={showDetailModal}
            onHide={handleCloseDetailModal}
            onCancel={handleCancelAppointment}
          />
        </>
      )}
    </Container>
  )
}

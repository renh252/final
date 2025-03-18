'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Alert,
  Modal,
  Nav,
} from 'react-bootstrap'
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaTable,
  FaCalendarAlt,
} from 'react-icons/fa'
import styles from './appointments.module.css'
import dynamic from 'next/dynamic'

// 使用動態導入以避免 SSR 錯誤
const FullCalendarComponent = dynamic(
  () => {
    return import('../../_components/FullCalendar')
  },
  { ssr: false }
)

// 定義預約狀態類型
type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

// 定義預約資料介面
interface Appointment {
  id: number
  user_id: number
  pet_id: number
  user_name: string
  pet_name: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  house_type: string
  adult_number: number
  child_number: number
  adopted_experience: boolean
  other_pets: string
  note: string
  created_at: string
  updated_at: string
}

// 模擬資料
const mockAppointments: Appointment[] = [
  {
    id: 1,
    user_id: 101,
    pet_id: 201,
    user_name: '王小明',
    pet_name: '小白',
    appointment_date: '2024-03-20',
    appointment_time: '14:00',
    status: 'pending',
    house_type: 'apartment',
    adult_number: 2,
    child_number: 1,
    adopted_experience: true,
    other_pets: '有一隻3歲的柴犬',
    note: '希望能在週末參觀',
    created_at: '2024-03-18T10:00:00',
    updated_at: '2024-03-18T10:00:00',
  },
  {
    id: 2,
    user_id: 102,
    pet_id: 202,
    user_name: '李小華',
    pet_name: '黑妞',
    appointment_date: '2024-03-21',
    appointment_time: '15:00',
    status: 'approved',
    house_type: 'house',
    adult_number: 3,
    child_number: 0,
    adopted_experience: false,
    other_pets: '',
    note: '第一次領養，需要更多指導',
    created_at: '2024-03-17T14:30:00',
    updated_at: '2024-03-18T09:00:00',
  },
  {
    id: 3,
    user_id: 103,
    pet_id: 203,
    user_name: '張大明',
    pet_name: '橘子',
    appointment_date: '2024-03-22',
    appointment_time: '10:00',
    status: 'pending',
    house_type: 'apartment',
    adult_number: 1,
    child_number: 0,
    adopted_experience: true,
    other_pets: '有一隻5歲的貓',
    note: '希望找個溫順的伴侶貓',
    created_at: '2024-03-19T09:15:00',
    updated_at: '2024-03-19T09:15:00',
  },
  {
    id: 4,
    user_id: 104,
    pet_id: 204,
    user_name: '林小玲',
    pet_name: '小黑',
    appointment_date: '2024-03-23',
    appointment_time: '16:30',
    status: 'approved',
    house_type: 'house',
    adult_number: 2,
    child_number: 1,
    adopted_experience: false,
    other_pets: '',
    note: '我們有一個4歲的孩子，希望找一隻友善的寵物',
    created_at: '2024-03-19T14:22:00',
    updated_at: '2024-03-20T10:10:00',
  },
  {
    id: 5,
    user_id: 105,
    pet_id: 205,
    user_name: '陳小芳',
    pet_name: '奶茶',
    appointment_date: '2024-03-24',
    appointment_time: '11:00',
    status: 'completed',
    house_type: 'apartment',
    adult_number: 2,
    child_number: 0,
    adopted_experience: true,
    other_pets: '',
    note: '已經有養狗經驗，希望再添一隻',
    created_at: '2024-03-20T08:30:00',
    updated_at: '2024-03-24T12:15:00',
  },
]

export default function PetAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>(
    'all'
  )
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')

  useEffect(() => {
    // 模擬 API 請求
    const fetchAppointments = async () => {
      try {
        // 實際專案中，這裡會呼叫 API
        // const response = await fetch('/api/admin/pet-appointments')
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

    fetchAppointments()
  }, [])

  // 處理狀態更新
  const handleStatusUpdate = async (
    appointmentId: number,
    newStatus: AppointmentStatus
  ) => {
    try {
      // 實際專案中，這裡會呼叫 API
      // const response = await fetch(`/api/admin/pet-appointments/${appointmentId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // })

      // 模擬狀態更新
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      )
    } catch (err) {
      console.error('Error updating status:', err)
      setError('更新狀態時發生錯誤')
    }
  }

  // 處理點擊行事曆事件
  const handleEventClick = (info: any) => {
    const appointmentId = parseInt(info.event.id)
    const appointment = appointments.find((app) => app.id === appointmentId)
    if (appointment) {
      setSelectedAppointment(appointment)
      setShowModal(true)
    }
  }

  // 將預約轉換為行事曆事件格式
  const getCalendarEvents = () => {
    return appointments.map((appointment) => {
      // 將日期和時間合併為ISO格式
      const dateTime = `${appointment.appointment_date}T${appointment.appointment_time}:00`

      // 根據狀態設置不同的背景色
      let backgroundColor = '#17a2b8' // 默認藍色
      switch (appointment.status) {
        case 'pending':
          backgroundColor = '#ffc107' // 黃色
          break
        case 'approved':
          backgroundColor = '#28a745' // 綠色
          break
        case 'completed':
          backgroundColor = '#17a2b8' // 藍色
          break
        case 'cancelled':
          backgroundColor = '#dc3545' // 紅色
          break
      }

      return {
        id: appointment.id.toString(),
        title: `${appointment.pet_name} - ${appointment.user_name}`,
        start: dateTime,
        end: new Date(
          new Date(dateTime).getTime() + 60 * 60 * 1000
        ).toISOString(), // 假設每個預約持續1小時
        backgroundColor,
        borderColor: backgroundColor,
        textColor: '#fff',
        extendedProps: {
          status: appointment.status,
          pet_name: appointment.pet_name,
          user_name: appointment.user_name,
        },
      }
    })
  }

  // 篩選預約列表
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 獲取狀態標籤樣式
  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'completed':
        return 'info'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  // 獲取狀態標籤文字
  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return '待審核'
      case 'approved':
        return '已確認'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>載入中，請稍候...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2 className={styles.pageTitle}>
        <FaInfoCircle className="me-2" />
        領養申請管理
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaSearch className="me-2" />
                  搜尋
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="搜尋申請者或寵物名稱"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaFilter className="me-2" />
                  狀態篩選
                </Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as AppointmentStatus | 'all')
                  }
                >
                  <option value="all">全部狀態</option>
                  <option value="pending">待審核</option>
                  <option value="approved">已確認</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* 視圖切換控制 */}
          <div className="d-flex justify-content-end mb-3">
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link
                  active={viewMode === 'table'}
                  onClick={() => setViewMode('table')}
                  className={styles.viewToggle}
                >
                  <FaTable className="me-1" /> 表格視圖
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={viewMode === 'calendar'}
                  onClick={() => setViewMode('calendar')}
                  className={styles.viewToggle}
                >
                  <FaCalendarAlt className="me-1" /> 行事曆視圖
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {/* 表格視圖 */}
          {viewMode === 'table' && (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>申請編號</th>
                  <th>申請者</th>
                  <th>寵物名稱</th>
                  <th>預約時間</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>#{appointment.id}</td>
                    <td>{appointment.user_name}</td>
                    <td>{appointment.pet_name}</td>
                    <td>
                      {appointment.appointment_date}{' '}
                      {appointment.appointment_time}
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowModal(true)
                        }}
                      >
                        <FaEdit className="me-1" />
                        詳情
                      </Button>
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleStatusUpdate(appointment.id, 'approved')
                            }
                          >
                            <FaCheck className="me-1" />
                            確認
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(appointment.id, 'cancelled')
                            }
                          >
                            <FaTimes className="me-1" />
                            拒絕
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* 行事曆視圖 */}
          {viewMode === 'calendar' && (
            <div className={styles.calendarContainer}>
              <FullCalendarComponent
                events={getCalendarEvents()}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 詳情 Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>申請詳情</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <Row>
                <Col md={6}>
                  <h5>申請者資訊</h5>
                  <p>姓名：{selectedAppointment.user_name}</p>
                  <p>成人人數：{selectedAppointment.adult_number}</p>
                  <p>兒童人數：{selectedAppointment.child_number}</p>
                </Col>
                <Col md={6}>
                  <h5>寵物資訊</h5>
                  <p>名稱：{selectedAppointment.pet_name}</p>
                  <p>預約日期：{selectedAppointment.appointment_date}</p>
                  <p>預約時間：{selectedAppointment.appointment_time}</p>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col>
                  <h5>居住環境</h5>
                  <p>住宅類型：{selectedAppointment.house_type}</p>
                  <p>其他寵物：{selectedAppointment.other_pets || '無'}</p>
                  <p>
                    養寵經驗：
                    {selectedAppointment.adopted_experience ? '有' : '無'}
                  </p>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col>
                  <h5>備註</h5>
                  <p>{selectedAppointment.note || '無'}</p>
                </Col>
              </Row>

              {/* 狀態管理按鈕 */}
              {selectedAppointment.status === 'pending' && (
                <div className="mt-3 d-flex justify-content-end gap-2">
                  <Button
                    variant="success"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'approved')
                      setShowModal(false)
                    }}
                  >
                    <FaCheck className="me-1" />
                    確認預約
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'cancelled')
                      setShowModal(false)
                    }}
                  >
                    <FaTimes className="me-1" />
                    拒絕預約
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'approved' && (
                <div className="mt-3 d-flex justify-content-end">
                  <Button
                    variant="info"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'completed')
                      setShowModal(false)
                    }}
                  >
                    <FaCheck className="me-1" />
                    標記為已完成
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

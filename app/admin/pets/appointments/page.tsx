'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
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
import DataTable from '@/app/admin/_components/DataTable'
import type { Column } from '@/app/admin/_components/DataTable'
import { fetchApi } from '@/app/admin/_lib/api'
import { useToast } from '@/app/admin/_components/Toast'

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
  other_pets: string | null
  note: string | null
  store_id: number
  created_at: string
  updated_at: string
}

// 定義表格列
const columns: Column[] = [
  {
    key: 'id',
    label: '申請編號',
    sortable: true,
    render: (value) => `#${value}`,
  },
  {
    key: 'user_name',
    label: '申請者',
    sortable: true,
  },
  {
    key: 'pet_name',
    label: '寵物名稱',
    sortable: true,
  },
  {
    key: 'appointment_date',
    label: '預約時間',
    sortable: true,
    render: (_, row) => `${row.appointment_date} ${row.appointment_time}`,
  },
  {
    key: 'status',
    label: '狀態',
    sortable: true,
    render: (value: AppointmentStatus) => {
      const variants = {
        pending: 'warning',
        approved: 'success',
        completed: 'info',
        cancelled: 'danger',
      }
      const labels = {
        pending: '待審核',
        approved: '已確認',
        completed: '已完成',
        cancelled: '已取消',
      }
      return <Badge bg={variants[value]}>{labels[value]}</Badge>
    },
  },
  {
    key: 'actions',
    label: '操作',
    render: (_, row) => (
      <div>
        <Button
          variant="outline-primary"
          size="sm"
          className="me-2"
          onClick={() => {
            // 處理詳情按鈕點擊
          }}
        >
          <FaEdit className="me-1" />
          詳情
        </Button>
        {row.status === 'pending' && (
          <>
            <Button
              variant="outline-success"
              size="sm"
              className="me-2"
              onClick={() => {
                // 處理確認按鈕點擊
              }}
            >
              <FaCheck className="me-1" />
              確認
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                // 處理拒絕按鈕點擊
              }}
            >
              <FaTimes className="me-1" />
              拒絕
            </Button>
          </>
        )}
      </div>
    ),
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
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetchApi('/api/admin/pets/appointments')

        // 檢查回應格式
        if (response.success && response.data && Array.isArray(response.data)) {
          setAppointments(response.data)
        } else if (Array.isArray(response.data)) {
          setAppointments(response.data)
        } else if (Array.isArray(response)) {
          setAppointments(response)
        } else {
          console.error('返回的數據格式不正確:', response)
          throw new Error('獲取預約資料失敗：數據格式錯誤')
        }
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setError(err instanceof Error ? err.message : '獲取預約資料時發生錯誤')
      } finally {
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
      console.log(
        `Updating appointment ${appointmentId} to status: ${newStatus}`
      )

      const response = await fetchApi(
        `/api/admin/pets/appointments/${appointmentId}`,
        {
          method: 'PUT',
          body: { status: newStatus },
        }
      )

      console.log('Status update response:', response)

      if (response.success) {
        // 更新本地狀態
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, status: newStatus } : app
          )
        )
        setError('')
        showToast('success', '成功', '預約狀態更新成功！')
      } else {
        throw new Error(response.message || '更新狀態失敗')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err instanceof Error ? err.message : '更新狀態時發生錯誤')
      showToast(
        'error',
        '錯誤',
        err instanceof Error ? err.message : '更新狀態時發生錯誤'
      )
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
      const dateTime = `${appointment.appointment_date}T${appointment.appointment_time}:00`
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
        ).toISOString(),
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

  // 處理排序
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 處理分頁
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 篩選和排序後的數據
  const filteredAndSortedAppointments = useMemo(() => {
    let result = [...appointments]

    // 搜尋過濾
    if (searchTerm) {
      result = result.filter(
        (appointment) =>
          appointment.user_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 狀態過濾
    if (statusFilter !== 'all') {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      )
    }

    // 排序
    if (sortConfig && sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Appointment] ?? ''
        const bValue = b[sortConfig.key as keyof Appointment] ?? ''

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [appointments, searchTerm, statusFilter, sortConfig])

  // 分頁數據
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedAppointments.slice(
      startIndex,
      startIndex + itemsPerPage
    )
  }, [filteredAndSortedAppointments, currentPage, itemsPerPage])

  // 更新表格列定義，添加排序和點擊處理
  const updatedColumns = useMemo(() => {
    return columns.map((column) => {
      if (column.sortable) {
        return {
          ...column,
          onSort: () => handleSort(column.key),
          sortDirection:
            sortConfig?.key === column.key ? sortConfig.direction : null,
        }
      }
      return column
    })
  }, [sortConfig])

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

  // 處理批量操作
  const handleBatchAction = async (
    action: string,
    selectedRows: Appointment[]
  ) => {
    if (!selectedRows.length) {
      setError('請先選擇要操作的預約')
      showToast('warning', '注意', '請先選擇要操作的預約')
      return
    }

    try {
      const promises = selectedRows.map((row) =>
        handleStatusUpdate(row.id, action as AppointmentStatus)
      )
      await Promise.all(promises)
      showToast(
        'success',
        '成功',
        `已成功批量處理 ${selectedRows.length} 筆預約`
      )
    } catch (err) {
      console.error('批量操作失敗:', err)
      setError('批量操作失敗，請稍後再試')
      showToast('error', '錯誤', '批量操作失敗，請稍後再試')
    }
  }

  // 定義批量操作按鈕
  const batchActions = [
    {
      label: '批量確認',
      icon: <FaCheck />,
      onClick: (selectedRows: Appointment[]) =>
        handleBatchAction('approved', selectedRows),
      variant: 'success',
    },
    {
      label: '批量拒絕',
      icon: <FaTimes />,
      onClick: (selectedRows: Appointment[]) =>
        handleBatchAction('cancelled', selectedRows),
      variant: 'danger',
    },
  ]

  // 定義搜尋欄位
  const searchKeys = ['user_name', 'pet_name']

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
            <DataTable
              columns={columns}
              data={appointments}
              loading={loading}
              searchable={true}
              searchKeys={searchKeys}
              onRowClick={(row) => {
                setSelectedAppointment(row as Appointment)
                setShowModal(true)
              }}
              selectable={true}
              batchActions={batchActions}
              itemsPerPage={10}
              pageSizeOptions={[10, 20, 50, 100]}
            />
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

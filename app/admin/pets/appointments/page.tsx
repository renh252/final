'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Form,
  Alert,
} from 'react-bootstrap'
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
} from 'react-icons/fa'
import AdminPageLayout from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import {
  ConfirmProvider,
  useConfirm,
} from '@/app/admin/_components/ConfirmDialog'
import { ToastProvider, useToast } from '@/app/admin/_components/Toast'
import AdminBreadcrumb from '@/app/admin/_components/breadcrumb'
import { withAuth } from '@/app/admin/_hooks/useAuth'
import { fetchApi } from '@/app/admin/_lib/api'
import { formatDate } from '@/app/admin/_lib/utils'

// 定義預約狀態類型
type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

// 定義預約數據結構
interface Appointment {
  id: number
  pet_name: string
  user_name: string
  user_email: string
  appointment_date: string
  created_at: string
  status: AppointmentStatus
  notes?: string
  type: string
}

const PetAppointmentsPage = () => {
  // 使用確認對話框和通知
  const { confirm } = useConfirm()
  const { showToast } = useToast()

  // 狀態設定
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null)

  // 篩選狀態
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  // 獲取預約資料
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetchApi('/api/admin/pets/appointments')
      if (response.success) {
        setAppointments(response.data)
        setFilteredAppointments(response.data)
      } else {
        setError(response.message || '獲取預約資料失敗')
      }
    } catch (err) {
      setError('獲取預約資料時發生錯誤')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    fetchAppointments()
  }, [])

  // 篩選預約
  useEffect(() => {
    let filtered = [...appointments]

    // 狀態篩選
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // 搜尋篩選
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.user_name?.toLowerCase().includes(term) ||
          app.pet_name?.toLowerCase().includes(term) ||
          app.id?.toString().includes(term)
      )
    }

    // 日期範圍篩選
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate)
      const end = new Date(dateRange.endDate)
      end.setHours(23, 59, 59) // 設置為當天結束時間

      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date)
        return appDate >= start && appDate <= end
      })
    }

    setFilteredAppointments(filtered)
  }, [appointments, statusFilter, searchTerm, dateRange])

  // 處理更新預約狀態
  const handleUpdateStatus = async (
    id: number,
    newStatus: AppointmentStatus
  ) => {
    try {
      const response = await fetchApi(`/api/admin/pets/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.success) {
        // 更新本地狀態
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        )

        showToast(
          'success',
          '狀態已更新',
          `預約 #${id} 狀態已更新為 ${newStatus}`
        )
      } else {
        showToast('error', '更新失敗', response.message || '無法更新預約狀態')
      }
    } catch (err) {
      console.error('Error updating appointment status:', err)
      showToast('error', '更新失敗', '更新預約狀態時發生錯誤')
    }
  }

  // 處理刪除預約
  const handleDelete = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    confirm({
      title: '確認刪除',
      message: `確定要刪除 ${appointment.pet_name} 的預約嗎？此操作無法恢復。`,
      onConfirm: () => confirmDelete(appointment.id),
      type: 'danger',
      confirmText: '刪除',
    })
  }

  // 確認刪除預約
  const confirmDelete = async (id: number) => {
    try {
      const response = await fetchApi(`/api/admin/pets/appointments/${id}`, {
        method: 'DELETE',
      })

      if (response.success) {
        // 更新本地狀態
        setAppointments((prev) => prev.filter((app) => app.id !== id))

        showToast('success', '刪除成功', `預約 #${id} 已成功刪除`)
      } else {
        showToast('error', '刪除失敗', response.message || '無法刪除預約')
      }
    } catch (err) {
      console.error('Error deleting appointment:', err)
      showToast('error', '刪除失敗', '刪除預約時發生錯誤')
    } finally {
      setCurrentAppointment(null)
    }
  }

  // 渲染狀態標籤
  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">待審核</Badge>
      case 'approved':
        return <Badge bg="success">已核准</Badge>
      case 'completed':
        return <Badge bg="info">已完成</Badge>
      case 'cancelled':
        return <Badge bg="danger">已取消</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  // 表格列定義
  const columns = [
    {
      key: 'id',
      label: '預約 ID',
      render: (value: number, row: Appointment) => <span>#{value}</span>,
    },
    {
      key: 'pet_name',
      label: '寵物名稱',
      render: (value: string, row: Appointment) => (
        <span className="fw-bold">{value}</span>
      ),
    },
    {
      key: 'user_name',
      label: '申請會員',
      render: (value: string, row: Appointment) => (
        <div>
          <div>{value}</div>
          <small className="text-muted">{row.user_email}</small>
        </div>
      ),
    },
    {
      key: 'appointment_date',
      label: '預約日期',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'status',
      label: '狀態',
      render: (value: AppointmentStatus) => renderStatusBadge(value),
    },
    {
      key: 'type',
      label: '預約類型',
    },
    {
      key: 'created_at',
      label: '建立時間',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      label: '操作',
      render: (value: any, row: Appointment) => (
        <div className="d-flex gap-2">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleUpdateStatus(row.id, 'approved')}
                title="核准預約"
              >
                <FaCheck />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                title="拒絕預約"
              >
                <FaTimes />
              </Button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              variant="info"
              onClick={() => handleUpdateStatus(row.id, 'completed')}
              title="標記為已完成"
            >
              <FaCheck />
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row)}
            title="刪除預約"
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ConfirmProvider>
      <ToastProvider>
        <AdminPageLayout
          title="寵物預約管理"
          stats={[
            {
              title: '待審核預約',
              count: appointments.filter((a) => a.status === 'pending').length,
              color: 'warning',
              icon: <FaCalendarAlt size={24} />,
            },
            {
              title: '已核准預約',
              count: appointments.filter((a) => a.status === 'approved').length,
              color: 'success',
              icon: <FaCheck size={24} />,
            },
            {
              title: '已完成預約',
              count: appointments.filter((a) => a.status === 'completed')
                .length,
              color: 'info',
              icon: <FaCheck size={24} />,
            },
            {
              title: '已取消預約',
              count: appointments.filter((a) => a.status === 'cancelled')
                .length,
              color: 'danger',
              icon: <FaTimes size={24} />,
            },
          ]}
        >
          <AdminBreadcrumb />

          {/* 篩選區域 */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>狀態篩選</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">所有狀態</option>
                      <option value="pending">待審核</option>
                      <option value="approved">已核准</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>搜尋</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="搜尋寵物名稱或申請人..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>日期範圍</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            startDate: e.target.value,
                          })
                        }
                      />
                      <Form.Control
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setSearchTerm('')
                    setDateRange({ startDate: '', endDate: '' })
                  }}
                >
                  重置篩選
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* 顯示錯誤訊息 */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* 預約表格 */}
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">載入預約資料中...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <Alert variant="info">
                  <div className="text-center py-3">
                    <p className="mb-0">沒有符合條件的預約資料</p>
                  </div>
                </Alert>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredAppointments}
                  loading={loading}
                  searchable={false}
                />
              )}
            </Card.Body>
          </Card>
        </AdminPageLayout>
      </ToastProvider>
    </ConfirmProvider>
  )
}

export default withAuth(PetAppointmentsPage, 'pets:appointments:read')

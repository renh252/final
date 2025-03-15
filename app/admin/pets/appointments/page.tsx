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
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog'
import Toast from '@/app/admin/_components/Toast'
import Breadcrumb from '@/app/admin/_components/breadcrumb'
import withAuth from '@/app/admin/_hoc/withAuth'
import { fetchWithAuth } from '@/app/admin/_lib/fetch'
import { formatDate } from '@/app/admin/_lib/utils'

const PetAppointmentsPage = () => {
  // 狀態設定
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<any>(null)
  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: '',
    variant: '',
  })

  // 篩選狀態
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  // 獲取預約資料
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth('/api/admin/pets/appointments')
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
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/admin/pets/appointments/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.success) {
        // 更新本地狀態
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        )

        setToast({
          show: true,
          title: '狀態已更新',
          message: `預約 #${id} 狀態已更新為 ${newStatus}`,
          variant: 'success',
        })
      } else {
        setToast({
          show: true,
          title: '更新失敗',
          message: response.message || '無法更新預約狀態',
          variant: 'danger',
        })
      }
    } catch (err) {
      console.error('Error updating appointment status:', err)
      setToast({
        show: true,
        title: '更新失敗',
        message: '更新預約狀態時發生錯誤',
        variant: 'danger',
      })
    }
  }

  // 處理刪除預約
  const handleDelete = (appointment: any) => {
    setCurrentAppointment(appointment)
    setShowDeleteDialog(true)
  }

  // 確認刪除預約
  const confirmDelete = async () => {
    if (!currentAppointment) return

    try {
      const response = await fetchWithAuth(
        `/api/admin/pets/appointments/${currentAppointment.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.success) {
        // 更新本地狀態
        setAppointments((prev) =>
          prev.filter((app) => app.id !== currentAppointment.id)
        )

        setToast({
          show: true,
          title: '刪除成功',
          message: `預約 #${currentAppointment.id} 已成功刪除`,
          variant: 'success',
        })
      } else {
        setToast({
          show: true,
          title: '刪除失敗',
          message: response.message || '無法刪除預約',
          variant: 'danger',
        })
      }
    } catch (err) {
      console.error('Error deleting appointment:', err)
      setToast({
        show: true,
        title: '刪除失敗',
        message: '刪除預約時發生錯誤',
        variant: 'danger',
      })
    } finally {
      setShowDeleteDialog(false)
      setCurrentAppointment(null)
    }
  }

  // 渲染狀態標籤
  const renderStatusBadge = (status: string) => {
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
      header: '預約 ID',
      accessor: 'id',
      cell: (row: any) => <span>#{row.id}</span>,
    },
    {
      header: '寵物名稱',
      accessor: 'pet_name',
      cell: (row: any) => <span className="fw-bold">{row.pet_name}</span>,
    },
    {
      header: '申請會員',
      accessor: 'user_name',
      cell: (row: any) => (
        <div>
          <div>{row.user_name}</div>
          <small className="text-muted">{row.user_email}</small>
        </div>
      ),
    },
    {
      header: '預約日期',
      accessor: 'appointment_date',
      cell: (row: any) => formatDate(row.appointment_date),
    },
    {
      header: '預約時間',
      accessor: 'appointment_time',
      cell: (row: any) => row.appointment_time,
    },
    {
      header: '狀態',
      accessor: 'status',
      cell: (row: any) => renderStatusBadge(row.status),
    },
    {
      header: '申請時間',
      accessor: 'created_at',
      cell: (row: any) => formatDate(row.created_at),
    },
    {
      header: '操作',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="d-flex gap-1">
          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdateStatus(row.id, 'approved')}
                title="核准預約"
              >
                <FaCheck />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                title="拒絕預約"
              >
                <FaTimes />
              </Button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              variant="info"
              size="sm"
              onClick={() => handleUpdateStatus(row.id, 'completed')}
              title="標記為已完成"
            >
              <FaCheck />
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
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
    <AdminPageLayout>
      <Container fluid className="py-3">
        <Breadcrumb
          items={[
            { label: '首頁', link: '/admin' },
            { label: '寵物管理', link: '/admin/pets' },
            { label: '預約管理', active: true },
          ]}
        />

        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              寵物預約管理
            </h5>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => fetchAppointments()}
                >
                  重新載入
                </Button>
              </Alert>
            )}

            {/* 篩選控制 */}
            <Row className="mb-3 g-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>預約狀態</Form.Label>
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label>開始日期</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>結束日期</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>搜尋</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="搜尋會員/寵物名稱/ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" className="ms-2">
                      <FaSearch />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">載入預約資料中...</p>
              </div>
            ) : (
              <>
                <p className="mb-3">
                  共 <strong>{filteredAppointments.length}</strong> 筆預約
                  {statusFilter !== 'all' && ` (已篩選: ${statusFilter})`}
                </p>
                <DataTable
                  columns={columns}
                  data={filteredAppointments}
                  pagination
                  sortable
                  emptyMessage="沒有找到預約記錄"
                />
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* 確認刪除對話框 */}
      <ConfirmDialog
        show={showDeleteDialog}
        title="確認刪除"
        message={`確定要刪除預約 #${
          currentAppointment?.id || ''
        }？此操作不能撤銷。`}
        confirmText="確定刪除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setCurrentAppointment(null)
        }}
      />

      {/* 提示訊息 */}
      <Toast
        show={toast.show}
        variant={toast.variant as any}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </AdminPageLayout>
  )
}

export default withAuth(PetAppointmentsPage, 'pets:appointments:read')

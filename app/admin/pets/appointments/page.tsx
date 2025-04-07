'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
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
    render: (_, row) => {

      // 格式化日期和時間
      const formattedDate = formatDate(row.appointment_date)
      const formattedTime = formatTime(row.appointment_time)

      // 返回組合後的值
      return `${formattedDate} ${formattedTime}`.trim()
    },
  },
  {
    key: 'status',
    label: '狀態',
    sortable: true,
    render: (value: AppointmentStatus, row) => {
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

      // 檢查是否過期且狀態為已確認
      const isOverdue = isAppointmentOverdue(row as Appointment)

      return (
        <div>
          <Badge bg={variants[value]}>{labels[value]}</Badge>
          {isOverdue && (
            <Badge bg="danger" className="ms-2">
              已逾期
            </Badge>
          )}
        </div>
      )
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

// 添加日期格式化工具函數
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW')
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  // 如果只有時間 (HH:MM:SS 格式)
  if (timeStr.includes(':') && !timeStr.includes('T')) {
    return timeStr.substring(0, 5) // 只取 HH:MM
  }

  try {
    // 如果是完整的日期時間
    const date = new Date(timeStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (e) {
    console.error('時間格式化錯誤:', e)
    return timeStr.substring(0, 5) // 回退到直接取前 5 個字符
  }
}

const formatDateTime = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return ''

  // 處理完整的ISO日期時間
  if (dateStr.includes('T')) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const result = `${year}/${month}/${day} ${hours}:${minutes}`
    console.log('格式化後 ISO 日期時間:', result)
    return result
  }

  // 如果是分開的日期和時間，確保時間正確處理
  const formattedDate = formatDate(dateStr)

  // 使用 formatTime 處理時間部分
  let formattedTime = ''
  if (timeStr) {
    formattedTime = formatTime(timeStr)
  }

  const result = `${formattedDate} ${formattedTime}`.trim()
  console.log('格式化後日期時間:', result)
  return result
}

// 判斷預約是否已逾期
const isAppointmentOverdue = (appointment) => {
  try {
    if (appointment.status !== 'approved') {
      return false
    }

    const now = new Date()
    let appointmentDate

    // 檢查是否是 ISO 日期時間格式 (2024-12-14T16:00:00.000Z)
    if (
      appointment.appointment_date &&
      appointment.appointment_date.includes('T')
    ) {
      // 直接使用 ISO 格式日期
      appointmentDate = new Date(appointment.appointment_date)
    } else {
      // 解析日期
      const dateParts = appointment.appointment_date.split(/[-/]/).map(Number)

      // 檢查日期部分是否有效
      if (dateParts.length !== 3 || dateParts.some(isNaN)) {
        throw new Error(`無效的日期格式: ${appointment.appointment_date}`)
      }

      const year = dateParts[0]
      const month = dateParts[1] - 1 // JavaScript 月份從 0 開始
      const day = dateParts[2]

      // 解析時間
      let hours = 0
      let minutes = 0

      if (
        appointment.appointment_time &&
        appointment.appointment_time.includes(':')
      ) {
        // 處理時間部分
        const timePart = appointment.appointment_time.trim()
        const timeParts = timePart.split(':').map((part) => part.trim())

        hours = parseInt(timeParts[0], 10) || 0
        minutes = parseInt(timeParts[1], 10) || 0
      }

      // 建立日期物件
      appointmentDate = new Date(year, month, day, hours, minutes)
    }

    // 檢查日期是否有效
    if (isNaN(appointmentDate.getTime())) {
      throw new Error(`建立的日期物件無效: ${appointmentDate}`)
    }

    return appointmentDate < now && appointment.status === 'approved'
  } catch (error) {
    console.error('逾期判斷錯誤:', error, {
      id: appointment.id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
    })
    return false // 出錯時預設為非逾期
  }
}

// 轉換住宅類型的英文為中文
const getHouseTypeLabel = (houseType: string | null): string => {
  if (!houseType) return '未知'

  const houseTypeMap: Record<string, string> = {
    apartment: '公寓',
    house: '獨棟房屋',
    townhouse: '連棟房屋',
    condo: '共有公寓',
    studio: '小型公寓',
    other: '其他',
  }

  return houseTypeMap[houseType] || houseType
}

export default function PetAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | 'all' | 'overdue'
  >('all')
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
  const [scrollPosition, setScrollPosition] = useState(0)

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

  // 記住捲動位置
  const saveScrollPosition = () => {
    setScrollPosition(window.scrollY)
  }

  // 恢復捲動位置
  const restoreScrollPosition = () => {
    setTimeout(() => {
      window.scrollTo(0, scrollPosition)
    }, 10)
  }

  // 處理Modal的開啟與關閉
  const handleOpenModal = (appointment: Appointment) => {
    saveScrollPosition()
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    restoreScrollPosition()
  }

  // 處理點擊行事曆事件
  const handleEventClick = (info: any) => {
    const appointmentId = parseInt(info.event.id, 10)
    const appointment = appointments.find((a) => a.id === appointmentId)
    if (appointment) {
      handleOpenModal(appointment)
    }
  }

  // 將預約轉換為行事曆事件格式
  const getCalendarEvents = () => {
    return filteredAndSortedAppointments.map((appointment) => {
      try {
        let appointmentDate: Date

        // 記錄原始時間值以便排錯
        console.log(`行事曆事件 ID ${appointment.id} 原始值:`, {
          date: appointment.appointment_date,
          time: appointment.appointment_time,
        })

        // 檢查是否是 ISO 日期時間格式 (2024-12-14T16:00:00.000Z)
        if (
          appointment.appointment_date &&
          appointment.appointment_date.includes('T')
        ) {
          // 直接使用 ISO 格式日期
          appointmentDate = new Date(appointment.appointment_date)
        } else {
          // 解析日期
          const dateParts = appointment.appointment_date
            .split(/[-/]/)
            .map(Number)

          // 檢查日期部分是否有效
          if (dateParts.length !== 3 || dateParts.some(isNaN)) {
            throw new Error(`無效的日期格式: ${appointment.appointment_date}`)
          }

          const year = dateParts[0]
          const month = dateParts[1] - 1 // JavaScript 月份從 0 開始
          const day = dateParts[2]

          // 解析時間
          let hours = 0
          let minutes = 0

          if (
            appointment.appointment_time &&
            appointment.appointment_time.includes(':')
          ) {
            // 處理時間部分
            const timePart = appointment.appointment_time.trim()
            const timeParts = timePart.split(':').map((part) => part.trim())

            hours = parseInt(timeParts[0], 10) || 0
            minutes = parseInt(timeParts[1], 10) || 0

            console.log(`解析時間值:`, { hours, minutes, timePart, timeParts })
          }

          // 建立日期物件
          appointmentDate = new Date(year, month, day, hours, minutes)
        }

        // 檢查日期是否有效，並確保至少有正確的小時數
        if (isNaN(appointmentDate.getTime())) {
          throw new Error(`建立的日期物件無效: ${appointmentDate}`)
        }

        // 特別檢查是否日期正確但時間是 00:00，嘗試從 appointment_time 再次提取時間
        if (
          appointmentDate.getHours() === 0 &&
          appointmentDate.getMinutes() === 0 &&
          appointment.appointment_time
        ) {
          try {
            const timeMatch = appointment.appointment_time.match(/(\d+):(\d+)/)
            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10) || 0
              const minutes = parseInt(timeMatch[2], 10) || 0

              if (hours > 0 || minutes > 0) {
                console.log(`重新提取時間成功:`, { hours, minutes })
                appointmentDate.setHours(hours, minutes)
              }
            }
          } catch (e) {
            console.error('重新提取時間失敗:', e)
          }
        }

        // 記錄最終解析後的日期和時間
        console.log(`最終行事曆日期時間:`, {
          date: appointmentDate,
          hours: appointmentDate.getHours(),
          minutes: appointmentDate.getMinutes(),
          iso: appointmentDate.toISOString(),
        })

        // 安全地產生 ISO 字串
        let dateTimeISO
        try {
          dateTimeISO = appointmentDate.toISOString()
        } catch (e) {
          console.error('無法轉換為 ISO 日期字串:', e)
          // 使用當前時間作為後備
          dateTimeISO = new Date().toISOString()
        }

        const isOverdue = isAppointmentOverdue(appointment)
        let backgroundColor = '#17a2b8' // 默認藍色

        switch (appointment.status) {
          case 'pending':
            backgroundColor = '#ffc107' // 黃色
            break
          case 'approved':
            backgroundColor = isOverdue ? '#ff9800' : '#28a745' // 過期橙色 : 綠色
            break
          case 'completed':
            backgroundColor = '#17a2b8' // 藍色
            break
          case 'cancelled':
            backgroundColor = '#dc3545' // 紅色
            break
        }

        // 格式化時間顯示
        const timeDisplay = `${String(appointmentDate.getHours()).padStart(
          2,
          '0'
        )}:${String(appointmentDate.getMinutes()).padStart(2, '0')}`

        return {
          id: appointment.id.toString(),
          title: `${timeDisplay} ${appointment.pet_name} - ${
            appointment.user_name
          }${isOverdue ? ' (已逾期)' : ''}`,
          start: dateTimeISO,
          end: new Date(
            appointmentDate.getTime() + 60 * 60 * 1000
          ).toISOString(),
          backgroundColor,
          borderColor: backgroundColor,
          textColor: '#fff',
          extendedProps: {
            status: appointment.status,
            pet_name: appointment.pet_name,
            user_name: appointment.user_name,
            isOverdue: isOverdue,
            originalDate: appointment.appointment_date,
            originalTime: appointment.appointment_time,
          },
        }
      } catch (error) {
        console.error('行事曆事件日期解析錯誤:', error, {
          id: appointment.id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
        })

        // 提供一個備用日期，以防解析失敗
        const fallbackDate = new Date()
        return {
          id: appointment.id.toString(),
          title: `${appointment.pet_name} - ${appointment.user_name} (日期格式錯誤)`,
          start: fallbackDate.toISOString(),
          end: new Date(fallbackDate.getTime() + 60 * 60 * 1000).toISOString(),
          backgroundColor: '#999',
          borderColor: '#999',
          textColor: '#fff',
          extendedProps: {
            status: appointment.status,
            pet_name: appointment.pet_name,
            user_name: appointment.user_name,
            isOverdue: false,
            originalDate: appointment.appointment_date,
            originalTime: appointment.appointment_time,
          },
        }
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
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase().trim()
      console.log('搜尋關鍵字:', searchTermLower)

      result = result.filter(
        (appointment) =>
          appointment.user_name?.toLowerCase().includes(searchTermLower) ||
          appointment.pet_name?.toLowerCase().includes(searchTermLower) ||
          appointment.id.toString().includes(searchTermLower)
      )

      console.log('搜尋後結果數量:', result.length)
    }

    // 狀態過濾
    if (statusFilter === 'overdue') {
      console.log('過濾逾期預約')
      result = result.filter((appointment) => isAppointmentOverdue(appointment))
      console.log('過濾後逾期預約數量:', result.length)
    } else if (statusFilter !== 'all') {
      console.log('過濾狀態:', statusFilter)
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      )
      console.log('過濾後狀態預約數量:', result.length)
    }

    // 排序
    if (sortConfig && sortConfig.key) {
      console.log('執行排序:', sortConfig)
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Appointment]
        let bValue: any = b[sortConfig.key as keyof Appointment]

        // 特殊處理日期和時間欄位
        if (sortConfig.key === 'appointment_date') {
          // 組合日期和時間進行排序
          const aDate = new Date(
            `${a.appointment_date}T${a.appointment_time || '00:00:00'}`
          )
          const bDate = new Date(
            `${b.appointment_date}T${b.appointment_time || '00:00:00'}`
          )

          aValue = aDate.getTime()
          bValue = bDate.getTime()
        }

        // 處理可能的 null 或 undefined 值
        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''

        // 執行比較
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
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="搜尋申請者或寵物名稱"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      // 每次搜尋變更時重置頁碼
                      setCurrentPage(1)
                    }}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      className="ms-2"
                      onClick={() => setSearchTerm('')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaFilter className="me-2" />
                  狀態篩選
                </Form.Label>
                <div className="d-flex">
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(
                        e.target.value as AppointmentStatus | 'all' | 'overdue'
                      )
                      // 每次篩選變更時重置頁碼
                      setCurrentPage(1)
                    }}
                  >
                    <option value="all">全部狀態</option>
                    <option value="pending">待審核</option>
                    <option value="approved">已確認</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                    <option value="overdue">已逾期</option>
                  </Form.Select>
                  {statusFilter !== 'all' && (
                    <Button
                      variant="outline-secondary"
                      className="ms-2"
                      onClick={() => setStatusFilter('all')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* 清除所有篩選按鈕 */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
              >
                <FaTimes className="me-1" /> 清除所有篩選
              </Button>
            </div>
          )}

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
              data={filteredAndSortedAppointments}
              loading={loading}
              searchable={false}
              onRowClick={(row) => handleOpenModal(row as Appointment)}
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
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
                  <p>
                    預約日期：{formatDate(selectedAppointment.appointment_date)}
                  </p>
                  <p>
                    預約時間：{formatTime(selectedAppointment.appointment_time)}
                  </p>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col>
                  <h5>居住環境</h5>
                  <p>
                    住宅類型：
                    {getHouseTypeLabel(selectedAppointment.house_type)}
                  </p>
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

              <hr />
              <Row>
                <Col>
                  <h5>系統資訊</h5>
                  <p>
                    預約建立時間：
                    {formatDateTime(selectedAppointment.created_at)}
                  </p>
                  <p>
                    最後更新時間：
                    {formatDateTime(selectedAppointment.updated_at)}
                  </p>
                  <p>
                    預約狀態：
                    <Badge
                      bg={getStatusBadgeVariant(selectedAppointment.status)}
                    >
                      {getStatusLabel(selectedAppointment.status)}
                    </Badge>
                  </p>
                </Col>
              </Row>

              {/* 狀態管理按鈕 */}
              {selectedAppointment.status === 'pending' && (
                <div className="mt-3 d-flex justify-content-end gap-2">
                  <Button
                    variant="success"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'approved')
                      handleCloseModal()
                    }}
                  >
                    <FaCheck className="me-1" />
                    確認預約
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'cancelled')
                      handleCloseModal()
                    }}
                  >
                    <FaTimes className="me-1" />
                    拒絕預約
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'approved' && (
                <div className="mt-3 d-flex justify-content-end gap-2">
                  <Button
                    variant="info"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'completed')
                      handleCloseModal()
                    }}
                  >
                    <FaCheck className="me-1" />
                    標記為已完成
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'cancelled')
                      handleCloseModal()
                    }}
                  >
                    <FaTimes className="me-1" />
                    取消預約
                  </Button>
                </div>
              )}

              {/* 在 Modal 中顯示逾期警告 */}
              {isAppointmentOverdue(selectedAppointment) && (
                <Alert variant="danger" className="mt-3 mb-3">
                  <FaInfoCircle className="me-2" />
                  此預約已過期但尚未完成或取消。請處理此預約的最終狀態。
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

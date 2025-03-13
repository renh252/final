'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Badge, Form, Alert } from 'react-bootstrap'
import { Eye, FileText, Package, DollarSign, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import { useToast } from '@/app/admin/_components/Toast'
import { useTheme } from '@/app/admin/ThemeContext'
import { useAdmin } from '@/app/admin/AdminContext'
import Cookies from 'js-cookie'

// 訂單狀態選項
const ORDER_STATUS_OPTIONS = [
  { value: '待出貨', label: '待出貨', color: 'warning' },
  { value: '已出貨', label: '已出貨', color: 'primary' },
  { value: '已完成', label: '已完成', color: 'success' },
  { value: '已取消', label: '已取消', color: 'danger' },
]

// 付款狀態選項
const PAYMENT_STATUS_OPTIONS = [
  { value: '未付款', label: '未付款', color: 'warning' },
  { value: '已付款', label: '已付款', color: 'success' },
]

// 模擬訂單數據
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customer_name: '王小明',
    customer_email: 'wang@example.com',
    order_date: '2023-03-15',
    total_amount: 1250,
    items_count: 3,
    status: 'pending',
    payment_status: 'pending',
  },
  {
    id: 'ORD-002',
    customer_name: '李小花',
    customer_email: 'lee@example.com',
    order_date: '2023-03-14',
    total_amount: 850,
    items_count: 2,
    status: 'processing',
    payment_status: 'paid',
  },
  {
    id: 'ORD-003',
    customer_name: '張大山',
    customer_email: 'chang@example.com',
    order_date: '2023-03-12',
    total_amount: 1500,
    items_count: 4,
    status: 'shipped',
    payment_status: 'paid',
  },
  {
    id: 'ORD-004',
    customer_name: '陳小華',
    customer_email: 'chen@example.com',
    order_date: '2023-03-10',
    total_amount: 650,
    items_count: 1,
    status: 'delivered',
    payment_status: 'paid',
  },
  {
    id: 'ORD-005',
    customer_name: '林小玲',
    customer_email: 'lin@example.com',
    order_date: '2023-03-08',
    total_amount: 1100,
    items_count: 2,
    status: 'cancelled',
    payment_status: 'refunded',
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const { isDarkMode } = useTheme()
  const { admin, hasPermission, checkAuth } = useAdmin()
  const router = useRouter()

  // 檢查權限
  useEffect(() => {
    const checkAccess = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }

      if (!hasPermission('orders.view')) {
        showToast('error', '權限不足', '您沒有權限訪問訂單管理頁面')
        router.push('/admin')
        return
      }
    }

    checkAccess()
  }, [checkAuth, hasPermission, router, showToast])

  // 獲取訂單數據
  useEffect(() => {
    if (admin && hasPermission('orders.view')) {
      fetchOrders()
    }
  }, [admin, hasPermission])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get('admin_token')
      if (!token) {
        throw new Error('未登入或登入狀態已過期')
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '獲取訂單列表失敗')
      }

      setOrders(data.orders)
    } catch (err) {
      console.error('獲取訂單列表失敗:', err)
      setError(err instanceof Error ? err.message : '獲取訂單列表失敗')
      showToast('error', '錯誤', '獲取訂單列表失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 表格列定義
  const columns = useMemo(
    () => [
      { key: 'order_id', label: '訂單編號', sortable: true },
      { key: 'recipient_name', label: '收件人姓名', sortable: true },
      { key: 'created_at', label: '訂單日期', sortable: true },
      {
        key: 'total_price',
        label: '訂單金額',
        sortable: true,
        render: (value: number) => `NT$ ${value.toLocaleString()}`,
      },
      { key: 'items_count', label: '商品數量', sortable: true },
      {
        key: 'order_status',
        label: '訂單狀態',
        sortable: true,
        filterable: true,
        filterOptions: ORDER_STATUS_OPTIONS,
        render: (value: string) => {
          const status = ORDER_STATUS_OPTIONS.find((s) => s.value === value)
          return status ? (
            <Badge bg={status.color}>{status.label}</Badge>
          ) : (
            <Badge bg="secondary">未知</Badge>
          )
        },
      },
      {
        key: 'payment_status',
        label: '付款狀態',
        sortable: true,
        filterable: true,
        filterOptions: PAYMENT_STATUS_OPTIONS,
        render: (value: string) => {
          const status = PAYMENT_STATUS_OPTIONS.find((s) => s.value === value)
          return status ? (
            <Badge bg={status.color}>{status.label}</Badge>
          ) : (
            <Badge bg="secondary">未知</Badge>
          )
        },
      },
    ],
    []
  )

  // 訂單統計數據
  const orderStats = [
    {
      title: '待出貨訂單',
      count: orders.filter((o) => o.order_status === '待出貨').length,
      color: 'warning',
      icon: <FileText size={24} />,
    },
    {
      title: '已出貨訂單',
      count: orders.filter((o) => o.order_status === '已出貨').length,
      color: 'info',
      icon: <Package size={24} />,
    },
    {
      title: '已完成訂單',
      count: orders.filter((o) => o.order_status === '已完成').length,
      color: 'primary',
      icon: <Truck size={24} />,
    },
    {
      title: '本月營收',
      count: `NT$ ${orders
        .filter(
          (o) =>
            new Date(o.created_at).getMonth() === new Date().getMonth() &&
            o.payment_status === '已付款'
        )
        .reduce((sum, o) => sum + o.total_price, 0)
        .toLocaleString()}`,
      color: 'success',
      icon: <DollarSign size={24} />,
    },
  ]

  // 處理查看訂單詳情
  const handleViewOrder = (order: any) => {
    if (!hasPermission('orders.view')) {
      showToast('error', '權限不足', '您沒有權限查看訂單詳情')
      return
    }
    router.push(`/admin/shop/orders/${order.order_id}`)
  }

  // 處理更新訂單狀態
  const handleUpdateStatus = async (order: any, newStatus: string) => {
    if (!hasPermission('orders.edit')) {
      showToast('error', '權限不足', '您沒有權限更新訂單狀態')
      return
    }

    try {
      const token = Cookies.get('admin_token')
      if (!token) {
        throw new Error('未登入或登入狀態已過期')
      }

      const response = await fetch(`/api/admin/orders/${order.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新訂單狀態失敗')
      }

      // 更新本地狀態
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id ? { ...o, order_status: newStatus } : o
        )
      )

      const statusLabel = ORDER_STATUS_OPTIONS.find(
        (s) => s.value === newStatus
      )?.label
      showToast(
        'success',
        '狀態更新',
        `訂單 ${order.order_id} 狀態已更新為 ${statusLabel}`
      )
    } catch (err) {
      console.error('更新訂單狀態失敗:', err)
      showToast('error', '錯誤', '更新訂單狀態失敗，請稍後再試')
    }
  }

  // 渲染操作按鈕
  const renderActions = (order: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleViewOrder(order)}
        title="查看訂單詳情"
      >
        <Eye size={16} />
      </Button>
      <Form.Select
        size="sm"
        style={{ width: '120px' }}
        value={order.order_status}
        onChange={(e) => handleUpdateStatus(order, e.target.value)}
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </div>
  )

  return (
    <AdminPageLayout
      title="訂單管理"
      description="查看和處理客戶訂單，更新訂單狀態"
      breadcrumbs={[
        { label: '管理區', href: '/admin' },
        { label: '商城管理', href: '/admin/shop' },
        { label: '訂單管理', href: '/admin/shop/orders' },
      ]}
      stats={orderStats}
    >
      <AdminSection title="訂單列表">
        <AdminCard>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <DataTable
              columns={columns}
              data={orders}
              loading={loading}
              searchable={true}
              searchKeys={['order_id', 'recipient_name', 'recipient_email']}
              actions={renderActions}
              onRowClick={handleViewOrder}
              advancedFiltering={true}
              isDarkMode={isDarkMode}
            />
          )}
        </AdminCard>
      </AdminSection>
    </AdminPageLayout>
  )
}

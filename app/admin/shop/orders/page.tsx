'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Badge, Form } from 'react-bootstrap'
import { Eye, FileText, Package, DollarSign, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import { useToast } from '@/app/admin/_components/Toast'
import { useTheme } from '@/app/admin/ThemeContext'

// 訂單狀態選項
const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: '待處理', color: 'warning' },
  { value: 'processing', label: '處理中', color: 'info' },
  { value: 'shipped', label: '已出貨', color: 'primary' },
  { value: 'delivered', label: '已送達', color: 'success' },
  { value: 'cancelled', label: '已取消', color: 'danger' },
  { value: 'refunded', label: '已退款', color: 'secondary' },
]

// 付款狀態選項
const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: '待付款', color: 'warning' },
  { value: 'paid', label: '已付款', color: 'success' },
  { value: 'failed', label: '付款失敗', color: 'danger' },
  { value: 'refunded', label: '已退款', color: 'info' },
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
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const { isDarkMode } = useTheme()
  const router = useRouter()

  // 獲取訂單數據
  useEffect(() => {
    // 這裡可以實現從API獲取訂單數據的邏輯
    // 目前使用模擬數據
  }, [])

  // 處理查看訂單詳情
  const handleViewOrder = (order: any) => {
    router.push(`/admin/shop/orders/${order.id}`)
  }

  // 處理更新訂單狀態
  const handleUpdateStatus = (order: any, newStatus: string) => {
    // 這裡可以實現更新訂單狀態的API調用
    // 目前使用模擬數據更新
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: newStatus } : o
      )
    )
    
    const statusLabel = ORDER_STATUS_OPTIONS.find(s => s.value === newStatus)?.label
    showToast('success', '狀態更新', `訂單 ${order.id} 狀態已更新為 ${statusLabel}`)
  }

  // 表格列定義
  const columns = useMemo(
    () => [
      { key: 'id', label: '訂單編號', sortable: true },
      { key: 'customer_name', label: '客戶姓名', sortable: true },
      { key: 'order_date', label: '訂單日期', sortable: true },
      { 
        key: 'total_amount', 
        label: '訂單金額', 
        sortable: true,
        render: (value: number) => `NT$ ${value.toLocaleString()}`
      },
      { key: 'items_count', label: '商品數量', sortable: true },
      {
        key: 'status',
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
      title: '待處理訂單',
      count: orders.filter((o) => o.status === 'pending').length,
      color: 'warning',
      icon: <FileText size={24} />,
    },
    {
      title: '處理中訂單',
      count: orders.filter((o) => o.status === 'processing').length,
      color: 'info',
      icon: <Package size={24} />,
    },
    {
      title: '已出貨訂單',
      count: orders.filter((o) => o.status === 'shipped').length,
      color: 'primary',
      icon: <Truck size={24} />,
    },
    {
      title: '本月營收',
      count: `NT$ ${orders
        .filter(
          (o) =>
            new Date(o.order_date).getMonth() === new Date().getMonth() &&
            o.payment_status === 'paid'
        )
        .reduce((sum, o) => sum + o.total_amount, 0)
        .toLocaleString()}`,
      color: 'success',
      icon: <DollarSign size={24} />,
    },
  ]

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
        value={order.status}
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
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            searchable={true}
            searchKeys={['id', 'customer_name', 'customer_email']}
            actions={renderActions}
            onRowClick={handleViewOrder}
            advancedFiltering={true}
          />
        </AdminCard>
      </AdminSection>
    </AdminPageLayout>
  )
}

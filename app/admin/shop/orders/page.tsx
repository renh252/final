'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Badge, Form, Alert } from 'react-bootstrap'
import {
  Eye,
  FileText,
  Package,
  DollarSign,
  Truck,
  Edit,
  Trash,
  Download,
  Upload,
} from 'lucide-react'
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
import { fetchApi } from '@/app/admin/_lib/api'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'

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

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const { isDarkMode } = useTheme()
  const { admin, hasPermission, checkAuth } = useAdmin()
  const router = useRouter()
  const { confirm } = useConfirm()

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

      const response = await fetchApi('/api/admin/orders')
      if (response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders)
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取訂單列表時發生錯誤:', error)
      setError(error.message || '獲取訂單列表失敗')
      showToast('error', '錯誤', error.message || '獲取訂單列表失敗')
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
        render: (value: number) =>
          value ? `NT$ ${value.toLocaleString()}` : 'NT$ 0',
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
        .reduce((sum, o) => sum + (o.total_price || 0), 0)
        .toLocaleString()}`,
      color: 'success',
      icon: <DollarSign size={24} />,
    },
  ]

  // 處理刪除訂單
  const handleDelete = (order: any) => {
    confirm({
      title: '刪除訂單',
      message: `確定要刪除訂單「${order.order_id}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          const response = await fetchApi(
            `/api/admin/orders/${order.order_id}`,
            {
              method: 'DELETE',
            }
          )

          if (response.success) {
            // 更新訂單列表
            setOrders(orders.filter((o) => o.order_id !== order.order_id))
            showToast(
              'success',
              '刪除成功',
              `訂單 ${order.order_id} 已成功刪除`
            )
          } else {
            throw new Error(response.message || '刪除訂單失敗')
          }
        } catch (error: any) {
          console.error('刪除訂單時發生錯誤:', error)
          showToast(
            'error',
            '刪除失敗',
            error.message || '無法刪除訂單，請稍後再試'
          )
        }
      },
    })
  }

  // 處理變更訂單狀態
  const handleUpdateStatus = (order: any, newStatus: string) => {
    confirm({
      title: '更新訂單狀態',
      message: `確定要將訂單「${order.order_id}」的狀態更新為「${newStatus}」嗎？`,
      onConfirm: async () => {
        try {
          const response = await fetchApi(
            `/api/admin/orders/${order.order_id}/status`,
            {
              method: 'PUT',
              body: JSON.stringify({ status: newStatus }),
            }
          )

          if (response.success) {
            // 更新訂單列表
            setOrders(
              orders.map((o) =>
                o.order_id === order.order_id
                  ? { ...o, order_status: newStatus }
                  : o
              )
            )

            showToast(
              'success',
              '更新成功',
              `訂單 ${order.order_id} 的狀態已更新為 ${newStatus}`
            )
          } else {
            throw new Error(response.message || '更新訂單狀態失敗')
          }
        } catch (error: any) {
          console.error('更新訂單狀態時發生錯誤:', error)
          showToast(
            'error',
            '更新失敗',
            error.message || '無法更新訂單狀態，請稍後再試'
          )
        }
      },
    })
  }

  // 處理導出
  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      showToast('info', '導出中', '正在準備導出數據...')

      const response = await fetchApi(
        `/api/admin/orders/export?format=${format}`,
        {
          method: 'GET',
        }
      )

      if (response.success) {
        // 創建一個臨時鏈接並點擊它來下載文件
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.setAttribute('download', `orders_export.${format}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast(
          'success',
          '導出成功',
          `已成功導出 ${orders.length} 條訂單記錄`
        )
      } else {
        throw new Error(response.message || '導出失敗')
      }
    } catch (error: any) {
      console.error('導出時發生錯誤:', error)
      showToast(
        'error',
        '導出失敗',
        error.message || '無法導出數據，請稍後再試'
      )
    }
  }

  // 處理查看訂單詳情
  const handleViewDetails = (order: any) => {
    router.push(`/admin/shop/orders/${order.order_id}`)
  }

  // 渲染操作按鈕
  const renderActions = (order: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleViewDetails(order)}
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
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDelete(order)}
        title="刪除訂單"
      >
        <Trash size={16} />
      </Button>
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
              onRowClick={handleViewDetails}
              advancedFiltering={true}
              isDarkMode={isDarkMode}
            />
          )}
        </AdminCard>
      </AdminSection>
    </AdminPageLayout>
  )
}

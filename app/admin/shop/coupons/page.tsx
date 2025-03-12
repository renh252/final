'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Form } from 'react-bootstrap'
import { Plus, Edit, Trash, Ticket, Calendar, DollarSign } from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'

// 優惠券類型選項
const COUPON_TYPE_OPTIONS = [
  { value: 'percentage', label: '百分比折扣' },
  { value: 'fixed', label: '固定金額折扣' },
  { value: 'shipping', label: '免運費' },
]

// 優惠券狀態選項
const COUPON_STATUS_OPTIONS = [
  { value: 'active', label: '啟用中', color: 'success' },
  { value: 'inactive', label: '未啟用', color: 'secondary' },
  { value: 'expired', label: '已過期', color: 'danger' },
]

// 模擬優惠券數據
const MOCK_COUPONS = [
  {
    id: 'WELCOME10',
    name: '新會員歡迎券',
    description: '新會員首次購物可享10%折扣',
    type: 'percentage',
    value: 10,
    min_purchase: 500,
    max_discount: 200,
    start_date: '2023-03-01',
    end_date: '2023-12-31',
    usage_limit: 1000,
    used_count: 125,
    status: 'active',
    created_at: '2023-02-15',
  },
  {
    id: 'SUMMER100',
    name: '夏季促銷券',
    description: '夏季促銷活動，訂單滿1000元折100元',
    type: 'fixed',
    value: 100,
    min_purchase: 1000,
    max_discount: null,
    start_date: '2023-06-01',
    end_date: '2023-08-31',
    usage_limit: 500,
    used_count: 78,
    status: 'active',
    created_at: '2023-05-15',
  },
  {
    id: 'FREESHIP',
    name: '免運費券',
    description: '訂單滿1500元免運費',
    type: 'shipping',
    value: 0,
    min_purchase: 1500,
    max_discount: null,
    start_date: '2023-04-01',
    end_date: '2023-12-31',
    usage_limit: 800,
    used_count: 210,
    status: 'active',
    created_at: '2023-03-20',
  },
  {
    id: 'SPRING20',
    name: '春季特惠券',
    description: '春季特惠活動，全館商品8折',
    type: 'percentage',
    value: 20,
    min_purchase: 0,
    max_discount: 300,
    start_date: '2023-03-01',
    end_date: '2023-05-31',
    usage_limit: 1000,
    used_count: 950,
    status: 'expired',
    created_at: '2023-02-20',
  },
  {
    id: 'VIP200',
    name: 'VIP會員專屬券',
    description: 'VIP會員專屬優惠，訂單滿2000元折200元',
    type: 'fixed',
    value: 200,
    min_purchase: 2000,
    max_discount: null,
    start_date: '2023-07-01',
    end_date: '2023-12-31',
    usage_limit: 300,
    used_count: 45,
    status: 'active',
    created_at: '2023-06-25',
  },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(MOCK_COUPONS)
  const [showModal, setShowModal] = useState(false)
  const [currentCoupon, setCurrentCoupon] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)

  // 獲取優惠券數據
  useEffect(() => {
    // 這裡可以實現從API獲取優惠券數據的邏輯
    // 目前使用模擬數據
  }, [])

  // 處理新增優惠券
  const handleAddCoupon = () => {
    setCurrentCoupon(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯優惠券
  const handleEditCoupon = (coupon: any) => {
    setCurrentCoupon(coupon)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除優惠券
  const handleDeleteCoupon = (coupon: any) => {
    confirm({
      title: '刪除優惠券',
      message: `確定要刪除優惠券 ${coupon.name} (${coupon.id}) 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
        showToast('success', '刪除成功', `優惠券 ${coupon.name} 已成功刪除`)
      },
    })
  }

  // 處理啟用/停用優惠券
  const handleToggleStatus = (coupon: any) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active'

    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: newStatus } : c))
    )

    const statusText = newStatus === 'active' ? '啟用' : '停用'
    showToast('success', '狀態更新', `優惠券 ${coupon.name} 已${statusText}`)
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    // 模擬API請求延遲
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)

    // 驗證日期
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)

    if (endDate < startDate) {
      showToast('error', '日期錯誤', '結束日期不能早於開始日期')
      return
    }

    if (modalMode === 'add') {
      // 檢查優惠券代碼是否已存在
      if (coupons.some((c) => c.id === formData.id)) {
        showToast('error', '代碼重複', '此優惠券代碼已存在')
        return
      }

      // 模擬新增優惠券
      const newCoupon = {
        ...formData,
        used_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      }
      setCoupons((prev) => [...prev, newCoupon])
      showToast('success', '新增成功', `優惠券 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新優惠券
      setCoupons((prev) =>
        prev.map((c) => (c.id === currentCoupon.id ? { ...c, ...formData } : c))
      )
      showToast('success', '更新成功', `優惠券 ${formData.name} 資料已成功更新`)
    }

    setShowModal(false)
  }

  // 表格列定義
  const columns = [
    { key: 'id', label: '優惠券代碼', sortable: true },
    { key: 'name', label: '名稱', sortable: true },
    {
      key: 'type',
      label: '類型',
      sortable: true,
      filterable: true,
      filterOptions: COUPON_TYPE_OPTIONS,
      render: (value: string) => {
        const type = COUPON_TYPE_OPTIONS.find((t) => t.value === value)
        return type ? type.label : value
      },
    },
    {
      key: 'value',
      label: '折扣值',
      sortable: true,
      render: (value: number, row: any) => {
        switch (row.type) {
          case 'percentage':
            return `${value}%`
          case 'fixed':
            return `NT$ ${value}`
          case 'shipping':
            return '免運費'
          default:
            return value
        }
      },
    },
    {
      key: 'min_purchase',
      label: '最低消費',
      sortable: true,
      render: (value: number) => (value > 0 ? `NT$ ${value}` : '無限制'),
    },
    {
      key: 'end_date',
      label: '有效期限',
      sortable: true,
      render: (value: string) => {
        const endDate = new Date(value)
        const today = new Date()
        const isExpired = endDate < today

        return (
          <span className={isExpired ? 'text-danger' : ''}>
            {new Date(value).toLocaleDateString('zh-TW')}
          </span>
        )
      },
    },
    {
      key: 'used_count',
      label: '使用次數',
      sortable: true,
      render: (value: number, row: any) =>
        `${value} / ${row.usage_limit || '∞'}`,
    },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      filterable: true,
      filterOptions: COUPON_STATUS_OPTIONS,
      render: (value: string) => {
        const status = COUPON_STATUS_OPTIONS.find((s) => s.value === value)
        return status ? (
          <Badge bg={status.color}>{status.label}</Badge>
        ) : (
          <Badge bg="secondary">未知</Badge>
        )
      },
    },
  ]

  // 表單欄位定義
  const formFields = [
    {
      name: 'id',
      label: '優惠券代碼',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入優惠券代碼',
      disabled: modalMode === 'edit',
    },
    {
      name: 'name',
      label: '優惠券名稱',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入優惠券名稱',
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea' as const,
      placeholder: '請輸入優惠券描述',
    },
    {
      name: 'type',
      label: '優惠券類型',
      type: 'select' as const,
      required: true,
      options: COUPON_TYPE_OPTIONS,
    },
    {
      name: 'value',
      label: '折扣值',
      type: 'number' as const,
      required: true,
      placeholder: '請輸入折扣值',
      validation: (value: number, formData: any) => {
        if (formData.type === 'percentage' && (value <= 0 || value > 100)) {
          return '百分比折扣必須在1-100之間'
        }
        if (formData.type === 'fixed' && value <= 0) {
          return '固定金額折扣必須大於0'
        }
        return null
      },
    },
    {
      name: 'min_purchase',
      label: '最低消費金額',
      type: 'number' as const,
      placeholder: '請輸入最低消費金額',
      validation: (value: number) => {
        return value < 0 ? '最低消費金額不能為負數' : null
      },
    },
    {
      name: 'max_discount',
      label: '最高折扣金額',
      type: 'number' as const,
      placeholder: '請輸入最高折扣金額 (可選)',
      validation: (value: number) => {
        return value < 0 ? '最高折扣金額不能為負數' : null
      },
    },
    {
      name: 'start_date',
      label: '開始日期',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'end_date',
      label: '結束日期',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'usage_limit',
      label: '使用次數限制',
      type: 'number' as const,
      placeholder: '請輸入使用次數限制 (可選)',
      validation: (value: number) => {
        return value < 0 ? '使用次數限制不能為負數' : null
      },
    },
    {
      name: 'status',
      label: '狀態',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: '啟用' },
        { value: 'inactive', label: '停用' },
      ],
    },
  ]

  // 渲染操作按鈕
  const renderActions = (coupon: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEditCoupon(coupon)}
        title="編輯優惠券"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant={
          coupon.status === 'active' ? 'outline-warning' : 'outline-success'
        }
        size="sm"
        onClick={() => handleToggleStatus(coupon)}
        title={coupon.status === 'active' ? '停用優惠券' : '啟用優惠券'}
      >
        {coupon.status === 'active' ? '停用' : '啟用'}
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteCoupon(coupon)}
        title="刪除優惠券"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  // 優惠券統計數據
  const couponStats = [
    {
      title: '總優惠券數',
      count: coupons.length,
      color: 'primary',
      icon: <Ticket size={24} />,
    },
    {
      title: '啟用中優惠券',
      count: coupons.filter((c) => c.status === 'active').length,
      color: 'success',
      icon: <Ticket size={24} />,
    },
    {
      title: '即將到期',
      count: coupons.filter((c) => {
        const endDate = new Date(c.end_date)
        const today = new Date()
        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return c.status === 'active' && diffDays <= 30 && diffDays > 0
      }).length,
      color: 'warning',
      icon: <Calendar size={24} />,
    },
    {
      title: '已過期',
      count: coupons.filter((c) => c.status === 'expired').length,
      color: 'danger',
      icon: <Calendar size={24} />,
    },
  ]

  return (
    <AdminPageLayout
      title="優惠券管理"
      description="創建和管理優惠券，設定折扣規則"
      breadcrumbs={[
        { label: '管理區', href: '/admin' },
        { label: '商城管理', href: '/admin/shop' },
        { label: '優惠券管理', href: '/admin/shop/coupons' },
      ]}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddCoupon}
          className="d-flex align-items-center"
        >
          <Plus size={16} className="me-1" /> 新增優惠券
        </Button>
      }
      stats={couponStats}
    >
      <AdminSection title="優惠券列表">
        <AdminCard>
          <DataTable
            columns={columns}
            data={coupons}
            loading={loading}
            searchable={true}
            searchKeys={['id', 'name', 'description']}
            actions={renderActions}
            advancedFiltering={true}
          />
        </AdminCard>
      </AdminSection>

      {/* 優惠券表單模態框 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增優惠券' : '編輯優惠券'}
        fields={formFields}
        onSubmit={handleSubmit}
        initialData={currentCoupon}
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </AdminPageLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Form } from 'react-bootstrap'
import {
  Plus,
  Edit,
  Trash,
  Ticket,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import { useAdmin } from '@/app/admin/AdminContext'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/app/admin/_lib/api'

// 折扣類型選項
const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: '百分比折扣' },
  { value: 'fixed', label: '固定金額折扣' },
  { value: 'shipping', label: '免運費' },
  { value: 'bundle', label: '組合優惠' },
]

// 折扣狀態選項
const DISCOUNT_STATUS_OPTIONS = [
  { value: 'active', label: '啟用中', color: 'success' },
  { value: 'inactive', label: '未啟用', color: 'secondary' },
  { value: 'expired', label: '已過期', color: 'danger' },
  { value: 'scheduled', label: '已排程', color: 'info' },
]

// 模擬折扣活動數據
const MOCK_DISCOUNTS = [
  {
    id: 'WELCOME10',
    name: '新會員歡迎活動',
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
    coupon_required: false,
  },
  {
    id: 'SUMMER100',
    name: '夏季促銷活動',
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
    coupon_required: true,
    coupon_code: 'SUMMER100',
  },
  {
    id: 'FREESHIP',
    name: '免運費活動',
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
    coupon_required: false,
  },
  {
    id: 'SPRING20',
    name: '春季特惠活動',
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
    coupon_required: false,
  },
  {
    id: 'BUNDLE3',
    name: '買三送一',
    description: '指定商品買三送一',
    type: 'bundle',
    value: 0,
    min_purchase: 0,
    max_discount: null,
    start_date: '2023-07-01',
    end_date: '2023-12-31',
    usage_limit: 300,
    used_count: 45,
    status: 'active',
    created_at: '2023-06-25',
    coupon_required: false,
    target_products: '1,2,3',
  },
]

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState(MOCK_DISCOUNTS)
  const [showModal, setShowModal] = useState(false)
  const [currentDiscount, setCurrentDiscount] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
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

      if (!hasPermission('shop:promotions:read')) {
        showToast('error', '權限不足', '您沒有權限訪問折扣活動管理頁面')
        router.push('/admin')
        return
      }
    }

    checkAccess()
  }, [checkAuth, hasPermission, router, showToast])

  // 獲取折扣活動數據
  useEffect(() => {
    // 這裡可以實現從API獲取折扣活動數據的邏輯
    // 目前使用模擬數據
  }, [])

  // 處理新增折扣活動
  const handleAddDiscount = () => {
    setCurrentDiscount(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯折扣活動
  const handleEditDiscount = (discount: any) => {
    setCurrentDiscount(discount)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除折扣活動
  const handleDeleteDiscount = (discount: any) => {
    confirm({
      title: '刪除折扣活動',
      message: `確定要刪除折扣活動 ${discount.name} (${discount.id}) 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setDiscounts((prev) => prev.filter((c) => c.id !== discount.id))
        showToast('success', '刪除成功', `折扣活動 ${discount.name} 已成功刪除`)
      },
    })
  }

  // 處理啟用/停用折扣活動
  const handleToggleStatus = (discount: any) => {
    const newStatus = discount.status === 'active' ? 'inactive' : 'active'

    setDiscounts((prev) =>
      prev.map((c) => (c.id === discount.id ? { ...c, status: newStatus } : c))
    )

    const statusText = newStatus === 'active' ? '啟用' : '停用'
    showToast(
      'success',
      '狀態更新',
      `折扣活動 ${discount.name} 已${statusText}`
    )
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
      // 檢查折扣活動代碼是否已存在
      if (
        formData.coupon_required &&
        discounts.some((c) => c.coupon_code === formData.coupon_code)
      ) {
        showToast('error', '代碼重複', '此折扣碼已存在')
        return
      }

      // 模擬新增折扣活動
      const newDiscount = {
        ...formData,
        id: formData.coupon_required
          ? formData.coupon_code
          : `DISC${new Date().getTime()}`,
        used_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      }
      setDiscounts((prev) => [...prev, newDiscount])
      showToast('success', '新增成功', `折扣活動 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新折扣活動
      setDiscounts((prev) =>
        prev.map((c) =>
          c.id === currentDiscount.id ? { ...c, ...formData } : c
        )
      )
      showToast(
        'success',
        '更新成功',
        `折扣活動 ${formData.name} 資料已成功更新`
      )
    }

    setShowModal(false)
  }

  // 表格列定義
  const columns = [
    { key: 'name', label: '活動名稱', sortable: true },
    {
      key: 'coupon_required',
      label: '折扣碼',
      sortable: true,
      render: (value: boolean, row: any) =>
        value ? (
          <Badge bg="info">{row.coupon_code}</Badge>
        ) : (
          <Badge bg="secondary">無需折扣碼</Badge>
        ),
    },
    {
      key: 'type',
      label: '類型',
      sortable: true,
      filterable: true,
      filterOptions: DISCOUNT_TYPE_OPTIONS,
      render: (value: string) => {
        const type = DISCOUNT_TYPE_OPTIONS.find((t) => t.value === value)
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
          case 'bundle':
            return '組合優惠'
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
        const now = new Date()
        return (
          <div className="d-flex align-items-center">
            {endDate.toLocaleDateString()}
            {endDate < now ? (
              <Badge bg="danger" className="ms-2">
                已過期
              </Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      filterable: true,
      filterOptions: DISCOUNT_STATUS_OPTIONS,
      render: (value: string) => {
        const status = DISCOUNT_STATUS_OPTIONS.find((s) => s.value === value)
        return status ? (
          <Badge bg={status.color}>{status.label}</Badge>
        ) : (
          <Badge bg="secondary">未知</Badge>
        )
      },
    },
  ]

  // 渲染操作按鈕
  const renderActions = (discount: any) => (
    <div className="d-flex gap-1">
      <Button
        variant="light"
        size="sm"
        title={discount.status === 'active' ? '停用' : '啟用'}
        onClick={() => handleToggleStatus(discount)}
      >
        {discount.status === 'active' ? (
          <Tag size={16} className="text-danger" />
        ) : (
          <Tag size={16} className="text-success" />
        )}
      </Button>
      <Button
        variant="light"
        size="sm"
        title="編輯"
        onClick={() => handleEditDiscount(discount)}
      >
        <Edit size={16} className="text-primary" />
      </Button>
      <Button
        variant="light"
        size="sm"
        title="刪除"
        onClick={() => handleDeleteDiscount(discount)}
      >
        <Trash size={16} className="text-danger" />
      </Button>
    </div>
  )

  // 活動統計
  const discountStats = [
    {
      title: '啟用中活動',
      count: discounts.filter((c) => c.status === 'active').length,
      color: 'success',
      icon: <Tag size={24} />,
    },
    {
      title: '即將過期活動',
      count: discounts.filter(
        (c) =>
          c.status === 'active' &&
          new Date(c.end_date) > new Date() &&
          new Date(c.end_date) <
            new Date(new Date().setDate(new Date().getDate() + 30))
      ).length,
      color: 'warning',
      icon: <Calendar size={24} />,
    },
    {
      title: '已過期活動',
      count: discounts.filter(
        (c) => c.status === 'expired' || new Date(c.end_date) < new Date()
      ).length,
      color: 'danger',
      icon: <Calendar size={24} />,
    },
    {
      title: '總節省金額',
      count: 'NT$ 125,789',
      color: 'primary',
      icon: <DollarSign size={24} />,
    },
  ]

  // 表單字段定義
  const formFields = [
    {
      name: 'name',
      label: '活動名稱',
      type: 'text',
      placeholder: '請輸入折扣活動名稱',
      required: true,
      value: currentDiscount?.name || '',
    },
    {
      name: 'description',
      label: '活動描述',
      type: 'textarea',
      placeholder: '請輸入活動描述',
      value: currentDiscount?.description || '',
    },
    {
      name: 'type',
      label: '折扣類型',
      type: 'select',
      options: DISCOUNT_TYPE_OPTIONS,
      required: true,
      value: currentDiscount?.type || 'percentage',
    },
    {
      name: 'value',
      label: '折扣值',
      type: 'number',
      placeholder: '請輸入折扣值',
      required: true,
      value: currentDiscount?.value || 0,
      conditional: {
        field: 'type',
        values: ['percentage', 'fixed'],
      },
    },
    {
      name: 'min_purchase',
      label: '最低消費',
      type: 'number',
      placeholder: '請輸入最低消費金額',
      value: currentDiscount?.min_purchase || 0,
    },
    {
      name: 'max_discount',
      label: '最高折扣金額',
      type: 'number',
      placeholder: '請輸入最高折扣金額',
      value: currentDiscount?.max_discount || '',
      conditional: {
        field: 'type',
        values: ['percentage'],
      },
    },
    {
      name: 'coupon_required',
      label: '需要折扣碼',
      type: 'switch',
      value: currentDiscount?.coupon_required || false,
    },
    {
      name: 'coupon_code',
      label: '折扣碼',
      type: 'text',
      placeholder: '請輸入折扣碼',
      value: currentDiscount?.coupon_code || '',
      conditional: {
        field: 'coupon_required',
        values: [true],
      },
      required: {
        dependsOn: 'coupon_required',
        value: true,
      },
    },
    {
      name: 'start_date',
      label: '開始日期',
      type: 'date',
      required: true,
      value:
        currentDiscount?.start_date || new Date().toISOString().split('T')[0],
    },
    {
      name: 'end_date',
      label: '結束日期',
      type: 'date',
      required: true,
      value:
        currentDiscount?.end_date ||
        new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split('T')[0],
    },
    {
      name: 'usage_limit',
      label: '使用次數限制',
      type: 'number',
      placeholder: '請輸入使用次數限制',
      value: currentDiscount?.usage_limit || 0,
    },
    {
      name: 'status',
      label: '活動狀態',
      type: 'select',
      options: DISCOUNT_STATUS_OPTIONS,
      required: true,
      value: currentDiscount?.status || 'inactive',
    },
    {
      name: 'target_products',
      label: '適用商品',
      type: 'text',
      placeholder: '請輸入商品ID，多個以逗號分隔',
      value: currentDiscount?.target_products || '',
      conditional: {
        field: 'type',
        values: ['bundle'],
      },
    },
  ]

  return (
    <AdminPageLayout
      title="折扣活動管理"
      breadcrumb={[{ name: '商城管理' }, { name: '折扣活動管理' }]}
    >
      <div className="mb-4">
        <AdminSection title="活動統計">
          <div className="row">
            {discountStats.map((stat, index) => (
              <div key={index} className="col-md-3 mb-3">
                <AdminCard>
                  <div className="d-flex align-items-center">
                    <div
                      className={`me-3 rounded p-3 bg-${stat.color} bg-opacity-10`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h6 className="mb-0">{stat.title}</h6>
                      <h3 className="mb-0">{stat.count}</h3>
                    </div>
                  </div>
                </AdminCard>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <AdminSection
        title="折扣活動列表"
        action={
          hasPermission('shop:promotions:create') && (
            <Button variant="primary" onClick={handleAddDiscount}>
              <Plus size={16} className="me-1" />
              新增折扣活動
            </Button>
          )
        }
      >
        <DataTable
          columns={columns}
          data={discounts}
          renderActions={renderActions}
          isLoading={loading}
          showSearch
          searchPlaceholder="搜尋活動名稱或折扣碼..."
          searchKeys={['name', 'coupon_code', 'description']}
          sortable
          pageSize={10}
        />
      </AdminSection>

      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增折扣活動' : '編輯折扣活動'}
        fields={formFields}
        onSubmit={handleSubmit}
        isLoading={loading}
        size="lg"
      />
    </AdminPageLayout>
  )
}

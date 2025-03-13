'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Form } from 'react-bootstrap'
import { Plus, Edit, Trash, Tag, FolderTree } from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'

// 模擬分類數據
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: '飼料與食品',
    description: '各種寵物飼料和食品',
    parent_id: null,
    product_count: 25,
    created_at: '2023-01-10',
  },
  {
    id: 2,
    name: '貓咪飼料',
    description: '專為貓咪設計的各種飼料',
    parent_id: 1,
    product_count: 12,
    created_at: '2023-01-12',
  },
  {
    id: 3,
    name: '狗狗飼料',
    description: '專為狗狗設計的各種飼料',
    parent_id: 1,
    product_count: 13,
    created_at: '2023-01-15',
  },
  {
    id: 4,
    name: '玩具',
    description: '各種寵物玩具',
    parent_id: null,
    product_count: 18,
    created_at: '2023-01-20',
  },
  {
    id: 5,
    name: '貓咪玩具',
    description: '專為貓咪設計的玩具',
    parent_id: 4,
    product_count: 8,
    created_at: '2023-01-22',
  },
  {
    id: 6,
    name: '狗狗玩具',
    description: '專為狗狗設計的玩具',
    parent_id: 4,
    product_count: 10,
    created_at: '2023-01-25',
  },
  {
    id: 7,
    name: '美容與清潔',
    description: '寵物美容和清潔用品',
    parent_id: null,
    product_count: 15,
    created_at: '2023-02-01',
  },
  {
    id: 8,
    name: '配件',
    description: '各種寵物配件',
    parent_id: null,
    product_count: 20,
    created_at: '2023-02-10',
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [showModal, setShowModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)

  // 獲取分類數據
  useEffect(() => {
    // 這裡可以實現從API獲取分類數據的邏輯
    // 目前使用模擬數據
  }, [])

  // 處理新增分類
  const handleAddCategory = () => {
    setCurrentCategory(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯分類
  const handleEditCategory = (category: any) => {
    setCurrentCategory(category)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除分類
  const handleDeleteCategory = (category: any) => {
    // 檢查是否有子分類
    const hasChildren = categories.some((c) => c.parent_id === category.id)

    if (hasChildren) {
      showToast('error', '無法刪除', '此分類包含子分類，請先刪除子分類')
      return
    }

    // 檢查是否有商品
    if (category.product_count > 0) {
      showToast('error', '無法刪除', '此分類包含商品，請先移除或更改商品的分類')
      return
    }

    confirm({
      title: '刪除分類',
      message: `確定要刪除分類 ${category.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setCategories((prev) => prev.filter((c) => c.id !== category.id))
        showToast('success', '刪除成功', `分類 ${category.name} 已成功刪除`)
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    // 模擬API請求延遲
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)

    // 檢查循環引用
    if (formData.parent_id) {
      // 不能將自己設為父分類
      if (modalMode === 'edit' && formData.parent_id === currentCategory.id) {
        showToast('error', '無效的父分類', '不能將自己設為父分類')
        return
      }

      // 檢查是否形成循環引用
      const checkCircular = (parentId: number, targetId: number): boolean => {
        if (parentId === targetId) return true

        const children = categories.filter((c) => c.parent_id === parentId)
        return children.some((child) => checkCircular(child.id, targetId))
      }

      if (
        modalMode === 'edit' &&
        checkCircular(currentCategory.id, formData.parent_id)
      ) {
        showToast('error', '無效的父分類', '不能選擇子分類作為父分類')
        return
      }
    }

    if (modalMode === 'add') {
      // 模擬新增分類
      const newCategory = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name: formData.name,
        description: formData.description || '',
        parent_id: formData.parent_id || null,
        product_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      }
      setCategories((prev) => [...prev, newCategory])
      showToast('success', '新增成功', `分類 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新分類
      setCategories((prev) =>
        prev.map((c) =>
          c.id === currentCategory.id
            ? {
                ...c,
                name: formData.name,
                description: formData.description || '',
                parent_id: formData.parent_id || null,
              }
            : c
        )
      )
      showToast('success', '更新成功', `分類 ${formData.name} 資料已成功更新`)
    }

    setShowModal(false)
  }

  // 表格列定義
  const columns = [
    { key: 'name', label: '分類名稱', sortable: true },
    { key: 'description', label: '描述', sortable: true },
    {
      key: 'parent_id',
      label: '父分類',
      sortable: true,
      render: (value: number | null) => {
        if (value === null) return <Badge bg="secondary">無</Badge>
        const parent = categories.find((c) => c.id === value)
        return parent ? parent.name : <Badge bg="danger">未知</Badge>
      },
    },
    {
      key: 'product_count',
      label: '商品數量',
      sortable: true,
      render: (value: number) => (
        <Badge bg={value > 0 ? 'primary' : 'secondary'}>{value}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: '建立日期',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
  ]

  // 表單欄位定義
  const formFields = [
    {
      name: 'name',
      label: '分類名稱',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入分類名稱',
    },
    {
      name: 'description',
      label: '分類描述',
      type: 'textarea' as const,
      placeholder: '請輸入分類描述',
    },
    {
      name: 'parent_id',
      label: '父分類',
      type: 'select' as const,
      options: [
        { value: '', label: '無' },
        ...categories.map((c) => ({
          value: c.id,
          label: c.name,
        })),
      ],
      placeholder: '選擇父分類',
    },
  ]

  // 渲染操作按鈕
  const renderActions = (category: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEditCategory(category)}
        title="編輯分類"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteCategory(category)}
        title="刪除分類"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  // 分類統計數據
  const categoryStats = [
    {
      title: '總分類數',
      count: categories.length,
      color: 'primary',
      icon: <Tag size={24} />,
    },
    {
      title: '主分類數',
      count: categories.filter((c) => c.parent_id === null).length,
      color: 'info',
      icon: <FolderTree size={24} />,
    },
    {
      title: '有商品的分類',
      count: categories.filter((c) => c.product_count > 0).length,
      color: 'success',
      icon: <Tag size={24} />,
    },
  ]

  return (
    <AdminPageLayout
      title="商品分類管理"
      description="管理商品分類，建立分類層級結構"
      breadcrumbs={[
        { label: '管理區', href: '/admin' },
        { label: '商城管理', href: '/admin/shop' },
        { label: '商品分類管理', href: '/admin/shop/categories' },
      ]}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddCategory}
          className="d-flex align-items-center"
        >
          <Plus size={16} className="me-1" /> 新增分類
        </Button>
      }
      stats={categoryStats}
    >
      <AdminSection title="分類列表">
        <AdminCard>
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            searchable={true}
            searchKeys={['name', 'description']}
            actions={renderActions}
          />
        </AdminCard>
      </AdminSection>

      {/* 分類表單模態框 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增分類' : '編輯分類'}
        fields={formFields}
        onSubmit={handleSubmit}
        initialData={currentCategory}
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </AdminPageLayout>
  )
}

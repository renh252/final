'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Form } from 'react-bootstrap'
import { Plus, Edit, Trash, Tag, FolderTree } from 'lucide-react'
import { fetchApi } from '@/app/admin/_lib/api'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'

// 分類介面定義
interface Category {
  category_id: number
  category_name: string
  category_tag: string
  category_description: string | null
  parent_id: number | null
  created_at: string
  updated_at: string
  product_count: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)

  // 獲取分類數據
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetchApi('/api/admin/shop/categories')
      if (response.success) {
        setCategories(response.data)
      } else {
        showToast('error', '獲取分類失敗', response.message)
      }
    } catch (error: any) {
      showToast('error', '獲取分類失敗', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // 處理新增分類
  const handleAddCategory = () => {
    setCurrentCategory(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯分類
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除分類
  const handleDeleteCategory = async (category: Category) => {
    try {
      const hasChildren = categories.some(
        (c) => c.parent_id === category.category_id
      )
      if (hasChildren) {
        showToast('error', '無法刪除', '此分類包含子分類，請先刪除子分類')
        return
      }

      if (category.product_count > 0) {
        showToast(
          'error',
          '無法刪除',
          '此分類包含商品，請先移除或更改商品的分類'
        )
        return
      }

      const confirmed = await confirm({
        title: '刪除分類',
        message: `確定要刪除分類 ${category.category_name} 嗎？此操作無法撤銷。`,
        type: 'danger',
        confirmText: '刪除',
      })

      if (confirmed) {
        const response = await fetchApi(
          `/api/admin/shop/categories/${category.category_id}`,
          {
            method: 'DELETE',
          }
        )

        if (response.success) {
          showToast(
            'success',
            '刪除成功',
            `分類 ${category.category_name} 已成功刪除`
          )
          fetchCategories()
        } else {
          showToast('error', '刪除失敗', response.message)
        }
      }
    } catch (error: any) {
      showToast('error', '刪除失敗', error.message)
    }
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setLoading(true)

      // 檢查循環引用
      if (formData.parent_id) {
        if (
          modalMode === 'edit' &&
          formData.parent_id === currentCategory?.category_id
        ) {
          showToast('error', '無效的父分類', '不能將自己設為父分類')
          return
        }

        const checkCircular = (parentId: number, targetId: number): boolean => {
          if (parentId === targetId) return true
          const children = categories.filter((c) => c.parent_id === parentId)
          return children.some((child) =>
            checkCircular(child.category_id, targetId)
          )
        }

        if (
          modalMode === 'edit' &&
          currentCategory &&
          checkCircular(currentCategory.category_id, formData.parent_id)
        ) {
          showToast('error', '無效的父分類', '不能選擇子分類作為父分類')
          return
        }
      }

      const apiUrl =
        modalMode === 'add'
          ? '/api/admin/shop/categories'
          : `/api/admin/shop/categories/${currentCategory?.category_id}`

      const response = await fetchApi(apiUrl, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        body: JSON.stringify({
          category_name: formData.name,
          category_tag: formData.name.toLowerCase().replace(/\s+/g, '-'),
          category_description: formData.description || '',
          parent_id: formData.parent_id || null,
        }),
      })

      if (response.success) {
        showToast(
          'success',
          modalMode === 'add' ? '新增成功' : '更新成功',
          `分類 ${formData.name} ${
            modalMode === 'add' ? '已成功新增' : '資料已成功更新'
          }`
        )
        setShowModal(false)
        fetchCategories()
      } else {
        showToast(
          'error',
          modalMode === 'add' ? '新增失敗' : '更新失敗',
          response.message
        )
      }
    } catch (error: any) {
      showToast(
        'error',
        modalMode === 'add' ? '新增失敗' : '更新失敗',
        error.message
      )
    } finally {
      setLoading(false)
    }
  }

  // 表格列定義
  const columns = [
    { key: 'category_name', label: '分類名稱', sortable: true },
    { key: 'category_description', label: '描述', sortable: true },
    {
      key: 'parent_id',
      label: '父分類',
      sortable: true,
      render: (value: number | null) => {
        if (value === null) return <Badge bg="secondary">無</Badge>
        const parent = categories.find((c) => c.category_id === value)
        return parent ? parent.category_name : <Badge bg="danger">未知</Badge>
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
        ...categories
          .filter(
            (c) =>
              modalMode === 'add' ||
              (modalMode === 'edit' &&
                c.category_id !== currentCategory?.category_id)
          )
          .map((c) => ({
            value: c.category_id,
            label: c.category_name,
          })),
      ],
      placeholder: '選擇父分類',
    },
  ]

  // 渲染操作按鈕
  const renderActions = (category: Category) => (
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
            searchKeys={['category_name', 'category_description']}
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
        initialData={
          currentCategory
            ? {
                name: currentCategory.category_name,
                description: currentCategory.category_description,
                parent_id: currentCategory.parent_id,
              }
            : undefined
        }
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </AdminPageLayout>
  )
}

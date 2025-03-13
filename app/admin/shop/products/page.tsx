'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Button,
  Form,
  Badge,
  Image,
  Alert,
  Stack,
  Row,
  Col,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import {
  Plus,
  Edit,
  Trash,
  Eye,
  Package,
  Download,
  Upload,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Archive,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Cookies from 'js-cookie'
import { fetchApi } from '@/app/admin/_lib/api'

// 商品狀態選項
const STATUS_OPTIONS = [
  { value: '上架', label: '上架中' },
  { value: '下架', label: '已下架' },
  { value: 'deleted', label: '已刪除' },
]

// 商品狀態定義
const PRODUCT_STATUS = {
  上架: { color: 'success', label: '上架中' },
  下架: { color: 'secondary', label: '已下架' },
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempt, setFetchAttempt] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    status: '',
    stockWarning: false,
    showDeleted: false,
  })

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 獲取商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchApi('/api/admin/products')
      if (response.products && Array.isArray(response.products)) {
        setProducts(response.products)
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取商品列表時發生錯誤:', error)
      setError(error.message || '獲取商品列表失敗')
      showToast('error', '錯誤', error.message || '獲取商品列表失敗')
    } finally {
      setLoading(false)
    }
  }

  // 獲取分類列表
  const fetchCategories = async () => {
    try {
      const response = await fetchApi('/api/admin/products/categories')
      if (response.categories && Array.isArray(response.categories)) {
        setCategories(response.categories)
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取分類列表時發生錯誤:', error)
      showToast('error', '錯誤', error.message || '獲取分類列表失敗')
    }
  }

  useEffect(() => {
    // 只有在嘗試次數小於 3 次時才獲取資料
    if (fetchAttempt < 3) {
      const token = getToken()
      if (token) {
        Promise.all([fetchProducts(), fetchCategories()]).catch(() => {
          // 增加嘗試次數
          setFetchAttempt((prev) => prev + 1)
        })
      }
    }
  }, [fetchAttempt])

  // 重試獲取資料
  const handleRetry = () => {
    setFetchAttempt(0) // 重置嘗試次數
  }

  // 處理批量操作
  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    if (!selectedIds.length) {
      showToast('error', '操作失敗', '請先選擇商品')
      return
    }

    const actionMap = {
      publish: '上架',
      unpublish: '下架',
      delete: '刪除',
    }

    try {
      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: `確認${actionMap[action as keyof typeof actionMap]}`,
          message: `確定要${
            actionMap[action as keyof typeof actionMap]
          }所選商品嗎？`,
          confirmText: '確認',
          cancelText: '取消',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      const response = await fetchApi('/api/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action,
          productIds: selectedIds,
        }),
      })

      const data = await response.json()
      if (data.success) {
        showToast('success', '操作成功', data.message)
        fetchProducts()
      } else {
        showToast('error', '操作失敗', data.message)
      }
    } catch (error) {
      console.error('批量操作失敗:', error)
      showToast('error', '操作失敗', '批量操作失敗，請稍後再試')
    }
  }

  // 表格列定義
  const columns = [
    {
      key: 'product_name',
      label: '商品名稱',
      sortable: true,
    },
    {
      key: 'category_name',
      label: '分類',
      sortable: true,
      render: (value: string, row: any) => {
        const category = categories.find(
          (c) => c.category_id === row.category_id
        )
        if (!category) return value

        if (!category.parent_category_id) {
          return <strong>{value}</strong>
        }

        const parentCategory = categories.find(
          (c) => c.category_id === category.parent_category_id
        )
        return (
          <div>
            <small className="text-muted">
              {parentCategory?.category_name} /{' '}
            </small>
            {value}
          </div>
        )
      },
    },
    {
      key: 'price',
      label: '價格',
      sortable: true,
      render: (value: number) => `NT$ ${value.toLocaleString()}`,
    },
    {
      key: 'stock_quantity',
      label: '庫存',
      sortable: true,
      render: (value: number) => (
        <div className="d-flex align-items-center">
          {value}
          {value < 30 && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>庫存過低</Tooltip>}
            >
              <AlertTriangle size={16} className="ms-2 text-warning" />
            </OverlayTrigger>
          )}
        </div>
      ),
    },
    {
      key: 'product_status',
      label: '狀態',
      sortable: true,
      render: (value: string, row: any) => {
        if (row.is_deleted === 1) {
          return <Badge bg="dark">已刪除</Badge>
        }
        const status = PRODUCT_STATUS[value as keyof typeof PRODUCT_STATUS]
        return (
          <Badge bg={status?.color || 'secondary'}>
            {status?.label || '未知狀態'}
          </Badge>
        )
      },
    },
  ]

  const renderActions = (row: any) => (
    <div className="d-flex gap-2 justify-content-end">
      <Button
        variant="outline-info"
        size="sm"
        onClick={() => router.push(`/admin/shop/products/${row.product_id}`)}
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => router.push(`/admin/shop/products/${row.product_id}`)}
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={async () => {
          const confirmResult = await new Promise<boolean>((resolve) => {
            confirm({
              title: '確認刪除',
              message: '確定要刪除此商品嗎？此操作不可恢復！',
              confirmText: '確定',
              cancelText: '取消',
              type: 'danger',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false),
            })
          })

          if (confirmResult) {
            try {
              await deleteProduct(row.product_id)
              showToast('success', '成功', '刪除商品成功')
              fetchProducts()
            } catch (error) {
              showToast('error', '錯誤', '刪除商品失敗')
            }
          }
        }}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  )

  // 處理篩選
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  // 處理編輯
  const handleEdit = (productId: number) => {
    router.push(`/admin/shop/products/${productId}`)
  }

  // 處理刪除
  const handleDelete = async (productId: number) => {
    try {
      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: '確認刪除',
          message: '確定要刪除此商品嗎？此操作無法復原。',
          confirmText: '確認刪除',
          cancelText: '取消',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      const response = await fetchApi(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        showToast('success', '刪除成功', '商品已刪除')
        fetchProducts()
      } else {
        showToast('error', '刪除失敗', data.message)
      }
    } catch (error) {
      console.error('刪除商品失敗:', error)
      showToast('error', '刪除失敗', '刪除商品失敗，請稍後再試')
    }
  }

  // 修改篩選商品的邏輯
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 關鍵字搜尋（商品名稱）
      const matchKeyword =
        !filters.keyword ||
        product.product_name
          .toLowerCase()
          .includes(filters.keyword.toLowerCase())

      // 分類篩選 - 使用 category_id 進行比對
      const matchCategory = (() => {
        if (!filters.category) return true

        const selectedCategory = categories.find(
          (c) => c.category_id.toString() === filters.category
        )
        if (!selectedCategory) return false

        if (!selectedCategory.parent_category_id) {
          // 如果選擇的是主分類，顯示該主分類下的所有商品（包括次分類）
          return (
            product.category_id === selectedCategory.category_id ||
            categories.some(
              (c) =>
                c.parent_category_id === selectedCategory.category_id &&
                c.category_id === product.category_id
            )
          )
        } else {
          // 如果選擇的是次分類，只顯示該次分類的商品
          return product.category_id === selectedCategory.category_id
        }
      })()

      // 狀態篩選 - 根據資料庫中的狀態進行映射
      const matchStatus = (() => {
        if (!filters.status) {
          return !product.is_deleted // 預設只顯示未刪除的商品
        }
        switch (filters.status) {
          case '上架':
            return product.product_status === '上架' && !product.is_deleted
          case '下架':
            return product.product_status === '下架' && !product.is_deleted
          case 'deleted':
            return product.is_deleted === 1
          default:
            return !product.is_deleted
        }
      })()

      // 庫存警告
      const matchStockWarning =
        !filters.stockWarning ||
        (product.stock_quantity !== null && product.stock_quantity < 30)

      return matchKeyword && matchCategory && matchStatus && matchStockWarning
    })
  }, [products, filters])

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      console.log('提交商品表單數據:', formData)

      // 處理數值型欄位
      const processedData = { ...formData }
      if (processedData.product_price !== undefined) {
        processedData.product_price = Number(processedData.product_price)
      }
      if (processedData.stock_quantity !== undefined) {
        processedData.stock_quantity = Number(processedData.stock_quantity)
      }

      if (modalMode === 'add') {
        // 新增商品
        const response = await fetchApi('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(processedData),
        })

        if (!response.success) {
          throw new Error(response.message || '新增商品失敗')
        }

        const result = await response.json()

        // 直接將新商品添加到列表中，而不是重新獲取整個列表
        if (result.product) {
          const newProduct = result.product
          setProducts((prev) => [newProduct, ...prev])
        } else {
          // 如果 API 沒有返回新商品數據，才重新獲取
          fetchProducts()
        }

        showToast(
          'success',
          '新增成功',
          `商品 ${formData.product_name} 已成功新增`
        )
      } else {
        // 更新商品
        const response = await fetchApi(
          `/api/admin/products/${currentProduct.product_id}`,
          {
            method: 'PUT',
            body: JSON.stringify(processedData),
          }
        )

        if (!response.success) {
          throw new Error(response.message || '更新商品失敗')
        }

        const result = await response.json()

        // 更新商品列表
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === currentProduct.product_id
              ? {
                  ...p,
                  ...processedData,
                  stock_quantity: processedData.stock_quantity,
                  price: processedData.product_price,
                  main_image: processedData.product_image,
                }
              : p
          )
        )

        showToast(
          'success',
          '更新成功',
          `商品 ${formData.product_name} 資料已成功更新`
        )
      }

      // 關閉模態框
      setShowModal(false)
    } catch (error) {
      console.error('提交商品資料時發生錯誤:', error)
      showToast(
        'error',
        '操作失敗',
        error instanceof Error ? error.message : '無法完成操作，請稍後再試'
      )
    }
  }

  // 處理導出
  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      showToast('info', '導出中', '正在準備導出數據...')

      const response = await fetchApi(
        `/api/admin/products/export?format=${format}`,
        {
          method: 'GET',
        }
      )

      if (response.success) {
        // 創建一個臨時鏈接並點擊它來下載文件
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.setAttribute('download', `products_export.${format}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast(
          'success',
          '導出成功',
          `已成功導出 ${products.length} 條商品記錄`
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

  // 處理導入
  const handleImport = async (file: File) => {
    try {
      setIsImporting(true)
      setImportError(null)
      setImportResult(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetchApi('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      })

      if (response.success) {
        setImportResult(response)
        showToast('success', '導入成功', response.message)
        fetchProducts()
      } else {
        setImportError(response.message || '導入過程中發生錯誤')
        throw new Error(response.message || '導入失敗')
      }
    } catch (error: any) {
      console.error('導入時發生錯誤:', error)
      setImportError(error.message || '導入失敗，請稍後再試')
      showToast('error', '導入失敗', error.message || '導入失敗，請稍後再試')
    } finally {
      setIsImporting(false)
    }
  }

  // 統計數據
  const productStats = [
    {
      title: '總商品數',
      count: products.filter((p) => p.is_deleted !== 1).length,
      color: 'primary',
      icon: <Package size={24} />,
    },
    {
      title: '上架中',
      count: products.filter(
        (p) => p.product_status === '上架' && p.is_deleted !== 1
      ).length,
      color: 'success',
      icon: <Package size={24} />,
    },
    {
      title: '已下架',
      count: products.filter(
        (p) => p.product_status === '下架' && p.is_deleted !== 1
      ).length,
      color: 'secondary',
      icon: <Package size={24} />,
    },
    {
      title: '已刪除',
      count: products.filter((p) => p.is_deleted === 1).length,
      color: 'dark',
      icon: <Trash2 size={24} />,
    },
  ]

  const updateProductStatus = async (
    productId: string,
    status: '上架' | '下架'
  ) => {
    const response = await fetchApi(`/api/admin/products/${productId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    if (!response.success) {
      throw new Error('更新商品狀態失敗')
    }
  }

  const deleteProduct = async (productId: string) => {
    const response = await fetchApi(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error('刪除商品失敗')
    }
  }

  const refreshProducts = () => {
    fetchProducts()
  }

  const batchActions = [
    {
      label: '批量上架',
      icon: <ArrowUpCircle size={16} />,
      onClick: async (selectedRows) => {
        const confirmResult = await new Promise<boolean>((resolve) => {
          confirm({
            title: '確認上架',
            message: `確定要上架選中的 ${selectedRows.length} 個商品嗎？`,
            confirmText: '確定',
            cancelText: '取消',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          })
        })

        if (confirmResult) {
          try {
            await Promise.all(
              selectedRows.map((product) =>
                updateProductStatus(product.id, '上架')
              )
            )
            showToast('success', '成功', '批量上架成功')
            refreshProducts()
          } catch (error) {
            showToast('error', '錯誤', '批量上架失敗')
          }
        }
      },
      variant: 'success',
    },
    {
      label: '批量下架',
      icon: <ArrowDownCircle size={16} />,
      onClick: async (selectedRows) => {
        const confirmResult = await new Promise<boolean>((resolve) => {
          confirm({
            title: '確認下架',
            message: `確定要下架選中的 ${selectedRows.length} 個商品嗎？`,
            confirmText: '確定',
            cancelText: '取消',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          })
        })

        if (confirmResult) {
          try {
            await Promise.all(
              selectedRows.map((product) =>
                updateProductStatus(product.id, '下架')
              )
            )
            showToast('success', '成功', '批量下架成功')
            refreshProducts()
          } catch (error) {
            showToast('error', '錯誤', '批量下架失敗')
          }
        }
      },
      variant: 'warning',
    },
  ]

  // 修改表單欄位定義
  const formFields = useMemo(
    () => [
      {
        name: 'product_name',
        label: '商品名稱',
        type: 'text' as const,
        required: true,
      },
      {
        name: 'product_price',
        label: '價格',
        type: 'number' as const,
        required: true,
      },
      {
        name: 'product_description',
        label: '商品描述',
        type: 'textarea' as const,
        required: false,
      },
      {
        name: 'product_category',
        label: '商品分類',
        type: 'select' as const,
        options: categories.map((c) => ({
          value: c.category_id,
          label: c.category_name,
        })),
        required: true,
      },
      {
        name: 'stock_quantity',
        label: '庫存數量',
        type: 'number' as const,
        required: false,
        defaultValue: 0,
      },
      {
        name: 'product_status',
        label: '商品狀態',
        type: 'select' as const,
        options: [
          { value: '上架', label: '上架中' },
          { value: '下架', label: '已下架' },
        ],
        required: true,
        defaultValue: '下架',
      },
      {
        name: 'product_image',
        label: '商品圖片URL',
        type: 'text' as const,
        required: false,
      },
    ],
    [categories]
  )

  return (
    <AdminPageLayout
      title="商品管理"
      actions={
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              size="sm"
              href="/admin/shop/products/new"
              className="d-flex align-items-center"
            >
              <Plus size={16} className="me-1" /> 新增商品
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleBulkAction('publish', [])}
            >
              <Package size={16} className="me-1" /> 批量上架
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleBulkAction('unpublish', [])}
            >
              <Archive size={16} className="me-1" /> 批量下架
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => handleBulkAction('delete', [])}
            >
              <Trash2 size={16} className="me-1" /> 批量刪除
            </Button>
          </div>
        </div>
      }
      stats={productStats}
    >
      <AdminSection title="商品列表">
        <AdminCard>
          {error && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>獲取資料失敗</Alert.Heading>
              <p>{error}</p>
              <div className="d-flex justify-content-end">
                <Button variant="outline-danger" onClick={handleRetry}>
                  重試
                </Button>
              </div>
            </Alert>
          )}

          {/* 篩選控制 */}
          <div className="mb-3">
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>搜尋商品</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="輸入商品名稱"
                      value={filters.keyword}
                      onChange={(e) =>
                        handleFilterChange('keyword', e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>商品分類</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange('category', e.target.value)
                      }
                    >
                      <option value="">全部分類</option>
                      {categories
                        .filter((category) => !category.parent_category_id)
                        .map((mainCategory) => (
                          <React.Fragment key={mainCategory.category_id}>
                            <option
                              value={mainCategory.category_id}
                              style={{ fontWeight: 'bold' }}
                            >
                              {mainCategory.category_name}
                            </option>
                            {categories
                              .filter(
                                (subCategory) =>
                                  subCategory.parent_category_id ===
                                  mainCategory.category_id
                              )
                              .map((subCategory) => (
                                <option
                                  key={subCategory.category_id}
                                  value={subCategory.category_id}
                                >
                                  ∟ {subCategory.category_name}
                                </option>
                              ))}
                          </React.Fragment>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>商品狀態</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange('status', e.target.value)
                      }
                    >
                      <option value="">全部狀態</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>&nbsp;</Form.Label>
                    <Form.Check
                      type="switch"
                      id="stock-warning"
                      label="庫存警告"
                      checked={filters.stockWarning}
                      onChange={(e) =>
                        handleFilterChange('stockWarning', e.target.checked)
                      }
                      className="mt-2"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">載入中...</span>
              </div>
              <p className="mt-2">載入商品資料中...</p>
            </div>
          ) : (
            <div>
              <DataTable
                columns={columns}
                data={filteredProducts}
                loading={loading}
                searchable={false}
                selectable
                batchActions={batchActions}
                actions={renderActions}
              />
            </div>
          )}
        </AdminCard>
      </AdminSection>

      {/* Modal 表單 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增商品' : '編輯商品'}
        onSubmit={handleSubmit}
        initialData={currentProduct}
        fields={formFields}
      />
    </AdminPageLayout>
  )
}

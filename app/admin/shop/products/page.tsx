'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button, Form, Badge, Image, Alert } from 'react-bootstrap'
import {
  Plus,
  Edit,
  Trash,
  Eye,
  Package,
  Download,
  Upload,
  Trash2,
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

// 商品狀態選項
const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' },
  { value: 'out_of_stock', label: '缺貨中' },
  { value: 'deleted', label: '已刪除' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempt, setFetchAttempt] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any | null>(null)

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 載入商品資料
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `伺服器回應錯誤: ${response.status}`)
      }

      const data = await response.json()
      setProducts(data.products || [])

      // 過濾出未刪除的商品作為預設顯示
      const nonDeletedProducts = (data.products || []).filter(
        (p) => p.is_deleted !== 1
      )
      setFilteredProducts(nonDeletedProducts)
    } catch (error) {
      console.error('獲取商品資料時發生錯誤:', error)
      setError(
        error instanceof Error ? error.message : '獲取資料失敗，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }

  // 載入分類資料
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/products/categories', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error('獲取分類失敗')
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('獲取分類資料時發生錯誤:', error)
      showToast('error', '錯誤', '無法獲取商品分類')
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

  // 商品表格列定義
  const columns = [
    {
      key: 'product_id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'product_image',
      label: '圖片',
      render: (value, row) => (
        <Image
          src={row.main_image || '/images/default_product.jpg'}
          alt="商品照片"
          width={50}
          height={50}
          className="rounded"
        />
      ),
    },
    {
      key: 'product_name',
      label: '名稱',
      sortable: true,
    },
    {
      key: 'category_name',
      label: '分類',
      sortable: true,
      filterable: true,
      filterOptions: categories.map((c) => ({
        value: c.category_name,
        label: c.category_name,
      })),
    },
    {
      key: 'price',
      label: '價格',
      sortable: true,
      render: (value) => `NT$ ${value || 0}`,
    },
    {
      key: 'stock',
      label: '庫存',
      sortable: true,
      render: (value) => value || 0,
    },
    {
      key: 'product_status',
      label: '狀態',
      sortable: true,
      filterable: true,
      filterOptions: STATUS_OPTIONS,
      render: (value, row) => {
        if (row.is_deleted === 1) {
          return <Badge bg="danger">已刪除</Badge>
        } else if (value === '上架' || value === 'active') {
          return <Badge bg="success">上架中</Badge>
        } else if (value === '下架' || value === 'inactive') {
          return <Badge bg="secondary">已下架</Badge>
        } else if (value === 'out_of_stock') {
          return <Badge bg="danger">缺貨中</Badge>
        }
        return <Badge bg="light">未知</Badge>
      },
    },
    {
      key: 'created_at',
      label: '新增日期',
      sortable: true,
      render: (value) => {
        if (!value) return '-'
        try {
          // 將 UTC 日期轉換為 GMT+8 (台灣時間)
          const date = new Date(value)

          // 使用 toLocaleString 方法，指定台灣時區和格式
          return date.toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        } catch (error) {
          console.error('日期格式轉換錯誤:', error)
          return value
        }
      },
    },
  ]

  // 渲染操作按鈕
  const renderActions = (product) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/admin/shop/products/${product.product_id}`)
        }}
        title="查看詳情"
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleEditProduct(product)
        }}
        title="編輯商品"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteProduct(product)
        }}
        title="刪除商品"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  // 處理新增商品
  const handleAddProduct = () => {
    setCurrentProduct(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯商品
  const handleEditProduct = (product) => {
    // 設置當前商品和模態框模式
    const productWithCorrectFields = {
      ...product,
      product_stock: product.stock, // 確保庫存欄位正確映射
      product_price: product.price, // 同樣確保價格欄位正確映射
      product_image: product.main_image, // 確保圖片欄位正確映射
      product_category: product.category_id, // 確保分類欄位正確映射
    }
    setCurrentProduct(productWithCorrectFields)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除商品
  const handleDeleteProduct = (product) => {
    confirm({
      title: '刪除商品',
      message: `確定要刪除商品「${product.product_name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          const response = await fetch(
            `/api/admin/products/${product.product_id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          )

          if (!response.ok) {
            throw new Error('刪除商品失敗')
          }

          // 更新全部商品列表 - 刪除的商品應該標記為已刪除，而不是從列表移除
          setProducts(
            products.map((p) =>
              p.product_id === product.product_id ? { ...p, is_deleted: 1 } : p
            )
          )

          // 更新過濾後的商品列表 - 如果用戶選擇不顯示已刪除商品，則需要從列表中移除
          setFilteredProducts(
            filteredProducts.filter((p) => p.product_id !== product.product_id)
          )

          showToast(
            'success',
            '刪除成功',
            `商品 ${product.product_name} 已成功刪除`
          )
        } catch (error) {
          console.error('刪除商品時發生錯誤:', error)
          showToast('error', '刪除失敗', '無法刪除商品，請稍後再試')
        }
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      console.log('提交商品表單數據:', formData)

      // 處理數值型欄位
      const processedData = { ...formData }
      if (processedData.product_price !== undefined) {
        processedData.product_price = Number(processedData.product_price)
      }
      if (processedData.product_stock !== undefined) {
        processedData.product_stock = Number(processedData.product_stock)
      }

      if (modalMode === 'add') {
        // 新增商品
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(processedData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || `新增商品失敗 (${response.status})`
          )
        }

        const result = await response.json()

        // 直接將新商品添加到列表中，而不是重新獲取整個列表
        if (result.product) {
          const newProduct = result.product
          setProducts((prev) => [newProduct, ...prev])

          // 如果不是刪除的產品，也添加到過濾列表中
          if (newProduct.is_deleted !== 1) {
            setFilteredProducts((prev) => [newProduct, ...prev])
          }
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
        const response = await fetch(
          `/api/admin/products/${currentProduct.product_id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(processedData),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || `更新商品失敗 (${response.status})`
          )
        }

        const result = await response.json()

        // 更新商品列表
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === currentProduct.product_id
              ? {
                  ...p,
                  ...processedData,
                  stock: processedData.product_stock, // 映射回stock欄位以便在表格中顯示
                  price: processedData.product_price, // 映射回price欄位
                  main_image: processedData.product_image, // 映射回main_image欄位
                }
              : p
          )
        )

        // 同時更新過濾後的產品列表
        setFilteredProducts((prev) =>
          prev.map((p) =>
            p.product_id === currentProduct.product_id
              ? {
                  ...p,
                  ...processedData,
                  stock: processedData.product_stock,
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
      // 顯示加載中提示
      showToast('info', '導出中', '正在準備導出數據...')

      // 構建導出 URL
      const exportUrl = `/api/admin/products/export?format=${format}`

      // 創建一個臨時鏈接並點擊它來下載文件
      const link = document.createElement('a')
      link.href = exportUrl
      link.setAttribute('download', `products_export.${format}`)

      // 添加 token 到請求頭
      const token = getToken()
      fetch(exportUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          link.href = url
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          showToast(
            'success',
            '導出成功',
            `已成功導出 ${products.length} 條商品記錄`
          )
        })
        .catch((error) => {
          console.error('導出失敗:', error)
          showToast('error', '導出失敗', '無法導出數據，請稍後再試')
        })
    } catch (error) {
      console.error('導出時發生錯誤:', error)
      showToast('error', '導出失敗', '無法導出數據，請稍後再試')
    }
  }

  // 處理導入
  const handleImport = async (file: File) => {
    try {
      setIsImporting(true)
      setImportError(null)
      setImportResult(null)

      // 創建 FormData
      const formData = new FormData()
      formData.append('file', file)

      // 發送請求
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '導入失敗')
      }

      // 設置導入結果
      setImportResult(result)

      // 如果導入成功，重新獲取商品列表
      if (result.success) {
        showToast('success', '導入成功', result.message)
        fetchProducts()
      } else {
        setImportError(result.error || '導入過程中發生錯誤')
      }
    } catch (error) {
      console.error('導入時發生錯誤:', error)
      setImportError(
        error instanceof Error ? error.message : '導入失敗，請稍後再試'
      )
      showToast(
        'error',
        '導入失敗',
        error instanceof Error ? error.message : '導入失敗，請稍後再試'
      )
    } finally {
      setIsImporting(false)
    }
  }

  // 處理批量刪除
  const handleBatchDelete = (selectedRows: any[]) => {
    if (selectedRows.length === 0) return

    confirm({
      title: '批量刪除商品',
      message: `確定要刪除選中的 ${selectedRows.length} 個商品嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          showToast('info', '處理中', '正在刪除選中的商品...')

          // 創建一個包含所有刪除操作的 Promise 數組
          const deletePromises = selectedRows.map((product) =>
            fetch(`/api/admin/products/${product.product_id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            })
          )

          // 等待所有刪除操作完成
          const results = await Promise.allSettled(deletePromises)

          // 計算成功和失敗的數量
          const succeeded = results.filter(
            (r) => r.status === 'fulfilled'
          ).length
          const failed = results.length - succeeded

          // 更新商品列表
          if (succeeded > 0) {
            // 獲取已刪除的產品ID
            const deletedIds = selectedRows.map((product) => product.product_id)

            // 更新全部商品列表 - 將刪除的商品標記為已刪除，而不是從列表移除
            setProducts(
              products.map((p) =>
                deletedIds.includes(p.product_id) ? { ...p, is_deleted: 1 } : p
              )
            )

            // 更新過濾後的商品列表 - 移除已刪除的商品
            setFilteredProducts(
              filteredProducts.filter(
                (product) => !deletedIds.includes(product.product_id)
              )
            )

            showToast(
              'success',
              '批量刪除完成',
              `成功刪除 ${succeeded} 個商品${
                failed > 0 ? `，${failed} 個刪除失敗` : ''
              }`
            )
          } else {
            showToast('error', '批量刪除失敗', '所有商品刪除操作均失敗')
          }
        } catch (error) {
          console.error('批量刪除時發生錯誤:', error)
          showToast('error', '批量刪除失敗', '無法完成批量刪除操作')
        }
      },
    })
  }

  // 批量操作定義
  const batchActions = [
    {
      label: '批量刪除',
      icon: <Trash2 size={16} />,
      onClick: handleBatchDelete,
      variant: 'outline-danger',
    },
  ]

  // 使用 useMemo 包裝 formFields，避免每次渲染時都創建新的數組
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
        name: 'product_stock',
        label: '庫存數量',
        type: 'number' as const,
        required: false,
        defaultValue: 0,
      },
      {
        name: 'product_status',
        label: '商品狀態',
        type: 'select' as const,
        options: STATUS_OPTIONS.filter((option) => option.value !== 'deleted'),
        required: true,
        defaultValue: 'active',
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
        (p) =>
          (p.product_status === '上架' || p.product_status === 'active') &&
          p.is_deleted !== 1
      ).length,
      color: 'success',
      icon: <Package size={24} />,
    },
    {
      title: '已下架',
      count: products.filter(
        (p) =>
          (p.product_status === '下架' || p.product_status === 'inactive') &&
          p.is_deleted !== 1
      ).length,
      color: 'secondary',
      icon: <Package size={24} />,
    },
    {
      title: '缺貨中',
      count: products.filter(
        (p) => p.product_status === 'out_of_stock' && p.is_deleted !== 1
      ).length,
      color: 'danger',
      icon: <Package size={24} />,
    },
    {
      title: '已刪除',
      count: products.filter((p) => p.is_deleted === 1).length,
      color: 'dark',
      icon: <Trash2 size={24} />,
    },
  ]

  return (
    <AdminPageLayout
      title="商品管理"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddProduct}
          className="d-flex align-items-center"
        >
          <Plus size={16} className="me-1" /> 新增商品
        </Button>
      }
      stats={productStats}
    >
      {/* 管理說明 */}
      <div className="mb-4">
        <p>管理所有商品，包括新增、編輯、刪除商品</p>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin">管理區</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/admin/shop">商城管理</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              商品管理
            </li>
          </ol>
        </nav>
      </div>

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

          {importResult && importResult.success && (
            <Alert
              variant="success"
              className="mb-3"
              dismissible
              onClose={() => setImportResult(null)}
            >
              <Alert.Heading>導入成功</Alert.Heading>
              <p>{importResult.message}</p>
              {importResult.errors && importResult.errors.length > 0 && (
                <>
                  <hr />
                  <p>以下記錄導入失敗：</p>
                  <ul>
                    {importResult.errors.map((err: any, index: number) => (
                      <li key={index}>
                        {err.name}: {err.error}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Alert>
          )}

          {importError && (
            <Alert
              variant="danger"
              className="mb-3"
              dismissible
              onClose={() => setImportError(null)}
            >
              <Alert.Heading>導入失敗</Alert.Heading>
              <p>{importError}</p>
            </Alert>
          )}

          {/* 篩選控制 */}
          <div className="mb-3">
            <Form>
              <Form.Group>
                <Form.Label>顯示商品狀態</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <Form.Check
                      key={option.value}
                      type="checkbox"
                      id={`filter-${option.value}`}
                      label={option.label}
                      onChange={(e) => {
                        if (option.value === 'deleted') {
                          // 切換是否顯示已刪除商品
                          if (e.target.checked) {
                            setFilteredProducts(products)
                          } else {
                            setFilteredProducts(
                              products.filter((p) => p.is_deleted !== 1)
                            )
                          }
                        }
                      }}
                      defaultChecked={option.value !== 'deleted'}
                    />
                  ))}
                </div>
              </Form.Group>
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
            <DataTable
              data={filteredProducts}
              columns={columns}
              actions={renderActions}
              itemsPerPage={10}
              searchable={true}
              searchKeys={['product_name', 'product_id', 'category_name']}
              onRowClick={(product) =>
                router.push(`/admin/shop/products/${product.product_id}`)
              }
              pageSizeOptions={[10, 20, 50, 100]}
              selectable={true}
              batchActions={batchActions}
              exportable={true}
              onExport={handleExport}
              importable={true}
              onImport={handleImport}
              advancedFiltering={true}
            />
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

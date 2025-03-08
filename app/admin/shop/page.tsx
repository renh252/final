'use client'

import { useState } from 'react'
import { Card, Button, Row, Col, Badge, Image } from 'react-bootstrap'
import { Plus, Edit, Trash, Eye, Tag, Package } from 'lucide-react'
import DataTable from '../components/DataTable'
import ModalForm from '../components/ModalForm'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { useTheme } from '../ThemeContext'

// 模擬商品數據
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: '優質貓糧',
    category: 'food',
    price: 599,
    stock: 100,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    name: '貓咪玩具組',
    category: 'toy',
    price: 299,
    stock: 50,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-02-10',
  },
  {
    id: 3,
    name: '寵物床墊',
    category: 'accessory',
    price: 899,
    stock: 30,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-01-20',
  },
  {
    id: 4,
    name: '狗狗洗毛精',
    category: 'grooming',
    price: 450,
    stock: 80,
    status: 'inactive',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-03-05',
  },
  {
    id: 5,
    name: '寵物牽繩',
    category: 'accessory',
    price: 350,
    stock: 60,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-02-25',
  },
]

// 商品分類選項
const CATEGORY_OPTIONS = [
  { value: 'food', label: '飼料與食品' },
  { value: 'toy', label: '玩具' },
  { value: 'accessory', label: '配件' },
  { value: 'grooming', label: '美容與清潔' },
  { value: 'health', label: '保健品' },
]

// 商品狀態選項
const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '下架中' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [showModal, setShowModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 表格列定義
  const columns = [
    {
      key: 'image',
      label: '圖片',
      render: (value: string) => (
        <Image src={value} alt="商品圖片" width={40} height={40} rounded />
      ),
    },
    { key: 'name', label: '商品名稱', sortable: true },
    {
      key: 'category',
      label: '分類',
      sortable: true,
      render: (value: string) => {
        const category = CATEGORY_OPTIONS.find((c) => c.value === value)
        return <Badge bg="info">{category?.label || value}</Badge>
      },
    },
    {
      key: 'price',
      label: '價格',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    { key: 'stock', label: '庫存', sortable: true },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      render: (value: string) => {
        let badgeClass = ''
        let statusText = ''

        switch (value) {
          case 'active':
            badgeClass = 'bg-success'
            statusText = '上架中'
            break
          case 'inactive':
            badgeClass = 'bg-secondary'
            statusText = '下架中'
            break
          default:
            badgeClass = 'bg-secondary'
            statusText = '未知'
        }

        return <span className={`badge ${badgeClass}`}>{statusText}</span>
      },
    },
    {
      key: 'createdAt',
      label: '建立日期',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
  ]

  // 表單欄位定義
  const formFields = [
    {
      name: 'name',
      label: '商品名稱',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入商品名稱',
    },
    {
      name: 'category',
      label: '分類',
      type: 'select' as const,
      required: true,
      options: CATEGORY_OPTIONS,
    },
    {
      name: 'price',
      label: '價格',
      type: 'number' as const,
      required: true,
      placeholder: '請輸入價格',
      validation: (value: number) => {
        return value > 0 ? null : '價格必須大於0'
      },
    },
    {
      name: 'stock',
      label: '庫存',
      type: 'number' as const,
      required: true,
      placeholder: '請輸入庫存數量',
      validation: (value: number) => {
        return value >= 0 ? null : '庫存不能為負數'
      },
    },
    {
      name: 'status',
      label: '狀態',
      type: 'select' as const,
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      name: 'image',
      label: '圖片URL',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入圖片URL',
    },
    {
      name: 'description',
      label: '商品描述',
      type: 'textarea' as const,
      placeholder: '請輸入商品描述',
    },
  ]

  // 處理新增商品
  const handleAddProduct = () => {
    setCurrentProduct(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯商品
  const handleEditProduct = (product: any) => {
    setCurrentProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理查看商品詳情
  const handleViewProduct = (product: any) => {
    // 這裡可以實現查看詳情的邏輯，例如導航到詳情頁面
    showToast('info', '商品詳情', `查看商品 ${product.name} 的詳細資料`)
  }

  // 處理刪除商品
  const handleDeleteProduct = (product: any) => {
    confirm({
      title: '刪除商品',
      message: `確定要刪除商品 ${product.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        showToast('success', '刪除成功', `商品 ${product.name} 已成功刪除`)
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    // 模擬API請求延遲
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (modalMode === 'add') {
      // 模擬新增商品
      const newProduct = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setProducts((prev) => [...prev, newProduct])
      showToast('success', '新增成功', `商品 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新商品
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id ? { ...p, ...formData } : p
        )
      )
      showToast('success', '更新成功', `商品 ${formData.name} 資料已成功更新`)
    }
  }

  // 渲染操作按鈕
  const renderActions = (product: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleViewProduct(product)}
        title="查看詳情"
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEditProduct(product)}
        title="編輯商品"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteProduct(product)}
        title="刪除商品"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  return (
    <div className="products-page">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">商品管理</h2>

          <Row className="mb-4">
            <Col md={6} lg={3} className="mb-3">
              <Card
                className={`h-100 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <Package size={24} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-0">總商品數</h6>
                    <h3 className="mb-0">{products.length}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Card
                className={`h-100 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <Tag size={24} className="text-success" />
                  </div>
                  <div>
                    <h6 className="mb-0">上架商品</h6>
                    <h3 className="mb-0">
                      {products.filter((p) => p.status === 'active').length}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>商品列表</div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddProduct}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" /> 新增商品
              </Button>
            </Card.Header>
            <Card.Body>
              <DataTable
                columns={columns}
                data={products}
                searchable={true}
                searchKeys={['name', 'category']}
                actions={renderActions}
                onRowClick={handleViewProduct}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 商品表單模態框 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增商品' : '編輯商品'}
        fields={formFields}
        onSubmit={handleSubmit}
        initialData={currentProduct}
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </div>
  )
}

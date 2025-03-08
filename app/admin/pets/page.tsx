'use client'

import { useState } from 'react'
import { Card, Button, Row, Col, Badge, Image } from 'react-bootstrap'
import { Plus, Edit, Trash, Eye, Heart, PawPrint } from 'lucide-react'
import DataTable from '../components/DataTable'
import ModalForm from '../components/ModalForm'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { useTheme } from '../ThemeContext'

// 模擬寵物數據
const MOCK_PETS = [
  {
    id: 1,
    name: '小花',
    type: 'cat',
    breed: '米克斯',
    age: 2,
    gender: 'female',
    status: 'available',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    name: '大黑',
    type: 'dog',
    breed: '拉布拉多',
    age: 3,
    gender: 'male',
    status: 'available',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-02-10',
  },
  {
    id: 3,
    name: '小白',
    type: 'cat',
    breed: '波斯貓',
    age: 1,
    gender: 'male',
    status: 'adopted',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-01-20',
  },
  {
    id: 4,
    name: '豆豆',
    type: 'dog',
    breed: '柴犬',
    age: 2,
    gender: 'female',
    status: 'available',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-03-05',
  },
  {
    id: 5,
    name: '奇奇',
    type: 'other',
    breed: '兔子',
    age: 1,
    gender: 'male',
    status: 'pending',
    image: 'https://via.placeholder.com/50',
    createdAt: '2023-02-25',
  },
]

// 寵物類型選項
const TYPE_OPTIONS = [
  { value: 'dog', label: '狗' },
  { value: 'cat', label: '貓' },
  { value: 'other', label: '其他' },
]

// 性別選項
const GENDER_OPTIONS = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
]

// 狀態選項
const STATUS_OPTIONS = [
  { value: 'available', label: '可領養' },
  { value: 'pending', label: '審核中' },
  { value: 'adopted', label: '已領養' },
  { value: 'unavailable', label: '不可領養' },
]

export default function PetsPage() {
  const [pets, setPets] = useState(MOCK_PETS)
  const [showModal, setShowModal] = useState(false)
  const [currentPet, setCurrentPet] = useState<any>(null)
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
        <Image src={value} alt="寵物圖片" width={40} height={40} rounded />
      ),
    },
    { key: 'name', label: '名稱', sortable: true },
    {
      key: 'type',
      label: '類型',
      sortable: true,
      render: (value: string) => {
        const type = TYPE_OPTIONS.find((t) => t.value === value)
        return <Badge bg="info">{type?.label || value}</Badge>
      },
    },
    { key: 'breed', label: '品種', sortable: true },
    { key: 'age', label: '年齡', sortable: true },
    {
      key: 'gender',
      label: '性別',
      sortable: true,
      render: (value: string) => {
        const gender = GENDER_OPTIONS.find((g) => g.value === value)
        return gender?.label || value
      },
    },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      render: (value: string) => {
        let badgeClass = ''
        let statusText = ''

        switch (value) {
          case 'available':
            badgeClass = 'bg-success'
            statusText = '可領養'
            break
          case 'pending':
            badgeClass = 'bg-warning'
            statusText = '審核中'
            break
          case 'adopted':
            badgeClass = 'bg-primary'
            statusText = '已領養'
            break
          case 'unavailable':
            badgeClass = 'bg-secondary'
            statusText = '不可領養'
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
      label: '名稱',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入寵物名稱',
    },
    {
      name: 'type',
      label: '類型',
      type: 'select' as const,
      required: true,
      options: TYPE_OPTIONS,
    },
    {
      name: 'breed',
      label: '品種',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入品種',
    },
    {
      name: 'age',
      label: '年齡',
      type: 'number' as const,
      required: true,
      placeholder: '請輸入年齡',
      validation: (value: number) => {
        return value > 0 ? null : '年齡必須大於0'
      },
    },
    {
      name: 'gender',
      label: '性別',
      type: 'select' as const,
      required: true,
      options: GENDER_OPTIONS,
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
      label: '描述',
      type: 'textarea' as const,
      placeholder: '請輸入寵物描述',
    },
  ]

  // 處理新增寵物
  const handleAddPet = () => {
    setCurrentPet(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯寵物
  const handleEditPet = (pet: any) => {
    setCurrentPet(pet)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理查看寵物詳情
  const handleViewPet = (pet: any) => {
    // 這裡可以實現查看詳情的邏輯，例如導航到詳情頁面
    showToast('info', '寵物詳情', `查看寵物 ${pet.name} 的詳細資料`)
  }

  // 處理刪除寵物
  const handleDeletePet = (pet: any) => {
    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物 ${pet.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setPets((prev) => prev.filter((p) => p.id !== pet.id))
        showToast('success', '刪除成功', `寵物 ${pet.name} 已成功刪除`)
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    // 模擬API請求延遲
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (modalMode === 'add') {
      // 模擬新增寵物
      const newPet = {
        id: Math.max(...pets.map((p) => p.id)) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setPets((prev) => [...prev, newPet])
      showToast('success', '新增成功', `寵物 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新寵物
      setPets((prev) =>
        prev.map((p) => (p.id === currentPet.id ? { ...p, ...formData } : p))
      )
      showToast('success', '更新成功', `寵物 ${formData.name} 資料已成功更新`)
    }
  }

  // 渲染操作按鈕
  const renderActions = (pet: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleViewPet(pet)}
        title="查看詳情"
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEditPet(pet)}
        title="編輯寵物"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeletePet(pet)}
        title="刪除寵物"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  return (
    <div className="pets-page">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">寵物管理</h2>

          <Row className="mb-4">
            <Col md={6} lg={3} className="mb-3">
              <Card
                className={`h-100 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <PawPrint size={24} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-0">總寵物數</h6>
                    <h3 className="mb-0">{pets.length}</h3>
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
                    <Heart size={24} className="text-success" />
                  </div>
                  <div>
                    <h6 className="mb-0">可領養</h6>
                    <h3 className="mb-0">
                      {pets.filter((p) => p.status === 'available').length}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>寵物列表</div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddPet}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" /> 新增寵物
              </Button>
            </Card.Header>
            <Card.Body>
              <DataTable
                columns={columns}
                data={pets}
                searchable={true}
                searchKeys={['name', 'breed']}
                actions={renderActions}
                onRowClick={handleViewPet}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 寵物表單模態框 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增寵物' : '編輯寵物'}
        fields={formFields}
        onSubmit={handleSubmit}
        initialData={currentPet}
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </div>
  )
}

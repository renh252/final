'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Badge, Image } from 'react-bootstrap'
import { Plus, Edit, Trash, Eye, Heart, PawPrint } from 'lucide-react'
import DataTable from '../components/DataTable'
import ModalForm from '../components/ModalForm'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { useTheme } from '../ThemeContext'

// 模擬寵物數據 - 基於資料庫結構
const MOCK_PETS = [
  {
    id: 1,
    name: 'Pet1',
    gender: '母',
    species: '狗',
    variety: '貴賓',
    birthday: '2024-01-31',
    weight: 31.84,
    chip_number: '8958766700',
    fixed: 1,
    story: 'This is the story of Pet1. It is a very lovely pet.',
    store_id: 1,
    created_at: '2025-01-14',
    is_adopted: 0,
    main_photo: 'https://via.placeholder.com/50',
    store_name: 'Pet Store 1',
  },
  {
    id: 2,
    name: 'Pet2',
    gender: '母',
    species: '貓',
    variety: '波斯貓',
    birthday: '2020-05-05',
    weight: 49.46,
    chip_number: '5354310530',
    fixed: 1,
    story: 'This is the story of Pet2. It is a very lovely pet.',
    store_id: 6,
    created_at: '2025-01-14',
    is_adopted: 1,
    main_photo: 'https://via.placeholder.com/50',
    store_name: 'Pet Store 6',
  },
  {
    id: 3,
    name: 'Pet3',
    gender: '公',
    species: '貓',
    variety: '暹羅貓',
    birthday: '2022-05-23',
    weight: 13.76,
    chip_number: '5803740308',
    fixed: 0,
    story: 'This is the story of Pet3. It is a very lovely pet.',
    store_id: 10,
    created_at: '2025-01-14',
    is_adopted: 1,
    main_photo: 'https://via.placeholder.com/50',
    store_name: 'Pet Store 10',
  },
  {
    id: 4,
    name: 'Pet4',
    gender: '母',
    species: '狗',
    variety: '馬爾濟斯',
    birthday: '2018-09-07',
    weight: 7.61,
    chip_number: '8524556371',
    fixed: 1,
    story: 'This is the story of Pet4. It is a very lovely pet.',
    store_id: 10,
    created_at: '2025-01-14',
    is_adopted: 0,
    main_photo: 'https://via.placeholder.com/50',
    store_name: 'Pet Store 10',
  },
  {
    id: 5,
    name: 'Pet5',
    gender: '公',
    species: '貓',
    variety: '米克斯',
    birthday: '2024-01-31',
    weight: 31.24,
    chip_number: '8362333427',
    fixed: 0,
    story: 'This is the story of Pet5. It is a very lovely pet.',
    store_id: 3,
    created_at: '2025-01-14',
    is_adopted: 0,
    main_photo: 'https://via.placeholder.com/50',
    store_name: 'Pet Store 3',
  },
]

// 寵物店鋪選項
const STORE_OPTIONS = [
  { value: 1, label: 'Pet Store 1' },
  { value: 2, label: 'Pet Store 2' },
  { value: 3, label: 'Pet Store 3' },
  { value: 4, label: 'Pet Store 4' },
  { value: 5, label: 'Pet Store 5' },
  { value: 6, label: 'Pet Store 6' },
  { value: 7, label: 'Pet Store 7' },
  { value: 8, label: 'Pet Store 8' },
  { value: 9, label: 'Pet Store 9' },
  { value: 10, label: 'Pet Store 10' },
]

// 寵物類型選項
const SPECIES_OPTIONS = [
  { value: '狗', label: '狗' },
  { value: '貓', label: '貓' },
  { value: '其他', label: '其他' },
]

// 性別選項
const GENDER_OPTIONS = [
  { value: '公', label: '公' },
  { value: '母', label: '母' },
]

// 是否絕育選項
const FIXED_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
]

// 是否已領養選項
const ADOPTED_OPTIONS = [
  { value: 0, label: '可領養' },
  { value: 1, label: '已領養' },
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
      key: 'main_photo',
      label: '圖片',
      render: (value: string) => (
        <Image
          src={value || 'https://via.placeholder.com/50'}
          alt="寵物圖片"
          width={40}
          height={40}
          rounded
        />
      ),
    },
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '名稱', sortable: true },
    {
      key: 'species',
      label: '類型',
      sortable: true,
      render: (value: string) => {
        return <Badge bg="info">{value}</Badge>
      },
    },
    { key: 'variety', label: '品種', sortable: true },
    { key: 'gender', label: '性別', sortable: true },
    {
      key: 'is_adopted',
      label: '狀態',
      sortable: true,
      render: (value: number) => {
        return (
          <span
            className={`badge ${value === 0 ? 'bg-success' : 'bg-primary'}`}
          >
            {value === 0 ? '可領養' : '已領養'}
          </span>
        )
      },
    },
    {
      key: 'store_name',
      label: '所屬店鋪',
      sortable: true,
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
      label: '名稱',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入寵物名稱',
    },
    {
      name: 'species',
      label: '類型',
      type: 'select' as const,
      required: true,
      options: SPECIES_OPTIONS,
    },
    {
      name: 'variety',
      label: '品種',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入品種',
    },
    {
      name: 'gender',
      label: '性別',
      type: 'select' as const,
      required: true,
      options: GENDER_OPTIONS,
    },
    {
      name: 'birthday',
      label: '出生日期',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'weight',
      label: '體重(kg)',
      type: 'number' as const,
      required: true,
      placeholder: '請輸入體重',
      validation: (value: number) => {
        return value > 0 ? null : '體重必須大於0'
      },
    },
    {
      name: 'chip_number',
      label: '晶片號碼',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入晶片號碼',
    },
    {
      name: 'fixed',
      label: '是否絕育',
      type: 'select' as const,
      required: true,
      options: FIXED_OPTIONS,
    },
    {
      name: 'is_adopted',
      label: '是否已領養',
      type: 'select' as const,
      required: true,
      options: ADOPTED_OPTIONS,
    },
    {
      name: 'store_id',
      label: '所屬店鋪',
      type: 'select' as const,
      required: true,
      options: STORE_OPTIONS,
    },
    {
      name: 'main_photo',
      label: '圖片URL',
      type: 'text' as const,
      placeholder: '請輸入圖片URL',
    },
    {
      name: 'story',
      label: '寵物故事',
      type: 'textarea' as const,
      placeholder: '請輸入寵物故事',
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

    // 找到對應的店鋪名稱
    const store = STORE_OPTIONS.find(
      (s) => s.value === Number(formData.store_id)
    )
    const storeName = store ? store.label : ''

    if (modalMode === 'add') {
      // 模擬新增寵物
      const newPet = {
        id: Math.max(...pets.map((p) => p.id)) + 1,
        ...formData,
        store_name: storeName,
        created_at: new Date().toISOString().split('T')[0],
      }
      setPets((prev) => [...prev, newPet])
      showToast('success', '新增成功', `寵物 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新寵物
      setPets((prev) =>
        prev.map((p) =>
          p.id === currentPet.id
            ? {
                ...p,
                ...formData,
                store_name: storeName,
              }
            : p
        )
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
                      {pets.filter((p) => p.is_adopted === 0).length}
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
                searchKeys={['name', 'variety', 'species']}
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

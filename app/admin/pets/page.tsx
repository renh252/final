'use client'

import { useState, useEffect } from 'react'
import { Button, Row, Col, Badge, Image, Form } from 'react-bootstrap'
import { Plus, Edit, Trash, Eye, Heart, PawPrint } from 'lucide-react'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '../ThemeContext'
import { useRouter } from 'next/navigation'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '../_components/AdminPageLayout'

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

// 動物種類過濾選項
const PET_TYPE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: '狗', label: '狗' },
  { value: '貓', label: '貓' },
  { value: 'other', label: '其他' },
]

// 動物狀態過濾選項
const PET_STATUS_OPTIONS = [
  { value: 'all', label: '全部狀態' },
  { value: 'available', label: '待領養' },
  { value: 'pending', label: '申請中' },
  { value: 'adopted', label: '已領養' },
]

export default function PetsPage() {
  const [pets, setPets] = useState(MOCK_PETS)
  const [showModal, setShowModal] = useState(false)
  const [currentPet, setCurrentPet] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [filteredPets, setFilteredPets] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // 載入寵物資料
  useEffect(() => {
    // 此處模擬API載入資料
    // 實際應用中應該使用fetch或axios從後端獲取數據
    setPets(MOCK_PETS)
  }, [])

  // 當過濾條件改變時，更新顯示的寵物列表
  useEffect(() => {
    let filtered = [...pets]

    // 根據種類過濾
    if (typeFilter !== 'all') {
      filtered = filtered.filter((pet) => pet.species === typeFilter)
    }

    // 根據狀態過濾
    if (statusFilter !== 'all') {
      const statusMap = {
        available: 0,
        pending: 2,
        adopted: 1,
      }
      filtered = filtered.filter(
        (pet) => pet.is_adopted === statusMap[statusFilter]
      )
    }

    setFilteredPets(filtered)
  }, [pets, typeFilter, statusFilter])

  // 寵物表格列定義
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'main_photo',
      label: '照片',
      render: (value) => (
        <Image
          src={value || 'https://via.placeholder.com/50'}
          alt="寵物照片"
          width={50}
          height={50}
          className="rounded"
        />
      ),
    },
    {
      key: 'name',
      label: '名稱',
      sortable: true,
    },
    {
      key: 'species',
      label: '種類',
      sortable: true,
    },
    {
      key: 'variety',
      label: '品種',
      sortable: true,
    },
    {
      key: 'gender',
      label: '性別',
    },
    {
      key: 'is_adopted',
      label: '狀態',
      sortable: true,
      render: (value) => {
        if (value === 0) {
          return <Badge bg="success">待領養</Badge>
        } else if (value === 1) {
          return <Badge bg="secondary">已領養</Badge>
        } else if (value === 2) {
          return <Badge bg="warning">申請中</Badge>
        }
        return <Badge bg="light">未知</Badge>
      },
    },
    {
      key: 'created_at',
      label: '新增日期',
      sortable: true,
    },
  ]

  // 渲染操作按鈕
  const renderActions = (pet) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/admin/pets/${pet.id}`)
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
          handleEditPet(pet)
        }}
        title="編輯寵物"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleDeletePet(pet)
        }}
        title="刪除寵物"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  // 處理新增寵物
  const handleAddPet = () => {
    setCurrentPet(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯寵物
  const handleEditPet = (pet) => {
    // 實現編輯寵物邏輯
    console.log('編輯寵物', pet)
  }

  // 處理刪除寵物
  const handleDeletePet = (pet) => {
    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物「${pet.name}」嗎？此操作無法撤銷。`,
      onConfirm: () => {
        // 實現刪除寵物邏輯
        setPets(pets.filter((p) => p.id !== pet.id))
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
        ...formData,
        id: Math.floor(Math.random() * 1000) + pets.length + 1,
        store_name: storeName,
        created_at: new Date().toISOString().split('T')[0],
      }
      setPets((prev) => [...prev, newPet as (typeof prev)[0]])
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

  // 在React hooks後面，handleSubmit前面修正formFields定義
  const formFields = [
    { name: 'name', label: '寵物名稱', type: 'text' as const, required: true },
    {
      name: 'gender',
      label: '性別',
      type: 'select' as const,
      options: [
        { value: 'male', label: '公' },
        { value: 'female', label: '母' },
      ],
      required: true,
    },
    {
      name: 'species',
      label: '物種',
      type: 'select' as const,
      options: [
        { value: 'dog', label: '狗' },
        { value: 'cat', label: '貓' },
        { value: 'other', label: '其他' },
      ],
      required: true,
    },
    { name: 'variety', label: '品種', type: 'text' as const, required: true },
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
    },
    {
      name: 'chip_number',
      label: '晶片號碼',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'fixed',
      label: '是否絕育',
      type: 'select' as const,
      options: [
        { value: 1, label: '是' },
        { value: 0, label: '否' },
      ],
      required: true,
    },
    {
      name: 'story',
      label: '寵物故事',
      type: 'textarea' as const,
      required: false,
    },
    {
      name: 'store_id',
      label: '所屬店鋪',
      type: 'select' as const,
      options: STORE_OPTIONS.map((store) => ({
        value: store.value,
        label: store.label,
      })),
      required: true,
    },
    {
      name: 'is_adopted',
      label: '領養狀態',
      type: 'select' as const,
      options: [
        { value: 0, label: '待領養' },
        { value: 1, label: '已領養' },
      ],
      required: true,
    },
    {
      name: 'main_photo',
      label: '主要照片URL',
      type: 'text' as const,
      required: true,
    },
  ]

  // 統計數據
  const petStats = [
    {
      title: '待領養',
      count: pets.filter((p) => p.is_adopted === 0).length,
      color: 'success',
      icon: <PawPrint size={24} />,
    },
    {
      title: '已領養',
      count: pets.filter((p) => p.is_adopted === 1).length,
      color: 'secondary',
      icon: <Heart size={24} />,
    },
    {
      title: '狗',
      count: pets.filter((p) => p.species === '狗').length,
      color: 'primary',
      icon: <PawPrint size={24} />,
    },
    {
      title: '貓',
      count: pets.filter((p) => p.species === '貓').length,
      color: 'info',
      icon: <PawPrint size={24} />,
    },
  ]

  // 頁面操作按鈕
  const pageActions = (
    <Button
      variant="primary"
      className="d-flex align-items-center"
      onClick={handleAddPet}
    >
      <Plus size={18} className="me-1" /> 新增寵物
    </Button>
  )

  return (
    <AdminPageLayout title="寵物管理" stats={petStats} actions={pageActions}>
      <AdminSection title="寵物列表">
        <AdminCard>
          <div className="d-flex flex-wrap justify-content-end mb-3">
            <Form.Group
              className="me-2 mb-2 mb-md-0"
              style={{ minWidth: '150px' }}
            >
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="sm"
              >
                {PET_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group style={{ minWidth: '150px' }}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="sm"
              >
                {PET_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <DataTable
            data={filteredPets.length > 0 ? filteredPets : pets}
            columns={columns}
            renderActions={renderActions}
            rowsPerPage={10}
          />
        </AdminCard>
      </AdminSection>

      {/* Modal 表單 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增寵物' : '編輯寵物'}
        onSubmit={handleSubmit}
        initialValues={currentPet}
        fields={formFields}
      />
    </AdminPageLayout>
  )
}

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Form, Badge, Image, Alert } from 'react-bootstrap'
import {
  Plus,
  Edit,
  Trash,
  Eye,
  Heart,
  PawPrint,
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
import { fetchApi } from '@/app/admin/_lib/api'

// 寵物類型定義
interface Pet {
  id: number
  name: string
  species: string
  variety: string
  gender: string
  birthday?: string
  weight?: number
  chip_number?: string
  fixed?: number
  story?: string
  store_id?: number
  is_adopted: number
  main_photo?: string
  created_at?: string
  [key: string]: any // 允許其他屬性
}

// 店鋪選項類型
interface StoreOption {
  value: number
  label: string
}

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
  const [pets, setPets] = useState<Pet[]>([])
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentPet, setCurrentPet] = useState<Pet | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempt, setFetchAttempt] = useState(0)
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any | null>(null)

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 獲取寵物列表
  const fetchPets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchApi('/api/admin/pets')

      // 處理多種可能的響應格式
      if (response.pets && Array.isArray(response.pets)) {
        // 格式 1: { pets: [...] }
        setPets(response.pets)
      } else if (response.data && Array.isArray(response.data)) {
        // 格式 2: { data: [...] }
        setPets(response.data)
      } else if (Array.isArray(response)) {
        // 格式 3: 直接是數組
        setPets(response)
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取寵物列表時發生錯誤:', error)
      setError(error.message || '獲取寵物列表失敗')
      showToast('error', '錯誤', error.message || '獲取寵物列表失敗')
    } finally {
      setLoading(false)
    }
  }

  // 獲取店鋪列表
  const fetchStores = useCallback(async () => {
    try {
      const response = await fetchApi('/api/admin/pets/stores')

      if (response.success && Array.isArray(response.stores)) {
        // 將店鋪數據轉換為選項格式
        const options = response.stores.map((store) => ({
          value: store.id,
          label: store.name,
        }))

        // 添加空選項
        options.unshift({ value: 0, label: '請選擇所屬店鋪' })

        setStoreOptions(options)
      }
    } catch (error) {
      console.error('獲取店鋪列表時發生錯誤:', error)
    }
  }, [])

  useEffect(() => {
    // 只有在嘗試次數小於 3 次時才獲取資料
    if (fetchAttempt < 3) {
      const token = getToken()
      // 如果已經有寵物數據且不是重試，則不再獲取
      if (token && (pets.length === 0 || fetchAttempt > 0)) {
        fetchPets().catch(() => {
          // 增加嘗試次數
          setFetchAttempt((prev) => prev + 1)
        })
      } else if (pets.length > 0) {
        // 如果已經有數據，設置 loading 為 false
        setLoading(false)
      }
    }
  }, [fetchAttempt, fetchPets, pets.length])

  // 當組件載入時獲取店鋪列表
  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  // 重試獲取資料
  const handleRetry = () => {
    setFetchAttempt(0) // 重置嘗試次數
  }

  // 當過濾條件改變時，更新顯示的寵物列表
  useEffect(() => {
    let filtered = [...pets]

    // 根據種類過濾
    if (typeFilter !== 'all') {
      filtered = filtered.filter((pet) => pet.species === typeFilter)
    }

    // 根據狀態過濾
    if (statusFilter !== 'all') {
      const statusMap: Record<string, number> = {
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
          src={value || '/images/default_no_pet.jpg'}
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
      filterable: true,
      filterOptions: SPECIES_OPTIONS,
    },
    {
      key: 'variety',
      label: '品種',
      sortable: true,
    },
    {
      key: 'gender',
      label: '性別',
      filterable: true,
      filterOptions: GENDER_OPTIONS,
    },
    {
      key: 'is_adopted',
      label: '狀態',
      sortable: true,
      filterable: true,
      filterOptions: ADOPTED_OPTIONS,
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
            second: '2-digit',
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
  const renderActions = (pet: Pet) => (
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
  const handleEditPet = (pet: Pet) => {
    // 設置當前寵物和模態框模式
    setCurrentPet(pet)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理刪除寵物
  const handleDeletePet = (pet: Pet) => {
    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物「${pet.name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          const response = await fetchApi(`/api/admin/pets/${pet.id}`, {
            method: 'DELETE',
          })

          if (response.success) {
            // 更新寵物列表
            setPets(pets.filter((p) => p.id !== pet.id))
            showToast('success', '刪除成功', `寵物 ${pet.name} 已成功刪除`)
          } else {
            throw new Error(response.message || '刪除寵物失敗')
          }
        } catch (error: any) {
          console.error('刪除寵物時發生錯誤:', error)
          showToast(
            'error',
            '刪除失敗',
            error.message || '無法刪除寵物，請稍後再試'
          )
        }
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      console.log('提交寵物表單數據:', formData)

      if (modalMode === 'add') {
        // 新增寵物
        console.log('執行新增寵物操作')
        const response = await fetchApi('/api/admin/pets', {
          method: 'POST',
          body: JSON.stringify(formData),
        })

        if (response.success) {
          console.log('新增寵物成功，結果:', response)

          // 直接將新寵物添加到列表中，而不是重新獲取整個列表
          if (response.pet) {
            setPets((prev) => [...prev, response.pet])
          } else {
            // 如果 API 沒有返回新寵物數據，才重新獲取
            setFetchAttempt(0) // 重置嘗試次數，觸發重新獲取
          }

          showToast('success', '新增成功', `寵物 ${formData.name} 已成功新增`)
        } else {
          throw new Error(response.message || '新增寵物失敗')
        }
      } else if (currentPet) {
        // 更新寵物
        console.log(`執行更新寵物操作，ID: ${currentPet.id}`)

        // 處理數值型欄位
        const processedData = { ...formData }
        if (processedData.weight !== undefined && processedData.weight !== '') {
          processedData.weight = Number(processedData.weight)
        }
        if (processedData.fixed !== undefined) {
          processedData.fixed = Number(processedData.fixed)
        }
        if (processedData.is_adopted !== undefined) {
          processedData.is_adopted = Number(processedData.is_adopted)
        }
        if (processedData.store_id !== undefined) {
          processedData.store_id = Number(processedData.store_id)
        }

        console.log('處理後的更新數據:', processedData)

        const response = await fetchApi(`/api/admin/pets/${currentPet.id}`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
        })

        if (response.success) {
          console.log('更新寵物成功，結果:', response)

          // 更新寵物列表
          setPets((prev) =>
            prev.map((p) =>
              p.id === currentPet.id
                ? {
                    ...p,
                    ...processedData,
                  }
                : p
            )
          )

          showToast(
            'success',
            '更新成功',
            `寵物 ${formData.name} 資料已成功更新`
          )
        } else {
          throw new Error(response.message || '更新寵物失敗')
        }
      }

      // 關閉模態框
      setShowModal(false)
    } catch (error: any) {
      console.error('提交寵物資料時發生錯誤:', error)
      showToast(
        'error',
        '操作失敗',
        error instanceof Error ? error.message : '無法完成操作，請稍後再試'
      )
    }
  }

  // 使用 useMemo 包裝 formFields，避免每次渲染時都創建新的數組
  const formFields = useMemo(
    () => [
      {
        name: 'name',
        label: '寵物名稱',
        type: 'text' as const,
        required: true,
      },
      {
        name: 'gender',
        label: '性別',
        type: 'select' as const,
        options: GENDER_OPTIONS,
        required: true,
      },
      {
        name: 'species',
        label: '物種',
        type: 'select' as const,
        options: SPECIES_OPTIONS,
        required: true,
      },
      {
        name: 'variety',
        label: '品種',
        type: 'text' as const,
        required: true,
      },
      {
        name: 'birthday',
        label: '出生日期',
        type: 'date' as const,
        required: false,
      },
      {
        name: 'weight',
        label: '體重(kg)',
        type: 'number' as const,
        required: false,
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
        options: FIXED_OPTIONS,
        required: false,
        defaultValue: 0,
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
        options: storeOptions,
        required: true,
      },
      {
        name: 'is_adopted',
        label: '領養狀態',
        type: 'select' as const,
        options: ADOPTED_OPTIONS,
        required: true,
        defaultValue: 0,
      },
      {
        name: 'main_photo',
        label: '主要照片URL',
        type: 'text' as const,
        required: false,
        defaultValue: '/images/default_no_pet.jpg',
      },
    ],
    [storeOptions]
  )

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

  // 處理導出
  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      showToast('info', '導出中', '正在準備導出數據...')

      const response = await fetchApi(
        `/api/admin/pets/export?format=${format}`,
        {
          method: 'GET',
        }
      )

      if (response.success) {
        // 創建一個臨時鏈接並點擊它來下載文件
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.setAttribute('download', `pets_export.${format}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('success', '導出成功', `已成功導出 ${pets.length} 條寵物記錄`)
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

      const response = await fetchApi('/api/admin/pets/import', {
        method: 'POST',
        body: formData,
      })

      if (response.success) {
        setImportResult(response)
        showToast('success', '導入成功', response.message)
        fetchPets()
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

  // 處理批量刪除
  const handleBatchDelete = (selectedRows: Pet[]) => {
    if (selectedRows.length === 0) return

    confirm({
      title: '批量刪除寵物',
      message: `確定要刪除選中的 ${selectedRows.length} 個寵物嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          showToast('info', '處理中', '正在刪除選中的寵物...')

          // 創建一個包含所有刪除操作的 Promise 數組
          const deletePromises = selectedRows.map((pet) =>
            fetchApi(`/api/admin/pets/${pet.id}`, {
              method: 'DELETE',
            })
          )

          // 等待所有刪除操作完成
          const results = await Promise.allSettled(deletePromises)

          // 計算成功和失敗的數量
          const succeeded = results.filter(
            (r) => r.status === 'fulfilled'
          ).length
          const failed = results.length - succeeded

          // 更新寵物列表
          if (succeeded > 0) {
            // 從列表中移除已刪除的寵物
            const deletedIds = selectedRows.map((pet) => pet.id)
            setPets(pets.filter((pet) => !deletedIds.includes(pet.id)))

            showToast(
              'success',
              '批量刪除完成',
              `成功刪除 ${succeeded} 個寵物${
                failed > 0 ? `，${failed} 個刪除失敗` : ''
              }`
            )
          } else {
            showToast('error', '批量刪除失敗', '所有寵物刪除操作均失敗')
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

  return (
    <AdminPageLayout title="寵物管理" stats={petStats} actions={pageActions}>
      <AdminSection title="寵物列表">
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

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">載入中...</span>
              </div>
              <p className="mt-2">載入寵物資料中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-3">
              {/* 錯誤訊息已在上方顯示，這裡不需要重複顯示 */}
            </div>
          ) : (
            <DataTable
              data={filteredPets.length > 0 ? filteredPets : pets}
              columns={columns}
              actions={renderActions}
              itemsPerPage={10}
              searchable={true}
              searchKeys={['name', 'species', 'variety', 'gender']}
              onRowClick={(pet) => router.push(`/admin/pets/${pet.id}`)}
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
        title={modalMode === 'add' ? '新增寵物' : '編輯寵物'}
        onSubmit={handleSubmit}
        initialData={currentPet || undefined}
        fields={formFields}
      />
    </AdminPageLayout>
  )
}

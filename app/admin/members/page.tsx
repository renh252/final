'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button, Alert, Badge, Form, Table, InputGroup } from 'react-bootstrap'
import {
  Eye,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Plus,
  Download,
  Upload,
  Search,
} from 'lucide-react'
import DataTable from '../_components/DataTable'
import type { Column } from '../_components/DataTable'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import Cookies from 'js-cookie'
import { fetchApi } from '@/app/admin/_lib/api'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useTheme } from '@/app/admin/ThemeContext'
import { withAuth } from '@/app/admin/_hooks/useAuth'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import LoadingSpinner from '@/app/admin/_components/LoadingSpinner'

interface Member {
  user_id: number
  user_email: string
  user_name: string
  user_number: string
  user_address: string
  user_birthday: string | null
  user_level: string | null
  profile_picture: string | null
  user_status: string | null
}

const STATUS_OPTIONS = [
  { value: '正常', label: '正常' },
  { value: '禁言', label: '禁言' },
]

const LEVEL_OPTIONS = [
  { value: '愛心小天使', label: '愛心小天使' },
  { value: '乾爹乾媽', label: '乾爹乾媽' },
]

interface NewMemberForm {
  user_email: string
  user_name: string
  user_number: string
  user_address: string
  user_level: string
  user_status: string
  password: string
}

interface MembersPageProps {
  auth: {
    id: number
    role: string
    perms: string[]
  }
  can: (perm: string) => boolean
}

function MembersPage({ auth, can }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberDetail, setMemberDetail] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newMember, setNewMember] = useState<NewMemberForm>({
    user_email: '',
    user_name: '',
    user_number: '',
    user_address: '',
    user_level: '愛心小天使',
    user_status: '正常',
    password: '',
  })
  const [editMember, setEditMember] = useState<any>({
    user_email: '',
    user_name: '',
    user_number: '',
    user_address: '',
    user_level: '',
    user_status: '',
    user_birthday: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchApi('/api/admin/members')

      // 處理多種可能的響應格式
      if (response.members && Array.isArray(response.members)) {
        // 格式 1: { members: [...] }
        setMembers(response.members)
      } else if (response.data && Array.isArray(response.data)) {
        // 格式 2: { data: [...] }
        setMembers(response.data)
      } else if (Array.isArray(response)) {
        // 格式 3: 直接是數組
        setMembers(response)
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取會員列表時發生錯誤:', error)
      setError(error.message || '獲取會員列表失敗')
      showToast('error', '錯誤', error.message || '獲取會員列表失敗')
    } finally {
      setLoading(false)
    }
  }

  // 處理查看會員詳情
  const handleView = async (member: Member) => {
    setSelectedMember(member)
    setShowDetailModal(true)
    setLoadingDetail(true)

    try {
      const response = await fetchApi(`/api/admin/members/${member.user_id}`)

      // 處理多種可能的響應格式
      if (response.member) {
        setMemberDetail(response.member)
      } else if (response.data) {
        setMemberDetail(response.data)
      } else if (Object.keys(response).length > 0 && response.user_id) {
        // 如果直接返回會員資料物件
        setMemberDetail(response)
      } else {
        throw new Error('獲取會員詳情失敗')
      }
    } catch (error: any) {
      console.error('獲取會員詳情時發生錯誤:', error)
      showToast('error', '錯誤', error.message || '無法獲取會員詳情')
    } finally {
      setLoadingDetail(false)
    }
  }

  // 處理編輯會員
  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setEditMember({
      user_email: member.user_email || '',
      user_name: member.user_name || '',
      user_number: member.user_number || '',
      user_address: member.user_address || '',
      user_level: member.user_level || '愛心小天使',
      user_status: member.user_status || '正常',
      user_birthday: member.user_birthday || '',
    })
    setEditFormErrors({})
    setShowEditModal(true)
  }

  // 處理編輯表單變更
  const handleEditFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement
    const { name, value } = target
    setEditMember((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 清除該欄位的錯誤訊息
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // 驗證編輯表單
  const validateEditForm = () => {
    const errors: Record<string, string> = {}

    if (!editMember.user_email) {
      errors.user_email = '請輸入電子郵件'
    } else if (!/\S+@\S+\.\S+/.test(editMember.user_email)) {
      errors.user_email = '請輸入有效的電子郵件格式'
    }

    if (!editMember.user_name) {
      errors.user_name = '請輸入姓名'
    }

    if (editMember.user_number && !/^\d{10}$/.test(editMember.user_number)) {
      errors.user_number = '請輸入有效的10位數字電話號碼'
    }

    setEditFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 處理表單提交
  const handleSubmitEdit = async () => {
    if (!selectedMember || !validateEditForm()) {
      return
    }

    setIsEditing(true)

    try {
      const response = await fetchApi(
        `/api/admin/members/${selectedMember.user_id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editMember),
        }
      )

      if (response.success) {
        // 更新會員列表
        setMembers(
          members.map((m) =>
            m.user_id === selectedMember.user_id ? { ...m, ...editMember } : m
          )
        )

        showToast(
          'success',
          '更新成功',
          `會員 ${editMember.user_name} 資料已更新`
        )
        setShowEditModal(false)
      } else {
        throw new Error(response.message || '更新會員資料失敗')
      }
    } catch (error: any) {
      console.error('更新會員資料時發生錯誤:', error)
      showToast(
        'error',
        '更新失敗',
        error.message || '無法更新會員資料，請稍後再試'
      )

      if (error.errors) {
        setEditFormErrors(error.errors)
      }
    } finally {
      setIsEditing(false)
    }
  }

  // 處理刪除會員
  const handleDelete = (member: Member) => {
    confirm({
      title: '刪除會員',
      message: `確定要刪除會員「${member.user_name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          const response = await fetchApi(
            `/api/admin/members/${member.user_id}`,
            {
              method: 'DELETE',
            }
          )

          if (response.success) {
            // 更新會員列表
            setMembers(members.filter((m) => m.user_id !== member.user_id))
            showToast(
              'success',
              '刪除成功',
              `會員 ${member.user_name} 已成功刪除`
            )
          } else {
            throw new Error(response.message || '刪除會員失敗')
          }
        } catch (error: any) {
          console.error('刪除會員時發生錯誤:', error)
          showToast(
            'error',
            '刪除失敗',
            error.message || '無法刪除會員，請稍後再試'
          )
        }
      },
    })
  }

  // 處理變更會員狀態
  const handleToggleStatus = (member: Member) => {
    const newStatus = member.user_status === '正常' ? '禁言' : '正常'
    const action = newStatus === '禁言' ? '禁言' : '解除禁言'

    confirm({
      title: `${action}會員`,
      message: `確定要${action}會員「${member.user_name}」嗎？`,
      onConfirm: async () => {
        try {
          const response = await fetchApi(
            `/api/admin/members/${member.user_id}/status`,
            {
              method: 'PUT',
              body: JSON.stringify({ status: newStatus }),
            }
          )

          if (response.success) {
            // 更新會員列表
            setMembers(
              members.map((m) =>
                m.user_id === member.user_id
                  ? { ...m, user_status: newStatus }
                  : m
              )
            )

            showToast(
              'success',
              `${action}成功`,
              `會員 ${member.user_name} 已${action}`
            )
          } else {
            throw new Error(response.message || `${action}會員失敗`)
          }
        } catch (error: any) {
          console.error(`${action}會員時發生錯誤:`, error)
          showToast(
            'error',
            `${action}失敗`,
            error.message || `無法${action}會員，請稍後再試`
          )
        }
      },
    })
  }

  // 處理導出
  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      showToast('info', '導出中', '正在準備導出數據...')

      const response = await fetchApi(
        `/api/admin/members/export?format=${format}`,
        {
          method: 'GET',
        }
      )

      if (response.success) {
        // 創建一個臨時鏈接並點擊它來下載文件
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.setAttribute('download', `members_export.${format}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast(
          'success',
          '導出成功',
          `已成功導出 ${members.length} 條會員記錄`
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

      const response = await fetchApi('/api/admin/members/import', {
        method: 'POST',
        body: formData,
      })

      if (response.success) {
        setImportResult(response)
        showToast('success', '導入成功', response.message)
        fetchMembers()
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
  const handleBatchDelete = (selectedRows: Member[]) => {
    if (selectedRows.length === 0) return

    confirm({
      title: '批量刪除會員',
      message: `確定要刪除選中的 ${selectedRows.length} 個會員嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          showToast('info', '處理中', '正在刪除選中的會員...')

          // 創建一個包含所有刪除操作的 Promise 數組
          const deletePromises = selectedRows.map((member) =>
            fetchApi(`/api/admin/members/${member.user_id}`, {
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

          // 更新會員列表
          if (succeeded > 0) {
            // 從列表中移除已刪除的會員
            const deletedIds = selectedRows.map((member) => member.user_id)
            setMembers(
              members.filter((member) => !deletedIds.includes(member.user_id))
            )

            showToast(
              'success',
              '批量刪除完成',
              `成功刪除 ${succeeded} 個會員${
                failed > 0 ? `，${failed} 個刪除失敗` : ''
              }`
            )
          } else {
            showToast('error', '批量刪除失敗', '所有會員刪除操作均失敗')
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

  // 渲染操作按鈕
  const renderActions = (member: Member) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleView(member)}
        title="查看詳情"
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEdit(member)}
        title="編輯會員"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDelete(member)}
        title="刪除會員"
      >
        <Trash2 size={16} />
      </Button>
      <Button
        variant={
          member.user_status === '正常' ? 'outline-warning' : 'outline-success'
        }
        size="sm"
        onClick={() => handleToggleStatus(member)}
        title={member.user_status === '正常' ? '禁言會員' : '解除禁言'}
      >
        {member.user_status === '正常' ? (
          <UserX size={16} />
        ) : (
          <UserCheck size={16} />
        )}
      </Button>
    </div>
  )

  // 會員表格列定義
  const columns: Column[] = [
    {
      key: 'user_id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'user_name',
      label: '姓名',
      sortable: true,
    },
    {
      key: 'user_email',
      label: '電子郵件',
      sortable: true,
    },
    {
      key: 'user_number',
      label: '電話',
    },
    {
      key: 'user_level',
      label: '等級',
      filterable: true,
      filterOptions: LEVEL_OPTIONS,
      render: (value) => value || '愛心小天使',
    },
    {
      key: 'user_status',
      label: '狀態',
      filterable: true,
      filterOptions: STATUS_OPTIONS,
      render: (value) => (
        <Badge bg={value === '正常' ? 'success' : 'danger'}>
          {value || '正常'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      render: (_, item) => renderActions(item as Member),
    },
  ]

  // 會員統計數據
  const memberStats = [
    {
      title: '總會員數',
      count: members.length,
      color: 'primary',
      icon: <Eye size={24} />,
    },
    {
      title: '正常會員',
      count: members.filter((m) => m.user_status === '正常' || !m.user_status)
        .length,
      color: 'success',
      icon: <UserCheck size={24} />,
    },
    {
      title: '禁言會員',
      count: members.filter((m) => m.user_status === '禁言').length,
      color: 'danger',
      icon: <UserX size={24} />,
    },
  ]

  // 根據搜尋關鍵字過濾會員
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members

    return members.filter(
      (member) =>
        member.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user_id.toString().includes(searchTerm)
    )
  }, [members, searchTerm])

  // 打開導入模態框
  const openImportModal = () => {
    setImportError(null)
    setImportResult(null)
    setShowImportModal(true)
  }

  // 打開導出模態框
  const openExportModal = () => {
    setShowExportModal(true)
  }

  // 打開新增會員模態框
  const openAddModal = () => {
    setNewMember({
      user_email: '',
      user_name: '',
      user_number: '',
      user_address: '',
      user_level: '愛心小天使',
      user_status: '正常',
      password: '',
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  // 處理表單欄位變更
  const handleFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement
    const { name, value } = target
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 清除該欄位的錯誤訊息
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // 驗證表單
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!newMember.user_email) {
      errors.user_email = '請輸入電子郵件'
    } else if (!/\S+@\S+\.\S+/.test(newMember.user_email)) {
      errors.user_email = '請輸入有效的電子郵件格式'
    }

    if (!newMember.user_name) {
      errors.user_name = '請輸入姓名'
    }

    if (!newMember.password) {
      errors.password = '請輸入密碼'
    } else if (newMember.password.length < 6) {
      errors.password = '密碼至少需要6個字元'
    }

    if (newMember.user_number && !/^\d{10}$/.test(newMember.user_number)) {
      errors.user_number = '請輸入有效的10位數字電話號碼'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 處理新增會員
  const handleAddMember = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetchApi('/api/admin/members', {
        method: 'POST',
        body: JSON.stringify(newMember),
      })

      if (response.success) {
        showToast(
          'success',
          '新增成功',
          `會員 ${newMember.user_name} 已成功新增`
        )
        setShowAddModal(false)
        fetchMembers() // 重新獲取會員列表
      } else {
        throw new Error(response.message || '新增會員失敗')
      }
    } catch (error: any) {
      console.error('新增會員時發生錯誤:', error)
      showToast(
        'error',
        '新增失敗',
        error.message || '無法新增會員，請稍後再試'
      )

      // 如果是欄位驗證錯誤，顯示在表單中
      if (error.errors) {
        setFormErrors(error.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 處理檔案選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleImport(file)
      setShowImportModal(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <AdminPageLayout title="會員管理">
      <AdminSection>
        <div className="row mb-4">
          {memberStats.map((stat, index) => (
            <div className="col-md-4" key={index}>
              <AdminCard title={stat.title}>
                <div className="d-flex align-items-center">
                  <div
                    className={`me-3 rounded p-3 bg-${stat.color} bg-opacity-10`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="mb-0">{stat.count}</h3>
                  </div>
                </div>
              </AdminCard>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>會員列表</h2>
          <div className="d-flex gap-2">
            {can(PERMISSIONS.MEMBERS.WRITE) && (
              <Button
                variant="primary"
                className="d-flex align-items-center gap-1"
                onClick={openAddModal}
              >
                <Plus size={16} /> 新增會員
              </Button>
            )}
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center gap-1"
              onClick={openExportModal}
            >
              <Download size={16} /> 導出會員
            </Button>
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center gap-1"
              onClick={openImportModal}
            >
              <Upload size={16} /> 導入會員
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="搜尋會員 (姓名、Email或ID)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary">
            <Search size={20} />
          </Button>
        </InputGroup>

        <DataTable
          columns={columns}
          data={members}
          loading={loading}
          searchable={true}
          searchKeys={['user_name', 'user_email', 'user_number']}
          batchActions={batchActions}
          selectable={true}
          actions={renderActions}
          itemsPerPage={10}
        />
      </AdminSection>

      {/* 會員詳情模態框 */}
      <ModalForm
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        title="會員詳情"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            關閉
          </Button>
        }
      >
        {loadingDetail ? (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        ) : memberDetail ? (
          <div>
            <div className="row mb-4">
              <div className="col-md-3 text-center">
                {memberDetail.profile_picture ? (
                  <img
                    src={memberDetail.profile_picture}
                    alt={memberDetail.user_name}
                    className="img-fluid rounded-circle mb-2"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    className="bg-secondary rounded-circle mx-auto d-flex justify-content-center align-items-center text-white"
                    style={{
                      width: '120px',
                      height: '120px',
                      fontSize: '2.5rem',
                    }}
                  >
                    {memberDetail.user_name?.charAt(0) || '?'}
                  </div>
                )}
                <Badge
                  bg={
                    memberDetail.user_status === '正常' ? 'success' : 'danger'
                  }
                  className="mt-2"
                >
                  {memberDetail.user_status || '正常'}
                </Badge>
              </div>
              <div className="col-md-9">
                <h4>{memberDetail.user_name}</h4>
                <p className="text-muted mb-1">
                  會員ID: {memberDetail.user_id}
                </p>
                <p className="text-muted mb-1">
                  等級: {memberDetail.user_level || '愛心小天使'}
                </p>
                <p className="text-muted mb-1">
                  註冊時間: {new Date(memberDetail.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header">基本資料</div>
                  <div className="card-body">
                    <p className="mb-2">
                      <strong>電子郵件:</strong> {memberDetail.user_email}
                    </p>
                    <p className="mb-2">
                      <strong>電話:</strong>{' '}
                      {memberDetail.user_number || '未提供'}
                    </p>
                    <p className="mb-2">
                      <strong>地址:</strong>{' '}
                      {memberDetail.user_address || '未提供'}
                    </p>
                    <p className="mb-0">
                      <strong>生日:</strong>{' '}
                      {memberDetail.user_birthday || '未提供'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header">活動摘要</div>
                  <div className="card-body">
                    <p className="mb-2">
                      <strong>總訂單數:</strong> {memberDetail.order_count || 0}
                    </p>
                    <p className="mb-2">
                      <strong>領養次數:</strong>{' '}
                      {memberDetail.adoption_count || 0}
                    </p>
                    <p className="mb-2">
                      <strong>捐款總額:</strong>{' '}
                      {memberDetail.donation_amount
                        ? `$${memberDetail.donation_amount}`
                        : '$0'}
                    </p>
                    <p className="mb-0">
                      <strong>發文數:</strong> {memberDetail.post_count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h5>最近活動</h5>
              <Table responsive striped size="sm">
                <thead>
                  <tr>
                    <th>時間</th>
                    <th>類型</th>
                    <th>詳情</th>
                  </tr>
                </thead>
                <tbody>
                  {memberDetail.recent_activities &&
                  memberDetail.recent_activities.length > 0 ? (
                    memberDetail.recent_activities.map(
                      (activity: any, index: number) => (
                        <tr key={index}>
                          <td>{new Date(activity.time).toLocaleString()}</td>
                          <td>{activity.type}</td>
                          <td>{activity.detail}</td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">
                        沒有活動記錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        ) : (
          <Alert variant="danger">無法載入會員詳情</Alert>
        )}
      </ModalForm>

      {/* 導入會員模態框 */}
      <ModalForm
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        title="導入會員資料"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowImportModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? '導入中...' : '選擇檔案'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
            />
          </>
        }
      >
        <div>
          <p>請選擇要導入的會員資料檔案，支援的格式有：</p>
          <ul>
            <li>CSV 檔案 (.csv)</li>
            <li>Excel 檔案 (.xlsx, .xls)</li>
            <li>JSON 檔案 (.json)</li>
          </ul>
          <p>檔案必須包含以下欄位：</p>
          <ul>
            <li>user_email (必填)</li>
            <li>user_name (必填)</li>
            <li>user_number (選填)</li>
            <li>user_address (選填)</li>
            <li>user_level (選填)</li>
          </ul>
          {importError && <Alert variant="danger">{importError}</Alert>}
          {importResult && (
            <Alert variant="success">
              成功導入 {importResult.success} 筆資料
              {importResult.failed > 0 &&
                `，${importResult.failed} 筆資料導入失敗`}
            </Alert>
          )}
        </div>
      </ModalForm>

      {/* 導出會員模態框 */}
      <ModalForm
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        title="導出會員資料"
        footer={
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            關閉
          </Button>
        }
      >
        <div>
          <p>請選擇要導出的格式：</p>
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="outline-primary"
              onClick={() => {
                handleExport('csv')
                setShowExportModal(false)
              }}
            >
              CSV 檔案
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => {
                handleExport('excel')
                setShowExportModal(false)
              }}
            >
              Excel 檔案
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => {
                handleExport('json')
                setShowExportModal(false)
              }}
            >
              JSON 檔案
            </Button>
          </div>
        </div>
      </ModalForm>

      {/* 新增會員模態框 */}
      <ModalForm
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title="新增會員"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? '處理中...' : '新增'}
            </Button>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>電子郵件 *</Form.Label>
            <Form.Control
              type="email"
              name="user_email"
              value={newMember.user_email}
              onChange={handleFormChange}
              isInvalid={!!formErrors.user_email}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.user_email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>姓名 *</Form.Label>
            <Form.Control
              type="text"
              name="user_name"
              value={newMember.user_name}
              onChange={handleFormChange}
              isInvalid={!!formErrors.user_name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.user_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>密碼 *</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={newMember.password}
              onChange={handleFormChange}
              isInvalid={!!formErrors.password}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.password}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              密碼必須至少包含6個字元
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>電話</Form.Label>
            <Form.Control
              type="tel"
              name="user_number"
              value={newMember.user_number}
              onChange={handleFormChange}
              isInvalid={!!formErrors.user_number}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.user_number}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>地址</Form.Label>
            <Form.Control
              type="text"
              name="user_address"
              value={newMember.user_address}
              onChange={handleFormChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>會員等級</Form.Label>
            <Form.Select
              name="user_level"
              value={newMember.user_level}
              onChange={handleFormChange}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>狀態</Form.Label>
            <Form.Select
              name="user_status"
              value={newMember.user_status}
              onChange={handleFormChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </ModalForm>

      {/* 編輯會員模態框 */}
      <ModalForm
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="編輯會員"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitEdit}
              disabled={isEditing}
            >
              {isEditing ? '處理中...' : '儲存變更'}
            </Button>
          </>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>電子郵件 *</Form.Label>
            <Form.Control
              type="email"
              name="user_email"
              value={editMember.user_email}
              onChange={handleEditFormChange}
              isInvalid={!!editFormErrors.user_email}
            />
            <Form.Control.Feedback type="invalid">
              {editFormErrors.user_email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>姓名 *</Form.Label>
            <Form.Control
              type="text"
              name="user_name"
              value={editMember.user_name}
              onChange={handleEditFormChange}
              isInvalid={!!editFormErrors.user_name}
            />
            <Form.Control.Feedback type="invalid">
              {editFormErrors.user_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>電話</Form.Label>
            <Form.Control
              type="tel"
              name="user_number"
              value={editMember.user_number}
              onChange={handleEditFormChange}
              isInvalid={!!editFormErrors.user_number}
            />
            <Form.Control.Feedback type="invalid">
              {editFormErrors.user_number}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>地址</Form.Label>
            <Form.Control
              type="text"
              name="user_address"
              value={editMember.user_address}
              onChange={handleEditFormChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>生日</Form.Label>
            <Form.Control
              type="date"
              name="user_birthday"
              value={
                editMember.user_birthday
                  ? editMember.user_birthday.substring(0, 10)
                  : ''
              }
              onChange={handleEditFormChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>會員等級</Form.Label>
            <Form.Select
              name="user_level"
              value={editMember.user_level}
              onChange={handleEditFormChange}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>狀態</Form.Label>
            <Form.Select
              name="user_status"
              value={editMember.user_status}
              onChange={handleEditFormChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </ModalForm>
    </AdminPageLayout>
  )
}

export default withAuth(MembersPage, PERMISSIONS.MEMBERS.READ)

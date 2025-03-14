'use client'

import React, { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchApi('/api/admin/members')
      if (response.members && Array.isArray(response.members)) {
        setMembers(response.members)
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

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 處理查看會員詳情
  const handleView = (member: Member) => {
    // TODO: 實作查看會員詳情
    showToast('info', '功能開發中', '會員詳情功能正在開發中')
  }

  // 處理編輯會員
  const handleEdit = (member: Member) => {
    // TODO: 實作編輯會員資料
    showToast('info', '功能開發中', '編輯會員功能正在開發中')
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

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>會員管理</h1>
        {can(PERMISSIONS.MEMBERS.WRITE) && (
          <Button variant="primary">新增會員</Button>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          {/* 搜尋欄位 */}
          <div className="mb-4">
            <InputGroup>
              <Form.Control
                placeholder="搜尋會員..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary">
                <Search size={20} />
              </Button>
            </InputGroup>
          </div>

          {/* 會員列表 */}
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>Email</th>
                <th>電話</th>
                <th>等級</th>
                <th>狀態</th>
                <th>註冊日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>{/* 這裡之後會加入實際的會員資料 */}</tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default withAuth(MembersPage, PERMISSIONS.MEMBERS.READ)

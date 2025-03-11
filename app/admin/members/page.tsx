'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { Eye, Edit, Trash2 } from 'lucide-react'
import DataTable from '../_components/DataTable'
import type { Column } from '../_components/DataTable'
import { useToast } from '@/app/admin/_components/Toast'
import Cookies from 'js-cookie'

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

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const token = Cookies.get('admin_token')
      console.log('使用的 token:', token)

      if (!token) {
        console.error('未找到 token')
        showToast('error', '錯誤', '請先登入')
        window.location.href = '/admin/login'
        return
      }

      const response = await fetch('/api/admin/members', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error('認證失敗')
          showToast('error', '錯誤', '認證失敗，請重新登入')
          window.location.href = '/admin/login'
          return
        }
        if (response.status === 403) {
          console.error('沒有權限')
          showToast('error', '錯誤', '沒有權限訪問此資源')
          return
        }
        throw new Error('獲取會員列表失敗')
      }

      const data = await response.json()
      console.log('獲取的會員數據:', data)

      if (data.members && Array.isArray(data.members)) {
        setMembers(data.members)
      } else {
        console.error('返回的數據格式不正確:', data)
        showToast('error', '錯誤', '數據格式錯誤')
      }
    } catch (error) {
      console.error('獲取會員列表時發生錯誤:', error)
      showToast('error', '錯誤', '獲取會員列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (member: Member): React.ReactNode => {
    // TODO: 實作查看會員詳情
    return null
  }

  const handleEdit = (member: Member): React.ReactNode => {
    // TODO: 實作編輯會員資料
    return null
  }

  const handleDelete = async (member: Member): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('刪除失敗')
      }

      showToast('success', '成功', '會員已刪除')
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id))
    } catch (error) {
      console.error('刪除會員時發生錯誤:', error)
      showToast('error', '錯誤', '刪除會員失敗')
    }
  }

  const columns = useMemo<Column[]>(
    () => [
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
        sortable: true,
      },
      {
        key: 'user_address',
        label: '地址',
        sortable: true,
      },
      {
        key: 'user_birthday',
        label: '生日',
        sortable: true,
      },
      {
        key: 'user_level',
        label: '等級',
        sortable: true,
        render: (value: string) => (
          <span
            className={`badge ${
              value === '乾爹乾媽' ? 'bg-success' : 'bg-primary'
            }`}
          >
            {value || '-'}
          </span>
        ),
      },
      {
        key: 'user_status',
        label: '狀態',
        sortable: true,
        render: (value: string) => (
          <span
            className={`badge ${value === '正常' ? 'bg-success' : 'bg-danger'}`}
          >
            {value || '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '操作',
        render: (_, member: Member) => (
          <div className="d-flex gap-2">
            <Button variant="info" size="sm" onClick={() => handleView(member)}>
              <Eye size={16} />
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleEdit(member)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(member)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">會員管理</h1>
      <DataTable
        data={members}
        columns={columns}
        loading={loading}
        searchable
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  )
}

export default MembersPage

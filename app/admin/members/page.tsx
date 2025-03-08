'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap'
import { Plus, Edit, Trash, Eye } from 'lucide-react'
import DataTable from '../components/DataTable'
import ModalForm from '../components/ModalForm'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { useTheme } from '../ThemeContext'

// 模擬會員數據
const MOCK_MEMBERS = [
  {
    id: 1,
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
    status: 'active',
    registeredAt: '2023-01-15',
    lastLogin: '2023-03-10',
  },
  {
    id: 2,
    name: '李小花',
    email: 'lee@example.com',
    phone: '0923-456-789',
    status: 'active',
    registeredAt: '2023-02-20',
    lastLogin: '2023-03-15',
  },
  {
    id: 3,
    name: '張大山',
    email: 'chang@example.com',
    phone: '0934-567-890',
    status: 'inactive',
    registeredAt: '2023-01-05',
    lastLogin: '2023-02-01',
  },
  {
    id: 4,
    name: '林小雨',
    email: 'lin@example.com',
    phone: '0945-678-901',
    status: 'active',
    registeredAt: '2023-03-01',
    lastLogin: '2023-03-18',
  },
  {
    id: 5,
    name: '陳大海',
    email: 'chen@example.com',
    phone: '0956-789-012',
    status: 'blocked',
    registeredAt: '2022-12-10',
    lastLogin: '2023-01-20',
  },
]

// 會員狀態選項
const STATUS_OPTIONS = [
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '未啟用' },
  { value: 'blocked', label: '已封鎖' },
]

export default function MembersPage() {
  const [members, setMembers] = useState(MOCK_MEMBERS)
  const [showModal, setShowModal] = useState(false)
  const [currentMember, setCurrentMember] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 表格列定義
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '姓名', sortable: true },
    { key: 'email', label: '電子郵件', sortable: true },
    { key: 'phone', label: '電話', sortable: true },
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
            statusText = '正常'
            break
          case 'inactive':
            badgeClass = 'bg-warning'
            statusText = '未啟用'
            break
          case 'blocked':
            badgeClass = 'bg-danger'
            statusText = '已封鎖'
            break
          default:
            badgeClass = 'bg-secondary'
            statusText = '未知'
        }

        return <span className={`badge ${badgeClass}`}>{statusText}</span>
      },
    },
    {
      key: 'registeredAt',
      label: '註冊日期',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
    {
      key: 'lastLogin',
      label: '最後登入',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
  ]

  // 表單欄位定義
  const formFields = [
    {
      name: 'name',
      label: '姓名',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入會員姓名',
    },
    {
      name: 'email',
      label: '電子郵件',
      type: 'email' as const,
      required: true,
      placeholder: '請輸入電子郵件',
      validation: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? null : '請輸入有效的電子郵件地址'
      },
    },
    {
      name: 'phone',
      label: '電話',
      type: 'text' as const,
      required: true,
      placeholder: '請輸入電話號碼',
      validation: (value: string) => {
        const phoneRegex = /^[0-9\-]{10,}$/
        return phoneRegex.test(value) ? null : '請輸入有效的電話號碼'
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
      name: 'registeredAt',
      label: '註冊日期',
      type: 'date' as const,
      required: true,
    },
  ]

  // 處理新增會員
  const handleAddMember = () => {
    setCurrentMember(null)
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯會員
  const handleEditMember = (member: any) => {
    setCurrentMember(member)
    setModalMode('edit')
    setShowModal(true)
  }

  // 處理查看會員詳情
  const handleViewMember = (member: any) => {
    // 這裡可以實現查看詳情的邏輯，例如導航到詳情頁面
    showToast('info', '會員詳情', `查看會員 ${member.name} 的詳細資料`)
  }

  // 處理刪除會員
  const handleDeleteMember = (member: any) => {
    confirm({
      title: '刪除會員',
      message: `確定要刪除會員 ${member.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬刪除操作
        setMembers((prev) => prev.filter((m) => m.id !== member.id))
        showToast('success', '刪除成功', `會員 ${member.name} 已成功刪除`)
      },
    })
  }

  // 處理表單提交
  const handleSubmit = async (formData: Record<string, any>) => {
    // 模擬API請求延遲
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (modalMode === 'add') {
      // 模擬新增會員
      const newMember = {
        id: Math.max(...members.map((m) => m.id)) + 1,
        ...formData,
        lastLogin: new Date().toISOString().split('T')[0],
      }
      setMembers((prev) => [...prev, newMember])
      showToast('success', '新增成功', `會員 ${formData.name} 已成功新增`)
    } else {
      // 模擬更新會員
      setMembers((prev) =>
        prev.map((m) => (m.id === currentMember.id ? { ...m, ...formData } : m))
      )
      showToast('success', '更新成功', `會員 ${formData.name} 資料已成功更新`)
    }
  }

  // 渲染操作按鈕
  const renderActions = (member: any) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleViewMember(member)}
        title="查看詳情"
      >
        <Eye size={16} />
      </Button>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => handleEditMember(member)}
        title="編輯會員"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteMember(member)}
        title="刪除會員"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  return (
    <div className="members-page">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">會員管理</h2>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>會員列表</div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddMember}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" /> 新增會員
              </Button>
            </Card.Header>
            <Card.Body>
              <DataTable
                columns={columns}
                data={members}
                searchable={true}
                searchKeys={['name', 'email', 'phone']}
                actions={renderActions}
                onRowClick={handleViewMember}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 會員表單模態框 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增會員' : '編輯會員'}
        fields={formFields}
        onSubmit={handleSubmit}
        initialData={currentMember}
        submitText={modalMode === 'add' ? '新增' : '更新'}
      />
    </div>
  )
}

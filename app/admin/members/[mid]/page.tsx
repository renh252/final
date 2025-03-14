'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Tab, Nav, Form } from 'react-bootstrap'
import { ArrowLeft, Save, UserX } from 'lucide-react'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '../../ThemeContext'
import Link from 'next/link'
import { withAuth } from '@/app/admin/_hooks/useAuth'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { useParams, useRouter } from 'next/navigation'
import ModalForm from '@/app/admin/_components/ModalForm'
import LoadingSpinner from '@/app/admin/_components/LoadingSpinner'

// 模擬會員數據
const MOCK_MEMBER = {
  id: 1,
  name: '王小明',
  email: 'wang@example.com',
  phone: '0912-345-678',
  status: 'active',
  registeredAt: '2023-01-15',
  lastLogin: '2023-03-10',
  address: '台北市信義區忠孝東路五段123號',
  avatar: 'https://via.placeholder.com/150',
  orders: [
    { id: 101, date: '2023-02-15', total: 1200, status: '已完成' },
    { id: 102, date: '2023-03-05', total: 850, status: '已完成' },
  ],
  pets: [
    { id: 201, name: '小花', species: '貓', variety: '米克斯' },
    { id: 202, name: '大黑', species: '狗', variety: '拉布拉多' },
  ],
  donations: [
    { id: 301, date: '2023-01-20', amount: 500 },
    { id: 302, date: '2023-02-25', amount: 1000 },
  ],
  posts: [
    { id: 401, title: '我家的貓咪真可愛', date: '2023-02-10' },
    { id: 402, title: '狗狗健康飲食指南', date: '2023-03-01' },
  ],
}

interface Member {
  id: number
  user_name: string
  user_email: string
  user_number: string
  user_level: number
  user_status: number
  created_at: string
  last_login_at: string
}

interface MemberDetailPageProps {
  auth: {
    id: number
    role: string
    perms: string[]
  }
  can: (perm: string) => boolean
}

function MemberDetailPage({ auth, can }: MemberDetailPageProps) {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchMember()
  }, [params.mid])

  const fetchMember = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/members/${params.mid}`)
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }
      setMember(data.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '獲取會員資料失敗')
      showToast(
        'error',
        '錯誤',
        error instanceof Error ? error.message : '獲取會員資料失敗'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (formData: any) => {
    try {
      const response = await fetch(`/api/admin/members/${params.mid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }
      showToast('success', '成功', '會員資料更新成功')
      setShowEditModal(false)
      fetchMember()
    } catch (error) {
      showToast(
        'error',
        '錯誤',
        error instanceof Error ? error.message : '更新會員資料失敗'
      )
    }
  }

  const handleDelete = () => {
    if (!member) return

    confirm({
      title: '刪除會員',
      message: `確定要刪除會員「${member.user_name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/members/${params.mid}`, {
            method: 'DELETE',
          })
          const data = await response.json()
          if (!data.success) {
            throw new Error(data.message)
          }
          showToast('success', '成功', '會員已成功刪除')
          router.push('/admin/members')
        } catch (error) {
          showToast(
            'error',
            '錯誤',
            error instanceof Error ? error.message : '刪除會員失敗'
          )
        }
      },
    })
  }

  const handleToggleStatus = () => {
    if (!member) return

    const newStatus = member.user_status === 1 ? 0 : 1
    const action = newStatus === 1 ? '啟用' : '停用'

    confirm({
      title: `${action}會員`,
      message: `確定要${action}會員「${member.user_name}」嗎？`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/members/${params.mid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_status: newStatus }),
          })
          const data = await response.json()
          if (!data.success) {
            throw new Error(data.message)
          }
          showToast('success', '成功', `會員已成功${action}`)
          fetchMember()
        } catch (error) {
          showToast(
            'error',
            '錯誤',
            error instanceof Error ? error.message : `${action}會員失敗`
          )
        }
      },
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>錯誤</h4>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="alert alert-warning">
        <h4>找不到會員</h4>
        <Button variant="outline-primary" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    )
  }

  const editFormFields = [
    {
      name: 'user_name',
      label: '姓名',
      type: 'text',
      required: true,
      defaultValue: member.user_name,
    },
    {
      name: 'user_email',
      label: 'Email',
      type: 'email',
      required: true,
      defaultValue: member.user_email,
    },
    {
      name: 'user_number',
      label: '電話',
      type: 'text',
      required: true,
      defaultValue: member.user_number,
    },
    {
      name: 'user_level',
      label: '會員等級',
      type: 'select',
      required: true,
      defaultValue: member.user_level,
      options: [
        { value: 1, label: '一般會員' },
        { value: 2, label: 'VIP會員' },
      ],
    },
  ]

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>會員詳情</h1>
        <Button variant="outline-secondary" onClick={() => router.back()}>
          返回列表
        </Button>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>基本資料</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={3} className="text-muted">
                  ID
                </Col>
                <Col sm={9}>{member.id}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  姓名
                </Col>
                <Col sm={9}>{member.user_name}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  Email
                </Col>
                <Col sm={9}>{member.user_email}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  電話
                </Col>
                <Col sm={9}>{member.user_number}</Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>帳號狀態</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={3} className="text-muted">
                  會員等級
                </Col>
                <Col sm={9}>
                  <Badge bg={member.user_level === 1 ? 'primary' : 'success'}>
                    {member.user_level === 1 ? '一般會員' : 'VIP會員'}
                  </Badge>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  帳號狀態
                </Col>
                <Col sm={9}>
                  <Badge bg={member.user_status === 1 ? 'success' : 'danger'}>
                    {member.user_status === 1 ? '正常' : '停用'}
                  </Badge>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  註冊時間
                </Col>
                <Col sm={9}>{new Date(member.created_at).toLocaleString()}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={3} className="text-muted">
                  最後登入
                </Col>
                <Col sm={9}>
                  {member.last_login_at
                    ? new Date(member.last_login_at).toLocaleString()
                    : '尚未登入'}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {can(PERMISSIONS.MEMBERS.WRITE) && (
            <Card className="mb-4">
              <Card.Header>操作</Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    onClick={() => setShowEditModal(true)}
                  >
                    編輯資料
                  </Button>
                  <Button
                    variant={member.user_status === 1 ? 'danger' : 'success'}
                    onClick={handleToggleStatus}
                  >
                    {member.user_status === 1 ? '停用帳號' : '啟用帳號'}
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    刪除會員
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <ModalForm
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="編輯會員資料"
        fields={editFormFields}
        onSubmit={handleEdit}
      />
    </div>
  )
}

export default withAuth(MemberDetailPage, PERMISSIONS.MEMBERS.READ)

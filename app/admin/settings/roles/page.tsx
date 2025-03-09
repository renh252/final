'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Row,
  Col,
} from 'react-bootstrap'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Shield,
  Users,
  Settings,
  FileText,
  DollarSign,
  PawPrint,
  MessageSquare,
  Bell,
  Database,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'

// 模擬角色數據
const MOCK_ROLES = [
  {
    id: 1,
    name: '超級管理員',
    description: '擁有所有權限的最高權限角色',
    users_count: 2,
    status: 'active',
    permissions: {
      system: ['view', 'edit'],
      users: ['view', 'edit', 'create', 'delete'],
      roles: ['view', 'edit', 'create', 'delete'],
      pets: ['view', 'edit', 'create', 'delete'],
      adoptions: ['view', 'edit', 'create', 'delete'],
      products: ['view', 'edit', 'create', 'delete'],
      orders: ['view', 'edit', 'create', 'delete'],
      finance: ['view', 'edit', 'create', 'delete'],
      reports: ['view', 'edit', 'create', 'delete'],
      notifications: ['view', 'edit', 'create', 'delete'],
      logs: ['view'],
    },
  },
  {
    id: 2,
    name: '一般管理員',
    description: '具有基本管理權限的角色',
    users_count: 5,
    status: 'active',
    permissions: {
      system: ['view'],
      users: ['view', 'edit'],
      roles: ['view'],
      pets: ['view', 'edit', 'create'],
      adoptions: ['view', 'edit'],
      products: ['view', 'edit'],
      orders: ['view', 'edit'],
      finance: ['view'],
      reports: ['view', 'edit'],
      notifications: ['view', 'create'],
      logs: ['view'],
    },
  },
  {
    id: 3,
    name: '寵物管理員',
    description: '負責寵物資訊管理的角色',
    users_count: 8,
    status: 'active',
    permissions: {
      system: [],
      users: ['view'],
      roles: [],
      pets: ['view', 'edit', 'create'],
      adoptions: ['view', 'edit'],
      products: ['view'],
      orders: [],
      finance: [],
      reports: ['view'],
      notifications: ['view'],
      logs: [],
    },
  },
]

const PERMISSION_MODULES = [
  { key: 'system', label: '系統設定', icon: Settings },
  { key: 'users', label: '用戶管理', icon: Users },
  { key: 'roles', label: '角色管理', icon: Shield },
  { key: 'pets', label: '寵物管理', icon: PawPrint },
  { key: 'adoptions', label: '認養管理', icon: Users },
  { key: 'products', label: '商品管理', icon: FileText },
  { key: 'orders', label: '訂單管理', icon: FileText },
  { key: 'finance', label: '財務管理', icon: DollarSign },
  { key: 'reports', label: '檢舉管理', icon: MessageSquare },
  { key: 'notifications', label: '通知管理', icon: Bell },
  { key: 'logs', label: '系統日誌', icon: Database },
]

const PERMISSION_ACTIONS = [
  { key: 'view', label: '查看' },
  { key: 'create', label: '新增' },
  { key: 'edit', label: '編輯' },
  { key: 'delete', label: '刪除' },
]

export default function RolesPage() {
  const [roles, setRoles] = useState(MOCK_ROLES)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    permissions: {} as Record<string, string[]>,
  })
  const { isDarkMode } = useTheme()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const handleShowModal = (role?: any) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description,
        status: role.status,
        permissions: { ...role.permissions },
      })
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        description: '',
        status: 'active',
        permissions: PERMISSION_MODULES.reduce(
          (acc, module) => ({ ...acc, [module.key]: [] }),
          {}
        ),
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRole(null)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePermissionChange = (
    module: string,
    action: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked
          ? [...(prev.permissions[module] || []), action]
          : (prev.permissions[module] || []).filter((a) => a !== action),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      if (editingRole) {
        setRoles((prev) =>
          prev.map((role) =>
            role.id === editingRole.id
              ? {
                  ...role,
                  ...formData,
                }
              : role
          )
        )
        showToast('success', '更新成功', '角色已成功更新')
      } else {
        setRoles((prev) => [
          ...prev,
          {
            id: Math.max(...prev.map((r) => r.id)) + 1,
            users_count: 0,
            ...formData,
          },
        ])
        showToast('success', '新增成功', '角色已成功新增')
      }
      handleCloseModal()
    }, 500)
  }

  const handleDelete = (role: any) => {
    confirm({
      title: '刪除角色',
      message: `確定要刪除角色「${role.name}」嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '確認刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setRoles((prev) => prev.filter((r) => r.id !== role.id))
          showToast('success', '刪除成功', '角色已成功刪除')
        }, 500)
      },
    })
  }

  const handleToggleStatus = (role: any) => {
    // 模擬API請求
    setTimeout(() => {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === role.id
            ? {
                ...r,
                status: r.status === 'active' ? 'inactive' : 'active',
              }
            : r
        )
      )
      showToast(
        'success',
        '狀態更新',
        `角色已${role.status === 'active' ? '停用' : '啟用'}`
      )
    }, 500)
  }

  return (
    <AdminPageLayout
      title="角色管理"
      actions={
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={18} className="me-2" />
          新增角色
        </Button>
      }
    >
      <div className="admin-layout-container">
        <AdminSection>
          <Card
            className={`admin-card ${isDarkMode ? 'bg-dark text-light' : ''}`}
          >
            <Card.Body>
              <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                <thead>
                  <tr>
                    <th>角色名稱</th>
                    <th>描述</th>
                    <th>使用者數</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.name}</td>
                      <td>{role.description}</td>
                      <td>{role.users_count}</td>
                      <td>
                        <Badge
                          bg={
                            role.status === 'active' ? 'success' : 'secondary'
                          }
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(role)}
                        >
                          {role.status === 'active' ? '啟用中' : '已停用'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(role)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(role)}
                            disabled={role.name === '超級管理員'}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </AdminSection>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        className={isDarkMode ? 'dark-mode' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? '編輯角色' : '新增角色'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>角色名稱</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>狀態</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">啟用</option>
                    <option value="inactive">停用</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>描述</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">權限設定</h5>
            <div className="permissions-grid">
              <Table
                bordered
                responsive
                className={isDarkMode ? 'table-dark' : ''}
              >
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>模組</th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th key={action.key} className="text-center">
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MODULES.map((module) => {
                    const Icon = module.icon
                    return (
                      <tr key={module.key}>
                        <td>
                          <div className="d-flex align-items-center">
                            <Icon size={18} className="me-2" />
                            {module.label}
                          </div>
                        </td>
                        {PERMISSION_ACTIONS.map((action) => (
                          <td key={action.key} className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={formData.permissions[
                                module.key
                              ]?.includes(action.key)}
                              onChange={(e) =>
                                handlePermissionChange(
                                  module.key,
                                  action.key,
                                  e.target.checked
                                )
                              }
                              disabled={
                                editingRole?.name === '超級管理員' &&
                                module.key === 'system'
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            <X size={18} className="me-1" />
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Save size={18} className="me-1" />
            {editingRole ? '更新' : '新增'}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminPageLayout>
  )
}

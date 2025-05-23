'use client'

import React, { useState, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Modal,
} from 'react-bootstrap'
import {
  CreditCard,
  Smartphone,
  BanknoteIcon,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import AdminPageLayout, {
  AdminSection,
} from '@/app/admin/_components/AdminPageLayout'

// 模擬支付方式數據
const MOCK_PAYMENT_METHODS = [
  {
    id: 1,
    name: '信用卡支付',
    type: 'credit_card',
    provider: 'Stripe',
    fee_rate: 2.5,
    fee_fixed: 0,
    min_amount: 100,
    max_amount: 100000,
    status: 'active',
    settings: {
      api_key: '****************************',
      secret_key: '****************************',
      webhook_url: 'https://example.com/webhook/stripe',
    },
  },
  {
    id: 2,
    name: 'LINE Pay',
    type: 'mobile_payment',
    provider: 'LINE Pay',
    fee_rate: 2.8,
    fee_fixed: 0,
    min_amount: 100,
    max_amount: 50000,
    status: 'active',
    settings: {
      channel_id: '****************************',
      channel_secret: '****************************',
      webhook_url: 'https://example.com/webhook/linepay',
    },
  },
  {
    id: 3,
    name: '銀行轉帳',
    type: 'bank_transfer',
    provider: 'Manual',
    fee_rate: 0,
    fee_fixed: 15,
    min_amount: 1000,
    max_amount: 1000000,
    status: 'active',
    settings: {
      bank_name: '測試銀行',
      account_name: '測試帳戶',
      account_number: '1234567890',
    },
  },
]

// 支付類型定義
type PaymentType = 'credit_card' | 'mobile_payment' | 'bank_transfer'

// 支付方式介面
interface PaymentMethod {
  id: number
  name: string
  type: PaymentType
  provider: string
  fee_rate: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  status: 'active' | 'inactive'
  settings: {
    api_key?: string
    secret_key?: string
    webhook_url?: string
    channel_id?: string
    channel_secret?: string
    bank_name?: string
    account_name?: string
    account_number?: string
  }
}

// 支付類型選項
const PAYMENT_TYPES = [
  {
    value: 'credit_card',
    label: '信用卡支付',
    icon: CreditCard,
  },
  {
    value: 'mobile_payment',
    label: '行動支付',
    icon: Smartphone,
  },
  {
    value: 'bank_transfer',
    label: '銀行轉帳',
    icon: BanknoteIcon,
  },
]

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    MOCK_PAYMENT_METHODS as PaymentMethod[]
  )
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState<PaymentMethod>({
    id: 0,
    name: '',
    type: 'credit_card',
    provider: '',
    fee_rate: 0,
    fee_fixed: 0,
    min_amount: 0,
    max_amount: 0,
    status: 'active',
    settings: {
      api_key: '',
      secret_key: '',
      webhook_url: '',
      channel_id: '',
      channel_secret: '',
      bank_name: '',
      account_name: '',
      account_number: '',
    },
  })
  const { isDarkMode } = useTheme()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  // 使用過濾條件過濾支付方式
  const filteredPaymentMethods = useMemo(() => {
    return paymentMethods.filter((method) => {
      // 根據搜索詞過濾
      const matchesSearch =
        searchTerm === '' ||
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.provider.toLowerCase().includes(searchTerm.toLowerCase())

      // 根據狀態過濾
      const matchesStatus =
        statusFilter === 'all' || method.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [paymentMethods, searchTerm, statusFilter])

  const handleShowModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method)
      setFormData({
        ...method,
        settings: { ...method.settings },
      })
    } else {
      setEditingMethod(null)
      setFormData({
        id: 0,
        name: '',
        type: 'credit_card',
        provider: '',
        fee_rate: 0,
        fee_fixed: 0,
        min_amount: 0,
        max_amount: 0,
        status: 'active',
        settings: {
          api_key: '',
          secret_key: '',
          webhook_url: '',
          channel_id: '',
          channel_secret: '',
          bank_name: '',
          account_name: '',
          account_number: '',
        },
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMethod(null)
    setFormData({
      id: 0,
      name: '',
      type: 'credit_card',
      provider: '',
      fee_rate: 0,
      fee_fixed: 0,
      min_amount: 0,
      max_amount: 0,
      status: 'active',
      settings: {
        api_key: '',
        secret_key: '',
        webhook_url: '',
        channel_id: '',
        channel_secret: '',
        bank_name: '',
        account_name: '',
        account_number: '',
      },
    })
  }

  // 通用 onChange 處理函數，支持 react-bootstrap Form 組件
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target
    if (name && name.startsWith('settings.')) {
      const settingKey = name.split('.')[1]
      if (settingKey) {
        setFormData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            [settingKey]: value,
          },
        }))
      }
    } else if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'fee_rate' ||
          name === 'fee_fixed' ||
          name === 'min_amount' ||
          name === 'max_amount'
            ? parseFloat(value) || 0
            : value,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      if (editingMethod) {
        // 更新現有支付方式
        setPaymentMethods((prev) =>
          prev.map((method) =>
            method.id === editingMethod.id
              ? { ...formData, id: method.id }
              : method
          )
        )
        showToast('success', '更新成功', '支付方式已成功更新')
      } else {
        // 新增支付方式
        const newId = Math.max(...paymentMethods.map((m) => m.id), 0) + 1
        setPaymentMethods((prev) => [...prev, { ...formData, id: newId }])
        showToast('success', '新增成功', '支付方式已成功新增')
      }
      handleCloseModal()
    }, 500)
  }

  const handleDelete = (method: PaymentMethod) => {
    confirm({
      title: '刪除支付方式',
      message: `確定要刪除支付方式「${method.name}」嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '確認刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setPaymentMethods((prev) => prev.filter((m) => m.id !== method.id))
          showToast('success', '刪除成功', '支付方式已成功刪除')
        }, 500)
      },
    })
  }

  const handleToggleStatus = (method: PaymentMethod) => {
    // 模擬API請求
    setTimeout(() => {
      setPaymentMethods((prev) =>
        prev.map((m) =>
          m.id === method.id
            ? {
                ...m,
                status: m.status === 'active' ? 'inactive' : 'active',
              }
            : m
        )
      )
      showToast(
        'success',
        '狀態更新',
        `支付方式已${method.status === 'active' ? '停用' : '啟用'}`
      )
    }, 500)
  }

  // 重置過濾條件
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard size={20} className="me-2" />
      case 'mobile_payment':
        return <Smartphone size={20} className="me-2" />
      case 'bank_transfer':
        return <BanknoteIcon size={20} className="me-2" />
      default:
        return <CreditCard size={20} className="me-2" />
    }
  }

  const renderSettingsFields = () => {
    switch (formData.type) {
      case 'credit_card':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="text"
                name="settings.api_key"
                value={formData.settings.api_key || ''}
                onChange={handleChange}
                placeholder="輸入API Key"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Secret Key</Form.Label>
              <Form.Control
                type="password"
                name="settings.secret_key"
                value={formData.settings.secret_key || ''}
                onChange={handleChange}
                placeholder="輸入Secret Key"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Webhook URL</Form.Label>
              <Form.Control
                type="text"
                name="settings.webhook_url"
                value={formData.settings.webhook_url || ''}
                onChange={handleChange}
                placeholder="輸入Webhook URL"
              />
            </Form.Group>
          </>
        )
      case 'mobile_payment':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Channel ID</Form.Label>
              <Form.Control
                type="text"
                name="settings.channel_id"
                value={formData.settings.channel_id || ''}
                onChange={handleChange}
                placeholder="輸入Channel ID"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Channel Secret</Form.Label>
              <Form.Control
                type="password"
                name="settings.channel_secret"
                value={formData.settings.channel_secret || ''}
                onChange={handleChange}
                placeholder="輸入Channel Secret"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Webhook URL</Form.Label>
              <Form.Control
                type="text"
                name="settings.webhook_url"
                value={formData.settings.webhook_url || ''}
                onChange={handleChange}
                placeholder="輸入Webhook URL"
              />
            </Form.Group>
          </>
        )
      case 'bank_transfer':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>銀行名稱</Form.Label>
              <Form.Control
                type="text"
                name="settings.bank_name"
                value={formData.settings.bank_name || ''}
                onChange={handleChange}
                placeholder="輸入銀行名稱"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>帳戶名稱</Form.Label>
              <Form.Control
                type="text"
                name="settings.account_name"
                value={formData.settings.account_name || ''}
                onChange={handleChange}
                placeholder="輸入帳戶名稱"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>帳號</Form.Label>
              <Form.Control
                type="text"
                name="settings.account_number"
                value={formData.settings.account_number || ''}
                onChange={handleChange}
                placeholder="輸入帳號"
              />
            </Form.Group>
          </>
        )
      default:
        return null
    }
  }

  return (
    <AdminPageLayout
      title="支付管理"
      actions={
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={18} className="me-2" />
          新增支付方式
        </Button>
      }
    >
      <div className="admin-layout-container">
        <AdminSection>
          <Card
            className={`admin-card ${isDarkMode ? 'bg-dark text-light' : ''}`}
          >
            <Card.Body>
              <div className="mb-4 d-flex justify-content-between align-items-center">
                <Form className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="text"
                    placeholder="搜尋支付方式..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="all">所有狀態</option>
                    <option value="active">啟用</option>
                    <option value="inactive">停用</option>
                  </Form.Select>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      <X size={14} className="me-1" />
                      清除
                    </Button>
                  )}
                </Form>

                <div className="d-none d-md-block">
                  <div className="text-muted">
                    共 {filteredPaymentMethods.length} 種支付方式
                  </div>
                </div>
              </div>

              <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                <thead>
                  <tr>
                    <th>支付方式</th>
                    <th>提供商</th>
                    <th>手續費</th>
                    <th>金額限制</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentMethods.map((method) => (
                    <tr key={method.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {getPaymentTypeIcon(method.type)}
                          {method.name}
                        </div>
                      </td>
                      <td>{method.provider}</td>
                      <td>
                        {method.fee_rate > 0 && `${method.fee_rate}%`}
                        {method.fee_rate > 0 && method.fee_fixed > 0 && ' + '}
                        {method.fee_fixed > 0 && `${method.fee_fixed} TWD`}
                        {method.fee_rate === 0 &&
                          method.fee_fixed === 0 &&
                          '免費'}
                      </td>
                      <td>
                        {method.min_amount} ~ {method.max_amount} TWD
                      </td>
                      <td>
                        <Badge
                          bg={
                            method.status === 'active' ? 'success' : 'secondary'
                          }
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(method)}
                        >
                          {method.status === 'active' ? '啟用中' : '已停用'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(method)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(method)}
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
          <Modal.Title>
            {editingMethod ? '編輯支付方式' : '新增支付方式'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>名稱</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="輸入支付方式名稱"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>類型</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    {PAYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>提供商</Form.Label>
                  <Form.Control
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="輸入提供商名稱"
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>費率 (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    name="fee_rate"
                    value={formData.fee_rate}
                    onChange={handleChange}
                    placeholder="輸入費率百分比"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>固定手續費 (TWD)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="fee_fixed"
                    value={formData.fee_fixed}
                    onChange={handleChange}
                    placeholder="輸入固定手續費"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>最小金額 (TWD)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="min_amount"
                    value={formData.min_amount}
                    onChange={handleChange}
                    placeholder="輸入最小金額"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>最大金額 (TWD)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="max_amount"
                    value={formData.max_amount}
                    onChange={handleChange}
                    placeholder="輸入最大金額"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">支付設定</h5>
            {renderSettingsFields()}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            <X size={18} className="me-1" />
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Save size={18} className="me-1" />
            {editingMethod ? '更新' : '新增'}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminPageLayout>
  )
}

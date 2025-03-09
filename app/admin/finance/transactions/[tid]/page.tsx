'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Badge, Button, Table, Form } from 'react-bootstrap'
import {
  ArrowLeft,
  Save,
  Download,
  Printer,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import Link from 'next/link'

// 模擬交易數據
const MOCK_TRANSACTION = {
  id: 12345,
  order_number: 'ORD-20240315-001',
  date: '2024-03-15',
  type: '商品銷售',
  description: '寵物食品訂單 #12345',
  amount: 2500,
  status: 'completed',
  payment_method: '信用卡',
  payment_details: {
    card_type: 'Visa',
    card_number: '**** **** **** 1234',
    card_holder: '張小明',
    transaction_id: 'TXN123456789',
  },
  customer: {
    id: 789,
    name: '張小明',
    email: 'chang@example.com',
    phone: '0912-345-678',
  },
  items: [
    {
      id: 1,
      name: '優質狗糧',
      quantity: 2,
      price: 800,
      subtotal: 1600,
    },
    {
      id: 2,
      name: '寵物玩具',
      quantity: 1,
      price: 500,
      subtotal: 500,
    },
    {
      id: 3,
      name: '寵物零食',
      quantity: 2,
      price: 200,
      subtotal: 400,
    },
  ],
  shipping_fee: 100,
  discount: 100,
  notes: '',
  created_by: '系統',
  created_at: '2024-03-15 10:30:00',
  updated_at: '2024-03-15 10:35:00',
}

export default function TransactionDetailPage({
  params,
}: {
  params: { tid: string }
}) {
  const [transaction, setTransaction] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
  })
  const { isDarkMode } = useTheme()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  useEffect(() => {
    // 模擬從API獲取交易數據
    setTimeout(() => {
      setTransaction(MOCK_TRANSACTION)
      setFormData({
        status: MOCK_TRANSACTION.status,
        notes: MOCK_TRANSACTION.notes,
      })
    }, 500)
  }, [params.tid])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      setTransaction({
        ...transaction,
        status: formData.status,
        notes: formData.notes,
        updated_at: new Date().toISOString().split('.')[0].replace('T', ' '),
      })
      setIsEditing(false)
      showToast('success', '更新成功', '交易資訊已成功更新')
    }, 500)
  }

  const handleRefund = () => {
    confirm({
      title: '退款確認',
      message: '確定要對此交易進行退款嗎？此操作無法撤銷。',
      type: 'danger',
      confirmText: '確認退款',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setTransaction({
            ...transaction,
            status: 'refunded',
            updated_at: new Date()
              .toISOString()
              .split('.')[0]
              .replace('T', ' '),
          })
          setFormData({
            ...formData,
            status: 'refunded',
          })
          showToast('success', '退款成功', '交易已成功退款')
        }, 500)
      },
    })
  }

  const handleResendReceipt = () => {
    // 模擬發送收據
    showToast('success', '收據已發送', '交易收據已重新發送至客戶信箱')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">已完成</Badge>
      case 'pending':
        return <Badge bg="warning">處理中</Badge>
      case 'failed':
        return <Badge bg="danger">失敗</Badge>
      case 'refunded':
        return <Badge bg="info">已退款</Badge>
      default:
        return null
    }
  }

  if (!transaction) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '50vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="transaction-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link
            href="/admin/finance/transactions"
            className="btn btn-outline-secondary me-3"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="mb-0">交易詳情</h2>
            <p className="text-muted mb-0">
              訂單編號：{transaction.order_number}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleResendReceipt}>
            <Mail size={18} className="me-2" />
            重發收據
          </Button>
          <Button variant="outline-secondary">
            <Printer size={18} className="me-2" />
            列印
          </Button>
          <Button variant="outline-primary">
            <Download size={18} className="me-2" />
            下載收據
          </Button>
          {transaction.status === 'completed' && (
            <Button variant="outline-danger" onClick={handleRefund}>
              <AlertTriangle size={18} className="me-2" />
              退款
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <div className="d-flex justify-content-between mb-4">
                <h5 className="mb-0">交易資訊</h5>
                {!isEditing ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    編輯
                  </Button>
                ) : (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      取消
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSubmit}>
                      <Save size={16} className="me-1" />
                      保存
                    </Button>
                  </div>
                )}
              </div>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>交易日期</Form.Label>
                      <Form.Control
                        type="text"
                        value={transaction.date}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>交易類型</Form.Label>
                      <Form.Control
                        type="text"
                        value={transaction.type}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>付款方式</Form.Label>
                      <Form.Control
                        type="text"
                        value={transaction.payment_method}
                        disabled
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
                        disabled={!isEditing}
                      >
                        <option value="completed">已完成</option>
                        <option value="pending">處理中</option>
                        <option value="failed">失敗</option>
                        <option value="refunded">已退款</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>備註</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="輸入交易備註..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              <div className="transaction-items mt-4">
                <h5 className="mb-3">交易項目</h5>
                <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      <th>項目</th>
                      <th>數量</th>
                      <th>單價</th>
                      <th className="text-end">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.items.map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td className="text-end">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="text-end">
                        運費：
                      </td>
                      <td className="text-end">
                        {formatCurrency(transaction.shipping_fee)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-end">
                        折扣：
                      </td>
                      <td className="text-end">
                        -{formatCurrency(transaction.discount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">
                        總計：
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <h5 className="mb-3">客戶資訊</h5>
              <p className="mb-2">
                <strong>姓名：</strong> {transaction.customer.name}
              </p>
              <p className="mb-2">
                <strong>Email：</strong> {transaction.customer.email}
              </p>
              <p className="mb-2">
                <strong>電話：</strong> {transaction.customer.phone}
              </p>
              <div className="mt-3">
                <Link
                  href={`/admin/members/${transaction.customer.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  查看客戶資料
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <h5 className="mb-3">付款資訊</h5>
              <p className="mb-2">
                <strong>付款方式：</strong> {transaction.payment_method}
              </p>
              {transaction.payment_details && (
                <>
                  <p className="mb-2">
                    <strong>卡片類型：</strong>{' '}
                    {transaction.payment_details.card_type}
                  </p>
                  <p className="mb-2">
                    <strong>卡號：</strong>{' '}
                    {transaction.payment_details.card_number}
                  </p>
                  <p className="mb-2">
                    <strong>持卡人：</strong>{' '}
                    {transaction.payment_details.card_holder}
                  </p>
                  <p className="mb-2">
                    <strong>交易編號：</strong>{' '}
                    {transaction.payment_details.transaction_id}
                  </p>
                </>
              )}
            </Card.Body>
          </Card>

          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <h5 className="mb-3">交易歷程</h5>
              <div className="transaction-timeline">
                <div className="timeline-item">
                  <div className="timeline-icon bg-success">
                    <CheckCircle size={16} />
                  </div>
                  <div className="timeline-content">
                    <p className="mb-1">交易完成</p>
                    <small className="text-muted">
                      {transaction.updated_at}
                    </small>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon bg-primary">
                    <CheckCircle size={16} />
                  </div>
                  <div className="timeline-content">
                    <p className="mb-1">建立交易</p>
                    <small className="text-muted">
                      {transaction.created_at}
                    </small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .transaction-timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          padding-bottom: 1.5rem;
        }
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -23px;
          top: 25px;
          width: 2px;
          height: 100%;
          background-color: #dee2e6;
        }
        .timeline-item:last-child::before {
          display: none;
        }
        .timeline-icon {
          position: absolute;
          left: -30px;
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .timeline-content {
          padding-left: 0.5rem;
        }
      `}</style>
    </div>
  )
}

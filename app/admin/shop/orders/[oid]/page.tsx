'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Badge, Table, Form } from 'react-bootstrap'
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from 'lucide-react'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import AdminPageLayout, {
  AdminSection,
} from '@/app/admin/_components/AdminPageLayout'
import Image from 'next/image'

// 模擬訂單數據
const MOCK_ORDER = {
  id: 101,
  order_number: 'ORD-20230215-001',
  date: '2023-02-15',
  status: 'processing',
  payment_status: 'paid',
  shipping_status: 'pending',
  total: 1200,
  shipping_fee: 60,
  discount: 0,
  payment_method: '信用卡',
  customer: {
    id: 1,
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
  },
  shipping_address: {
    recipient: '王小明',
    phone: '0912-345-678',
    address: '台北市信義區忠孝東路五段123號',
    postal_code: '110',
  },
  items: [
    {
      id: 1,
      product_id: 1,
      product_name: '優質貓糧',
      variant: '小包裝',
      price: 599,
      quantity: 1,
      subtotal: 599,
    },
    {
      id: 2,
      product_id: 2,
      product_name: '貓咪玩具組',
      variant: '標準款',
      price: 299,
      quantity: 2,
      subtotal: 598,
    },
  ],
  timeline: [
    {
      time: '2023-02-15 10:30',
      status: '訂單建立',
      description: '客戶建立訂單',
    },
    {
      time: '2023-02-15 10:35',
      status: '付款完成',
      description: '信用卡付款成功',
    },
    {
      time: '2023-02-15 14:20',
      status: '處理中',
      description: '訂單正在處理中',
    },
  ],
}

// 訂單狀態選項
const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: '待處理', badge: 'warning' },
  { value: 'processing', label: '處理中', badge: 'info' },
  { value: 'shipped', label: '已出貨', badge: 'primary' },
  { value: 'delivered', label: '已送達', badge: 'success' },
  { value: 'cancelled', label: '已取消', badge: 'danger' },
  { value: 'refunded', label: '已退款', badge: 'secondary' },
]

// 付款狀態選項
const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: '待付款', badge: 'warning' },
  { value: 'paid', label: '已付款', badge: 'success' },
  { value: 'failed', label: '付款失敗', badge: 'danger' },
  { value: 'refunded', label: '已退款', badge: 'secondary' },
]

// 出貨狀態選項
const SHIPPING_STATUS_OPTIONS = [
  { value: 'pending', label: '待出貨', badge: 'warning' },
  { value: 'processing', label: '處理中', badge: 'info' },
  { value: 'shipped', label: '已出貨', badge: 'primary' },
  { value: 'delivered', label: '已送達', badge: 'success' },
  { value: 'returned', label: '已退貨', badge: 'danger' },
]

export default function OrderDetailPage({
  params,
}: {
  params: { oid: string }
}) {
  const [order, setOrder] = useState(MOCK_ORDER)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    status: MOCK_ORDER.status,
    payment_status: MOCK_ORDER.payment_status,
    shipping_status: MOCK_ORDER.shipping_status,
  })
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 模擬從API獲取訂單數據
  useEffect(() => {
    // 這裡可以根據params.oid從API獲取訂單數據
    console.log(`獲取訂單ID: ${params.oid}的數據`)
  }, [params.oid])

  // 處理表單變更
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      setOrder((prev) => ({ ...prev, ...formData }))
      setIsEditing(false)
      showToast('success', '更新成功', '訂單狀態已成功更新')
    }, 500)
  }

  // 處理取消訂單
  const handleCancelOrder = () => {
    confirm({
      title: '取消訂單',
      message: `確定要取消訂單 ${order.order_number} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '取消訂單',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setOrder((prev) => ({
            ...prev,
            status: 'cancelled',
            timeline: [
              ...prev.timeline,
              {
                time: new Date().toLocaleString('zh-TW'),
                status: '已取消',
                description: '管理員取消訂單',
              },
            ],
          }))
          setFormData((prev) => ({ ...prev, status: 'cancelled' }))
          showToast(
            'success',
            '操作成功',
            `訂單 ${order.order_number} 已成功取消`
          )
        }, 500)
      },
    })
  }

  // 處理標記為已出貨
  const handleMarkAsShipped = () => {
    // 模擬API請求
    setTimeout(() => {
      setOrder((prev) => ({
        ...prev,
        status: 'shipped',
        shipping_status: 'shipped',
        timeline: [
          ...prev.timeline,
          {
            time: new Date().toLocaleString('zh-TW'),
            status: '已出貨',
            description: '訂單已出貨',
          },
        ],
      }))
      setFormData((prev) => ({
        ...prev,
        status: 'shipped',
        shipping_status: 'shipped',
      }))
      showToast(
        'success',
        '操作成功',
        `訂單 ${order.order_number} 已標記為已出貨`
      )
    }, 500)
  }

  // 處理標記為已送達
  const handleMarkAsDelivered = () => {
    // 模擬API請求
    setTimeout(() => {
      setOrder((prev) => ({
        ...prev,
        status: 'delivered',
        shipping_status: 'delivered',
        timeline: [
          ...prev.timeline,
          {
            time: new Date().toLocaleString('zh-TW'),
            status: '已送達',
            description: '訂單已送達',
          },
        ],
      }))
      setFormData((prev) => ({
        ...prev,
        status: 'delivered',
        shipping_status: 'delivered',
      }))
      showToast(
        'success',
        '操作成功',
        `訂單 ${order.order_number} 已標記為已送達`
      )
    }, 500)
  }

  // 獲取狀態標籤
  const getStatusBadge = (status: string, options: any[]) => {
    const option = options.find((opt) => opt.value === status)
    return option ? (
      <Badge bg={option.badge}>{option.label}</Badge>
    ) : (
      <Badge bg="secondary">未知</Badge>
    )
  }

  return (
    <AdminPageLayout
      title={`訂單詳情 #${order.order_number}`}
      actions={
        <div className="d-flex">
          <Link href="/admin/shop/orders" passHref>
            <Button
              variant="outline-secondary"
              className="me-2 d-flex align-items-center"
            >
              <ArrowLeft size={18} className="me-2" /> 返回訂單列表
            </Button>
          </Link>
          <Button
            variant="outline-secondary"
            className="me-2 d-flex align-items-center"
            onClick={() => window.print()}
          >
            <Printer size={18} className="me-2" /> 列印訂單
          </Button>
          <Button
            variant="outline-primary"
            className="me-2 d-flex align-items-center"
          >
            <Send size={18} className="me-2" /> 發送通知
          </Button>
        </div>
      }
    >
      <Row className="mb-4">
        <Col md={8}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">訂單資訊</h5>
              <div>
                {isEditing ? (
                  <Button variant="primary" size="sm" onClick={handleSubmit}>
                    儲存變更
                  </Button>
                ) : (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    編輯狀態
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <p>
                    <strong>訂單編號：</strong> {order.order_number}
                  </p>
                  <p>
                    <strong>訂單日期：</strong>{' '}
                    {new Date(order.date).toLocaleDateString('zh-TW')}
                  </p>
                  <p>
                    <strong>付款方式：</strong> {order.payment_method}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="mb-2">
                    <strong>訂單狀態：</strong>{' '}
                    {isEditing ? (
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        size="sm"
                        className="mt-1"
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Badge
                        bg={
                          ORDER_STATUS_OPTIONS.find(
                            (o) => o.value === order.status
                          )?.badge
                        }
                      >
                        {
                          ORDER_STATUS_OPTIONS.find(
                            (o) => o.value === order.status
                          )?.label
                        }
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>付款狀態：</strong>{' '}
                    {isEditing ? (
                      <Form.Select
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleChange}
                        size="sm"
                        className="mt-1"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Badge
                        bg={
                          PAYMENT_STATUS_OPTIONS.find(
                            (o) => o.value === order.payment_status
                          )?.badge
                        }
                      >
                        {
                          PAYMENT_STATUS_OPTIONS.find(
                            (o) => o.value === order.payment_status
                          )?.label
                        }
                      </Badge>
                    )}
                  </div>
                  <div>
                    <strong>出貨狀態：</strong>{' '}
                    {isEditing ? (
                      <Form.Select
                        name="shipping_status"
                        value={formData.shipping_status}
                        onChange={handleChange}
                        size="sm"
                        className="mt-1"
                      >
                        {SHIPPING_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Badge
                        bg={
                          SHIPPING_STATUS_OPTIONS.find(
                            (o) => o.value === order.shipping_status
                          )?.badge
                        }
                      >
                        {
                          SHIPPING_STATUS_OPTIONS.find(
                            (o) => o.value === order.shipping_status
                          )?.label
                        }
                      </Badge>
                    )}
                  </div>
                </Col>
              </Row>

              <h5 className="mt-4 mb-3">訂單項目</h5>
              <Table
                striped
                bordered
                hover
                responsive
                className={isDarkMode ? 'table-dark' : ''}
              >
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>商品</th>
                    <th>單價</th>
                    <th>數量</th>
                    <th className="text-end">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              marginRight: '10px',
                            }}
                          >
                            <Image
                              src={
                                item.image || 'https://via.placeholder.com/40'
                              }
                              alt={item.product_name}
                              width={40}
                              height={40}
                              className="img-thumbnail"
                            />
                          </div>
                          <div>
                            <div>{item.product_name}</div>
                            {item.variant && (
                              <small className="text-muted">
                                規格: {item.variant}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>NT${item.price}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">
                        NT${item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-end">
                      <strong>小計</strong>
                    </td>
                    <td className="text-end">NT${order.subtotal}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="text-end">
                      <strong>運費</strong>
                    </td>
                    <td className="text-end">NT${order.shipping_fee}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={4} className="text-end">
                        <strong>折扣</strong>
                      </td>
                      <td className="text-end">-NT${order.discount}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} className="text-end">
                      <strong>總計</strong>
                    </td>
                    <td className="text-end">
                      <strong>NT${order.total}</strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>

              <div className="mt-4 d-flex justify-content-end">
                <Button
                  variant="danger"
                  className="me-2 d-flex align-items-center"
                  onClick={handleCancelOrder}
                >
                  <XCircle size={18} className="me-2" /> 取消訂單
                </Button>
                <Button
                  variant="success"
                  className="d-flex align-items-center"
                  onClick={handleCompleteOrder}
                >
                  <CheckCircle size={18} className="me-2" /> 完成訂單
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Header>
              <h5 className="mb-0">訂單備註</h5>
            </Card.Header>
            <Card.Body>
              <p>{order.notes || '無備註'}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Header>
              <h5 className="mb-0">客戶資訊</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>姓名：</strong> {order.customer.name}
              </p>
              <p>
                <strong>電子郵件：</strong> {order.customer.email}
              </p>
              <p>
                <strong>電話：</strong> {order.customer.phone}
              </p>
              <div className="mt-3">
                <Link
                  href={`/admin/members/${order.customer.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  查看客戶詳情
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Header>
              <h5 className="mb-0">配送資訊</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>收件人：</strong> {order.shipping_address.recipient}
              </p>
              <p>
                <strong>電話：</strong> {order.shipping_address.phone}
              </p>
              <p>
                <strong>郵遞區號：</strong> {order.shipping_address.postal_code}
              </p>
              <p>
                <strong>地址：</strong> {order.shipping_address.address}
              </p>
            </Card.Body>
          </Card>

          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Header>
              <h5 className="mb-0">訂單時間軸</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                {order.timeline.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="mb-0">{event.status}</h6>
                      <small className="text-muted">{event.time}</small>
                      <p className="mb-0">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminPageLayout>
  )
}

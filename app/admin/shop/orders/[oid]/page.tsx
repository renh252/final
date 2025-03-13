'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Alert,
  Table,
  Tabs,
  Tab,
  InputGroup,
  Spinner,
} from 'react-bootstrap'
import {
  Truck,
  Package,
  Clock,
  DollarSign,
  ArrowLeft,
  Printer,
  Mail,
  FileText,
  MessageSquare,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Ticket,
} from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import Cookies from 'js-cookie'

// 訂單狀態定義
const ORDER_STATUS = {
  PENDING: { value: '待出貨', color: 'warning', icon: <Clock size={16} /> },
  SHIPPED: { value: '已出貨', color: 'primary', icon: <Truck size={16} /> },
  COMPLETED: {
    value: '已完成',
    color: 'success',
    icon: <DollarSign size={16} />,
  },
  CANCELLED: { value: '已取消', color: 'danger', icon: <Clock size={16} /> },
}

// 訂單狀態流程
const ORDER_WORKFLOW = {
  待出貨: ['已出貨', '已取消'],
  已出貨: ['已完成', '已取消'],
  已完成: [],
  已取消: [],
}

// 支付方式
const PAYMENT_METHODS = {
  CREDIT_CARD: '信用卡',
  LINE_PAY: 'LINE Pay',
  ATOME: 'Atome分期',
  CASH_ON_DELIVERY: '貨到付款',
}

// 訂單詳情頁面組件
export default function OrderDetailPage() {
  const { oid } = useParams() as { oid: string }
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<any>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const [adminMessages, setAdminMessages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('details')

  // 獲取訂單詳情
  useEffect(() => {
    fetchOrderDetails()
  }, [oid])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get('admin_token')
      const response = await fetch(`/api/admin/orders/${oid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '獲取訂單詳情失敗')
      }

      setOrder(data.order)
      setShipping(data.shipping)
      setAdminMessages(data.messages)
    } catch (err) {
      console.error('獲取訂單詳情失敗:', err)
      setError(err instanceof Error ? err.message : '獲取訂單詳情失敗')
      showToast('error', '錯誤', '獲取訂單詳情失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 處理狀態更新
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (!order) return

      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: '確認更新訂單狀態',
          message: `確定要將訂單狀態從「${order.order_status}」更新為「${newStatus}」嗎？`,
          confirmText: '確認更新',
          cancelText: '取消',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      setLoading(true)

      const token = Cookies.get('admin_token')
      const response = await fetch(`/api/admin/orders/${oid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新訂單狀態失敗')
      }

      // 重新獲取訂單詳情以更新時間軸
      await fetchOrderDetails()
      showToast('success', '操作成功', `訂單狀態已更新為「${newStatus}」`)
    } catch (err) {
      console.error('更新訂單狀態失敗:', err)
      showToast('error', '操作失敗', '更新訂單狀態失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 更新出貨資訊
  const handleUpdateShipping = async () => {
    try {
      if (!order) return

      setLoading(true)

      const token = Cookies.get('admin_token')
      const response = await fetch(`/api/admin/orders/${oid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carrier: shipping.carrier,
          tracking_number: trackingInput,
          estimated_delivery: shipping.estimated_delivery,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新出貨資訊失敗')
      }

      // 重新獲取訂單詳情
      await fetchOrderDetails()
      showToast('success', '操作成功', '出貨資訊已更新')
    } catch (err) {
      console.error('更新出貨資訊失敗:', err)
      showToast('error', '操作失敗', '更新出貨資訊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 新增管理員留言
  const handleAddComment = async () => {
    if (!commentInput.trim()) return

    try {
      setLoading(true)

      const token = Cookies.get('admin_token')
      const response = await fetch(`/api/admin/orders/${oid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '新增管理員留言失敗')
      }

      // 重新獲取訂單詳情
      await fetchOrderDetails()
      setCommentInput('')
      showToast('success', '操作成功', '留言已新增')
    } catch (err) {
      console.error('新增管理員留言失敗:', err)
      showToast('error', '操作失敗', '新增管理員留言失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 返回訂單列表
  const handleBackToList = () => {
    router.push('/admin/shop/orders')
  }

  // 列印訂單
  const handlePrintOrder = () => {
    window.print()
  }

  // 發送通知郵件
  const handleSendEmail = async () => {
    try {
      if (!order) return

      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: '確認發送通知郵件',
          message: `確定要發送訂單狀態更新通知郵件給客戶嗎？`,
          confirmText: '確認發送',
          cancelText: '取消',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      setLoading(true)

      const token = Cookies.get('admin_token')
      const response = await fetch(`/api/admin/orders/${oid}/notify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '發送通知郵件失敗')
      }

      showToast('success', '操作成功', '通知郵件已發送')
    } catch (err) {
      console.error('發送通知郵件失敗:', err)
      showToast('error', '操作失敗', '發送通知郵件失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 渲染狀態徽章
  const renderStatusBadge = (status: string) => {
    const statusInfo = Object.values(ORDER_STATUS).find(
      (s) => s.value === status
    )
    if (!statusInfo) return <Badge bg="secondary">{status}</Badge>

    return (
      <Badge
        bg={statusInfo.color}
        className="d-inline-flex align-items-center gap-1"
      >
        {statusInfo.icon} {status}
      </Badge>
    )
  }

  // 渲染訂單狀態操作
  const renderStatusActions = () => {
    if (!order) return null

    const currentStatus = order.order_status
    const availableActions =
      ORDER_WORKFLOW[currentStatus as keyof typeof ORDER_WORKFLOW] || []

    if (availableActions.length === 0) {
      return <p className="text-muted mb-0">此狀態下無可用操作</p>
    }

    return (
      <div className="d-flex gap-2">
        {availableActions.map((status) => (
          <Button
            key={status}
            variant={
              ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.color ||
              'secondary'
            }
            size="sm"
            onClick={() => handleStatusUpdate(status)}
            disabled={loading}
          >
            {ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.icon} 更新為
            {status}
          </Button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <AdminPageLayout title="訂單詳情">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">載入中...</p>
        </div>
      </AdminPageLayout>
    )
  }

  if (error || !order) {
    return (
      <AdminPageLayout title="訂單詳情">
        <Alert variant="danger">{error || '無法載入訂單資料'}</Alert>
      </AdminPageLayout>
    )
  }

  // 渲染主要內容
  return (
    <AdminPageLayout title={`訂單詳情: ${order?.order_id}`}>
      {/* 頂部操作按鈕 */}
      <AdminSection>
        <div className="d-flex justify-content-between mb-3">
          <Button variant="light" onClick={handleBackToList}>
            <ArrowLeft size={16} className="me-1" /> 返回訂單列表
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={handlePrintOrder}>
              <Printer size={16} className="me-1" /> 列印訂單
            </Button>
            <Button variant="outline-primary" onClick={handleSendEmail}>
              <Mail size={16} className="me-1" /> 發送通知
            </Button>
          </div>
        </div>
      </AdminSection>

      {/* 訂單資訊卡片 */}
      <AdminSection title="訂單資訊">
        <Tabs
          id="order-tabs"
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          {/* 訂單詳情頁籤 */}
          <Tab eventKey="details" title="訂單詳情">
            <Row>
              {/* 訂單基本信息 */}
              <Col md={6}>
                <AdminCard>
                  <h5 className="mb-3">基本資訊</h5>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <p className="mb-0">
                        <strong>訂單編號:</strong> {order?.order_id}
                      </p>
                      <p className="mb-0">
                        <strong>訂單日期:</strong> {order?.created_at}
                      </p>
                      <p className="mb-0">
                        <strong>訂單狀態:</strong>{' '}
                        {renderStatusBadge(order?.order_status)}
                      </p>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-0">
                        NT$ {order?.total_price.toLocaleString()}
                      </h5>
                      <p className="text-muted mb-0">
                        {
                          PAYMENT_METHODS[
                            order?.payment_method as keyof typeof PAYMENT_METHODS
                          ]
                        }
                      </p>
                      <Badge
                        bg={
                          order?.payment_status === '已付款'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {order?.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h6>狀態管理</h6>
                    {renderStatusActions()}
                  </div>
                </AdminCard>

                {/* 客戶資訊 */}
                <AdminCard className="mt-3">
                  <h5 className="mb-3">客戶資訊</h5>
                  <p className="mb-0">
                    <User size={16} className="me-1" /> <strong>姓名:</strong>{' '}
                    {order?.recipient_name}
                  </p>
                  <p className="mb-0">
                    <Mail size={16} className="me-1" /> <strong>Email:</strong>{' '}
                    {order?.recipient_email}
                  </p>
                  <p className="mb-0">
                    <Phone size={16} className="me-1" /> <strong>電話:</strong>{' '}
                    {order?.recipient_phone}
                  </p>
                  <div className="mt-3">
                    <h6>
                      <MapPin size={16} className="me-1" /> 收件地址
                    </h6>
                    <p className="mb-0">{order?.shipping_address}</p>
                  </div>
                  {order?.note && (
                    <div className="mt-3">
                      <h6>客戶備註</h6>
                      <p className="mb-0">{order?.note}</p>
                    </div>
                  )}
                </AdminCard>
              </Col>

              {/* 訂單內容和出貨資訊 */}
              <Col md={6}>
                {/* 訂購商品 */}
                <AdminCard>
                  <h5 className="mb-3">訂購商品</h5>
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>商品</th>
                          <th className="text-center">數量</th>
                          <th className="text-end">小計</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order?.items || [])?.map((item: any) => (
                          <tr key={item.order_item_id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="me-2 product-img-small"
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundImage: `url('${item.image_url}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '4px',
                                  }}
                                ></div>
                                <div>
                                  <p className="mb-0 fw-medium">
                                    {item.product_name}
                                  </p>
                                  {item.variant && (
                                    <small className="text-muted">
                                      {item.variant}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              {item.quantity}
                            </td>
                            <td className="text-end align-middle">
                              NT$ {Number(item.subtotal).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="text-end">
                            小計:
                          </td>
                          <td className="text-end">
                            NT$ {Number(order?.subtotal).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="text-end">
                            運費:
                          </td>
                          <td className="text-end">
                            NT$ {Number(order?.shipping_fee).toLocaleString()}
                          </td>
                        </tr>
                        {Number(order?.discount) > 0 && (
                          <tr>
                            <td colSpan={2} className="text-end">
                              優惠折抵:
                            </td>
                            <td className="text-end">
                              -NT$ {Number(order?.discount).toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={2} className="text-end fw-bold">
                            總計:
                          </td>
                          <td className="text-end fw-bold">
                            NT$ {Number(order?.total_price).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                  {order?.coupon_code && (
                    <div className="mt-2">
                      <Badge bg="info" className="p-2">
                        <Ticket size={14} className="me-1" /> 優惠券:{' '}
                        {order.coupon_code}
                      </Badge>
                    </div>
                  )}
                </AdminCard>

                {/* 出貨資訊 */}
                <AdminCard className="mt-3">
                  <h5 className="mb-3">出貨資訊</h5>
                  {shipping ? (
                    <>
                      <div className="mb-3">
                        <p className="mb-1">
                          <strong>物流公司:</strong> {shipping.carrier}
                        </p>
                        <p className="mb-1">
                          <strong>追蹤號碼:</strong> {shipping.tracking_number}
                        </p>
                        <p className="mb-1">
                          <strong>出貨日期:</strong> {shipping.shipped_date}
                        </p>
                        <p className="mb-0">
                          <strong>預計到貨:</strong>{' '}
                          {shipping.estimated_delivery}
                        </p>
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleUpdateShipping}
                        >
                          更新出貨資訊
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          檢視物流追蹤
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted mb-0">尚未填寫出貨資訊</p>
                  )}
                </AdminCard>
              </Col>
            </Row>
          </Tab>

          {/* 訂單時間軸頁籤 */}
          <Tab eventKey="timeline" title="訂單時間軸">
            <AdminCard>
              <div className="timeline">
                {(order?.timeline || [])?.map((event: any) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                    <div className="timeline-content">
                      <div className="d-flex align-items-center mb-1">
                        <Badge bg="primary" className="me-2">
                          {event.status}
                        </Badge>
                        <small className="text-muted">
                          操作人: {event.admin_name}
                        </small>
                      </div>
                      {event.note && <p className="mb-0">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </Tab>

          {/* 管理員留言頁籤 */}
          <Tab eventKey="messages" title="管理員留言">
            <AdminCard>
              <div className="mb-3">
                <Form>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="輸入留言內容..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      onClick={handleAddComment}
                      disabled={!commentInput.trim() || loading}
                    >
                      新增留言
                    </Button>
                  </InputGroup>
                </Form>
              </div>

              <div className="messages">
                {(adminMessages || []).map((message) => (
                  <div key={message.id} className="message-item">
                    <div className="message-header">
                      <strong>{message.admin_name}</strong>
                      <small className="text-muted ms-2">
                        {new Date(message.created_at).toLocaleString()}
                      </small>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </Tab>
        </Tabs>
      </AdminSection>
    </AdminPageLayout>
  )
}

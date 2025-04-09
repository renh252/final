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
import { fetchApi } from '@/app/admin/_lib/api'

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

// 格式化日期函數
const formatDate = (dateString: string) => {
  if (!dateString) return '未設定'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
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
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])

  // 計算訂單總金額
  const calculateTotalPrice = () => {
    if (!orderItems || orderItems.length === 0) return 0
    return orderItems.reduce((sum: number, item: any) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0)
      return sum + itemTotal
    }, 0)
  }

  // 計算商品小計
  const calculateItemSubtotal = (item: any) => {
    return (item.price || 0) * (item.quantity || 0)
  }

  // 格式化金額
  const formatPrice = (price: number) => {
    return price.toLocaleString()
  }

  // 獲取訂單詳情
  useEffect(() => {
    fetchOrderDetails()
  }, [oid])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`正在獲取訂單詳情，訂單編號: ${oid}`)

      // 添加調試信息，請求URL
      const requestUrl = `/api/admin/shop/orders/${oid}`
      console.log(`請求URL: ${requestUrl}`)

      const response = await fetchApi(requestUrl)

      // 調試信息，輸出API響應
      console.log(`API響應:`, response)

      // 處理多種可能的響應格式
      if (response.success && response.order) {
        console.log(`找到訂單資料，格式1: success + order`)
        // 格式 1: { success: true, order: {...} }
        setOrder(response.order)
        setOrderItems(response.order.items || [])
        setShipping(response.order.shipping || {})
        setAdminMessages(response.order.messages || [])
        setTimeline(response.order.timeline || [])
        setTrackingInput(response.order.shipping?.tracking_number || '')
      } else if (response.order) {
        console.log(`找到訂單資料，格式2: order`)
        // 格式 2: { order: {...} }
        setOrder(response.order)
        setOrderItems(response.order.items || [])
        setShipping(response.order.shipping || {})
        setAdminMessages(response.order.messages || [])
        setTimeline(response.order.timeline || [])
        setTrackingInput(response.order.shipping?.tracking_number || '')
      } else if (response.success && response.data) {
        console.log(`找到訂單資料，格式3: success + data`)
        // 格式 3: { success: true, data: {...} }
        const orderData = response.data
        setOrder(orderData)
        setOrderItems(orderData.items || [])
        setShipping(orderData.shipping || {})
        setAdminMessages(orderData.messages || [])
        setTimeline(orderData.timeline || [])
        setTrackingInput(orderData.shipping?.tracking_number || '')
      } else if (response.data) {
        console.log(`找到訂單資料，格式4: data`)
        // 格式 4: { data: {...} }
        const orderData = response.data
        setOrder(orderData)
        setOrderItems(orderData.items || [])
        setShipping(orderData.shipping || {})
        setAdminMessages(orderData.messages || [])
        setTimeline(orderData.timeline || [])
        setTrackingInput(orderData.shipping?.tracking_number || '')
      } else if (response.id || response.order_id) {
        console.log(`找到訂單資料，格式5: 直接返回訂單對象`)
        // 格式 5: 直接返回訂單對象
        setOrder(response)
        setOrderItems(response.items || [])
        setShipping(response.shipping || {})
        setAdminMessages(response.messages || [])
        setTimeline(response.timeline || [])
        setTrackingInput(response.shipping?.tracking_number || '')
      } else {
        // 詳細記錄錯誤情況
        console.error(
          '返回的訂單數據格式不正確:',
          JSON.stringify(response, null, 2)
        )

        // 檢查是否有可能的錯誤訊息
        let errorMessage = '獲取訂單詳情失敗，數據格式不正確'

        if (response.message) {
          errorMessage = response.message
        } else if (response.error) {
          errorMessage =
            typeof response.error === 'string'
              ? response.error
              : JSON.stringify(response.error)
        } else if (response.success === false) {
          errorMessage = '操作失敗，請檢查訂單ID是否正確'
        }

        throw new Error(errorMessage)
      }
    } catch (err: any) {
      // 詳細記錄錯誤
      console.error('獲取訂單詳情失敗:', err)

      // 提取錯誤訊息
      let errorMessage = '獲取訂單詳情失敗'

      if (err instanceof Error) {
        errorMessage = err.message
        console.error('錯誤詳情:', err.stack)
      } else if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object') {
        errorMessage = JSON.stringify(err)
      }

      setError(errorMessage)
      showToast('error', '錯誤', `獲取訂單詳情失敗: ${errorMessage}`)
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

      const response = await fetchApi(`/api/admin/shop/orders/${oid}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.success) {
        // 重新獲取訂單詳情以更新時間軸
        await fetchOrderDetails()
        showToast('success', '操作成功', `訂單狀態已更新為「${newStatus}」`)
      } else {
        throw new Error(response.message || '更新訂單狀態失敗')
      }
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

      const shippingData = {
        carrier: shipping?.carrier || '',
        tracking_number: trackingInput || '',
        estimated_delivery: shipping?.estimated_delivery || '',
      }

      const response = await fetchApi(`/api/admin/shop/orders/${oid}`, {
        method: 'PATCH',
        body: JSON.stringify(shippingData),
      })

      if (response.success) {
        // 重新獲取訂單詳情
        await fetchOrderDetails()
        showToast('success', '操作成功', '出貨資訊已更新')
      } else {
        throw new Error(response.message || '更新出貨資訊失敗')
      }
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

      const response = await fetchApi(`/api/admin/shop/orders/${oid}`, {
        method: 'POST',
        body: JSON.stringify({ content: commentInput }),
      })

      if (response.success) {
        // 重新獲取訂單詳情
        await fetchOrderDetails()
        setCommentInput('')
        showToast('success', '操作成功', '留言已新增')
      } else {
        throw new Error(response.message || '新增管理員留言失敗')
      }
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

      const response = await fetchApi(`/api/admin/shop/orders/${oid}/notify`, {
        method: 'POST',
      })

      if (response.success) {
        showToast('success', '操作成功', '通知郵件已發送')
      } else {
        throw new Error(response.message || '發送通知郵件失敗')
      }
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

    const currentStatus = order.order_status || ''
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

  // 渲染加載中狀態
  if (loading && !order) {
    return (
      <AdminPageLayout title="訂單詳情">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">載入訂單資料中...</p>
        </div>
      </AdminPageLayout>
    )
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <AdminPageLayout title="訂單詳情">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBackToList}>
          <ArrowLeft size={16} className="me-1" /> 返回訂單列表
        </Button>
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
                        <strong>訂單日期:</strong> {formatDate(order?.created_at)}
                      </p>
                      <p className="mb-0">
                        <strong>訂單狀態:</strong>{' '}
                        {renderStatusBadge(order?.order_status)}
                      </p>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-0">
                        NT$ {formatPrice(calculateTotalPrice())}
                      </h5>
                      <p className="text-muted mb-0">
                        {order?.payment_method || '未知'}
                      </p>
                      <Badge
                        bg={
                          order?.payment_status === '已付款'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {order?.payment_status || '未知'}
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
                        {orderItems.length > 0 ? (
                          orderItems.map((item: any) => (
                            <tr key={item.order_item_id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    className="me-2 product-img-small"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      backgroundImage: `url('${item.product_image}')`,
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
                                NT$ {formatPrice(calculateItemSubtotal(item))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center">
                              無商品資料
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="text-end">
                            小計:
                          </td>
                          <td className="text-end">
                            NT$ {formatPrice(calculateTotalPrice())}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="text-end">
                            運費:
                          </td>
                          <td className="text-end">NT$ 0</td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="text-end fw-bold">
                            總計:
                          </td>
                          <td className="text-end fw-bold">
                            NT$ {formatPrice(calculateTotalPrice())}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                  {order?.promotion_code && (
                    <div className="mt-2">
                      <Badge bg="info" className="p-2">
                        <Ticket size={14} className="me-1" /> 折扣碼:{' '}
                        {order.promotion_code}
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
                          <strong>出貨日期:</strong> {formatDate(shipping.shipped_date)}
                        </p>
                        <p className="mb-0">
                          <strong>預計到貨:</strong>{' '}
                          {formatDate(shipping.estimated_delivery)}
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
                {timeline.length > 0 ? (
                  timeline.map((event: any) => (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-date">
                        {formatDate(event.created_at)}
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
                  ))
                ) : (
                  <div className="text-center text-muted">無時間軸資料</div>
                )}
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
                {adminMessages.length > 0 ? (
                  adminMessages.map((message) => (
                    <div key={message.id} className="message-item">
                      <div className="message-header">
                        <strong>{message.admin_name}</strong>
                        <small className="text-muted ms-2">
                          {new Date(message.created_at).toLocaleString()}
                        </small>
                      </div>
                      <div className="message-content">{message.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted">無留言資料</div>
                )}
              </div>
            </AdminCard>
          </Tab>
        </Tabs>
      </AdminSection>
    </AdminPageLayout>
  )
}

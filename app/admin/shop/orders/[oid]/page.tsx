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
  PENDING: { value: '待處理', color: 'warning', icon: <Clock size={16} /> },
  PROCESSING: { value: '處理中', color: 'info', icon: <Package size={16} /> },
  SHIPPED: { value: '已出貨', color: 'primary', icon: <Truck size={16} /> },
  COMPLETED: {
    value: '已完成',
    color: 'success',
    icon: <DollarSign size={16} />,
  },
  CANCELLED: { value: '已取消', color: 'danger', icon: <Clock size={16} /> },
  REFUNDED: {
    value: '已退款',
    color: 'secondary',
    icon: <DollarSign size={16} />,
  },
}

// 訂單狀態流程
const ORDER_WORKFLOW = {
  待處理: ['處理中', '已取消'],
  處理中: ['已出貨', '已取消'],
  已出貨: ['已完成', '已退款'],
  已完成: ['已退款'],
  已取消: [],
  已退款: [],
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
      if (!token) {
        setError('未登入或登入狀態已過期')
        setLoading(false)
        return
      }

      // 模擬 API 請求
      // 實際開發中請替換為真實的 API 呼叫
      setTimeout(() => {
        // 模擬訂單資料
        const mockOrder = {
          order_id: oid,
          order_number: `ORD-${oid.padStart(6, '0')}`,
          order_date: '2023-08-15 14:30:25',
          order_status: '已出貨',
          payment_method: 'CREDIT_CARD',
          payment_status: '已付款',
          user_id: 1023,
          user_name: '王小明',
          user_email: 'wang@example.com',
          user_phone: '0912-345-678',
          shipping_address: '台北市信義區松高路123號7樓',
          billing_address: '台北市信義區松高路123號7樓',
          subtotal: 2580,
          shipping_fee: 60,
          discount: 200,
          total: 2440,
          coupon_code: 'SUMMER200',
          note: '請在下午時段配送，謝謝!',
          items: [
            {
              product_id: 101,
              product_name: '寵物潔牙骨 - 大型犬專用',
              variant: '大型包裝',
              price: 850,
              quantity: 2,
              subtotal: 1700,
              image_url: '/products/dental-bone.jpg',
            },
            {
              product_id: 205,
              product_name: '貓咪抓板玩具',
              variant: '標準版',
              price: 880,
              quantity: 1,
              subtotal: 880,
              image_url: '/products/cat-scratcher.jpg',
            },
          ],
          shipping: {
            tracking_number: 'TN123456789TW',
            carrier: '黑貓宅急便',
            shipped_date: '2023-08-16 10:15:00',
            estimated_delivery: '2023-08-18',
          },
          timeline: [
            {
              status: '訂單建立',
              timestamp: '2023-08-15 14:30:25',
              user: '系統',
            },
            {
              status: '付款完成',
              timestamp: '2023-08-15 14:35:12',
              user: '系統',
            },
            {
              status: '處理中',
              timestamp: '2023-08-15 16:20:05',
              user: '管理員 - 陳小姐',
            },
            {
              status: '已出貨',
              timestamp: '2023-08-16 10:15:00',
              user: '管理員 - 李先生',
            },
          ],
        }

        // 模擬管理員留言
        const mockMessages = [
          {
            id: 1,
            content: '客戶要求週六配送，已通知物流',
            admin_name: '李先生',
            created_at: '2023-08-15 16:25:10',
          },
          {
            id: 2,
            content: '已確認付款完成，準備出貨',
            admin_name: '陳小姐',
            created_at: '2023-08-15 15:05:22',
          },
        ]

        setOrder(mockOrder)
        setShipping(mockOrder.shipping)
        setAdminMessages(mockMessages)
        setLoading(false)
      }, 800)
    } catch (err) {
      console.error('獲取訂單詳情失敗:', err)
      setError('獲取訂單詳情失敗，請稍後再試')
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

      // 這裡應該呼叫真實的 API 更新訂單狀態
      // 模擬 API 請求和響應
      setLoading(true)

      setTimeout(() => {
        setOrder({
          ...order,
          order_status: newStatus,
          timeline: [
            ...order.timeline,
            {
              status: newStatus,
              timestamp: new Date()
                .toISOString()
                .replace('T', ' ')
                .substring(0, 19),
              user: '管理員 - 目前登入者',
            },
          ],
        })
        setLoading(false)
        showToast('success', '操作成功', `訂單狀態已更新為「${newStatus}」`)
      }, 500)
    } catch (err) {
      console.error('更新訂單狀態失敗:', err)
      showToast('error', '操作失敗', '更新訂單狀態失敗，請稍後再試')
      setLoading(false)
    }
  }

  // 更新出貨資訊
  const handleUpdateShipping = async () => {
    try {
      if (!order) return

      // 這裡應該呼叫真實的 API 更新出貨資訊
      // 模擬 API 請求和響應
      setLoading(true)

      setTimeout(() => {
        setOrder({
          ...order,
          shipping: {
            ...shipping,
          },
        })
        setLoading(false)
        showToast('success', '操作成功', '出貨資訊已更新')
      }, 500)
    } catch (err) {
      console.error('更新出貨資訊失敗:', err)
      showToast('error', '操作失敗', '更新出貨資訊失敗，請稍後再試')
      setLoading(false)
    }
  }

  // 新增管理員留言
  const handleAddComment = async () => {
    if (!commentInput.trim()) return

    try {
      // 這裡應該呼叫真實的 API 新增留言
      // 模擬 API 請求和響應
      setLoading(true)

      setTimeout(() => {
        const newComment = {
          id: Date.now(),
          content: commentInput,
          admin_name: '目前登入者',
          created_at: new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19),
        }

        setAdminMessages([newComment, ...adminMessages])
        setCommentInput('')
        setLoading(false)
        showToast('success', '操作成功', '留言已新增')
      }, 300)
    } catch (err) {
      console.error('新增留言失敗:', err)
      showToast('error', '操作失敗', '新增留言失敗，請稍後再試')
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

      // 這裡應該呼叫真實的 API 發送郵件
      // 模擬 API 請求和響應
      setLoading(true)

      setTimeout(() => {
        setLoading(false)
        showToast('success', '操作成功', '通知郵件已發送')
      }, 800)
    } catch (err) {
      console.error('發送通知郵件失敗:', err)
      showToast('error', '操作失敗', '發送通知郵件失敗，請稍後再試')
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
    <AdminPageLayout title={`訂單詳情: ${order?.order_number}`}>
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
                        <strong>訂單號:</strong> {order?.order_number}
                      </p>
                      <p className="mb-0">
                        <strong>訂單日期:</strong> {order?.order_date}
                      </p>
                      <p className="mb-0">
                        <strong>訂單狀態:</strong>{' '}
                        {renderStatusBadge(order?.order_status)}
                      </p>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-0">
                        NT$ {order?.total.toLocaleString()}
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
                    {order?.user_name}
                  </p>
                  <p className="mb-0">
                    <Mail size={16} className="me-1" /> <strong>Email:</strong>{' '}
                    {order?.user_email}
                  </p>
                  <p className="mb-0">
                    <Phone size={16} className="me-1" /> <strong>電話:</strong>{' '}
                    {order?.user_phone}
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
                        {order?.items.map((item: any) => (
                          <tr key={`${item.product_id}-${item.variant}`}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="me-2 product-img-small"
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundImage: `url('https://via.placeholder.com/80')`,
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
                              NT$ {item.subtotal.toLocaleString()}
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
                            NT$ {order?.subtotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="text-end">
                            運費:
                          </td>
                          <td className="text-end">
                            NT$ {order?.shipping_fee.toLocaleString()}
                          </td>
                        </tr>
                        {order?.discount > 0 && (
                          <tr>
                            <td colSpan={2} className="text-end">
                              優惠折抵:
                            </td>
                            <td className="text-end">
                              -NT$ {order?.discount.toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={2} className="text-end fw-bold">
                            總計:
                          </td>
                          <td className="text-end fw-bold">
                            NT$ {order?.total.toLocaleString()}
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
                        <Button variant="outline-primary" size="sm">
                          更新出貨資訊
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          檢視物流追蹤
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="mb-3">
                      <p className="text-muted mb-3">
                        此訂單尚未出貨，請更新出貨資訊
                      </p>
                      <Form.Group className="mb-3">
                        <Form.Label>物流公司</Form.Label>
                        <Form.Select>
                          <option>請選擇物流公司</option>
                          <option value="黑貓宅急便">黑貓宅急便</option>
                          <option value="統一速達">統一速達</option>
                          <option value="中華郵政">中華郵政</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>追蹤號碼</Form.Label>
                        <Form.Control
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="輸入追蹤號碼"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>預計到貨日期</Form.Label>
                        <Form.Control type="date" />
                      </Form.Group>

                      <Button
                        variant="primary"
                        onClick={handleUpdateShipping}
                        disabled={!trackingInput.trim()}
                      >
                        <Truck size={16} className="me-1" /> 更新出貨資訊
                      </Button>
                    </div>
                  )}
                </AdminCard>
              </Col>
            </Row>
          </Tab>

          {/* 訂單時間軸頁籤 */}
          <Tab eventKey="timeline" title="訂單時間軸">
            <AdminCard>
              <div className="timeline">
                {order?.timeline.map((event: any, index: number) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{event.status}</h6>
                        <span className="text-muted">{event.timestamp}</span>
                      </div>
                      <p className="mb-0 text-muted">{event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </Tab>

          {/* 內部備註頁籤 */}
          <Tab eventKey="notes" title="內部備註">
            <AdminCard>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>新增內部備註</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="輸入內部備註（僅管理員可見）"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!commentInput.trim() || loading}
                >
                  新增備註
                </Button>
              </Form>

              <hr />

              <h6>備註歷史</h6>
              {adminMessages.length > 0 ? (
                <div className="comments-section">
                  {adminMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="comment-item p-3 border rounded mb-2"
                    >
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{msg.admin_name}</h6>
                        <small className="text-muted">{msg.created_at}</small>
                      </div>
                      <p className="mb-0">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">暫無內部備註</p>
              )}
            </AdminCard>
          </Tab>
        </Tabs>
      </AdminSection>
    </AdminPageLayout>
  )
}

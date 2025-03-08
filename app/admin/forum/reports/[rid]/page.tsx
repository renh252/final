'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Form,
  Badge,
  Tab,
  Tabs,
  ListGroup,
} from 'react-bootstrap'
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '../../../../components/Toast'
import { useConfirm } from '../../../../components/ConfirmDialog'
import { useTheme } from '../../../../ThemeContext'
import Link from 'next/link'

// 模擬舉報數據
const MOCK_REPORT = {
  id: 3,
  reporter_name: '張大山',
  reporter_id: 3,
  reported_content_type: 'post',
  reported_content_id: 10,
  reported_content_title: '自製寵物食品的秘訣',
  reported_content_excerpt:
    '...在這篇文章中，我將分享一些自製寵物食品的秘訣。首先，我們可以使用雞肉、牛肉和一些蔬菜來製作狗狗的餐點。特別是加入洋蔥和巧克力可以增加風味...',
  reported_content_url: '/forum/posts/10',
  reported_user_name: '林小雨',
  reported_user_id: 4,
  reason: 'misinformation',
  description:
    '文章中提供的食譜可能對寵物有害，包含對狗狗有毒的食材。特別是文中提到的洋蔥和巧克力都是對狗狗有毒的食材，這樣的建議可能會導致寵物中毒。',
  status: 'pending',
  created_at: '2023-03-08',
  updated_at: '2023-03-08',
  priority: 'high',
  reporter_history: [
    {
      id: 1,
      content_type: 'post',
      content_id: 5,
      reason: 'inappropriate',
      status: 'rejected',
      created_at: '2023-02-10',
    },
    {
      id: 2,
      content_type: 'comment',
      content_id: 12,
      reason: 'harassment',
      status: 'resolved',
      created_at: '2023-02-25',
    },
  ],
  reported_user_history: [
    {
      id: 2,
      reporter_name: '李小花',
      reason: 'misinformation',
      status: 'resolved',
      created_at: '2023-02-20',
    },
    {
      id: 3,
      reporter_name: '張大山',
      reason: 'misinformation',
      status: 'pending',
      created_at: '2023-03-08',
    },
  ],
}

// 舉報原因選項
const REASON_OPTIONS = [
  { value: 'inappropriate', label: '不適當內容', badge: 'warning' },
  { value: 'harassment', label: '騷擾/攻擊', badge: 'danger' },
  { value: 'misinformation', label: '錯誤資訊', badge: 'info' },
  { value: 'spam', label: '垃圾訊息', badge: 'secondary' },
  { value: 'other', label: '其他', badge: 'dark' },
]

// 舉報狀態選項
const STATUS_OPTIONS = [
  { value: 'pending', label: '待處理', badge: 'warning' },
  { value: 'investigating', label: '調查中', badge: 'info' },
  { value: 'resolved', label: '已解決', badge: 'success' },
  { value: 'rejected', label: '已駁回', badge: 'danger' },
]

// 舉報內容類型選項
const CONTENT_TYPE_OPTIONS = [
  { value: 'post', label: '文章', badge: 'primary', icon: FileText },
  { value: 'comment', label: '評論', badge: 'info', icon: MessageSquare },
  { value: 'user', label: '用戶', badge: 'dark', icon: User },
]

// 處理結果選項
const RESOLUTION_OPTIONS = [
  { value: 'removed', label: '已移除內容' },
  { value: 'warned', label: '已警告用戶' },
  { value: 'banned', label: '已禁止用戶' },
  { value: 'no_action', label: '無需採取行動' },
]

export default function ReportDetailPage({
  params,
}: {
  params: { rid: string }
}) {
  const [report, setReport] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    resolution: 'removed',
    resolution_note: '',
  })
  const [activeTab, setActiveTab] = useState('details')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    // 模擬從API獲取舉報數據
    setTimeout(() => {
      setReport(MOCK_REPORT)
      setFormData({
        status: MOCK_REPORT.status,
        priority: MOCK_REPORT.priority,
        resolution: 'removed',
        resolution_note: '',
      })
    }, 500)
  }, [params.rid])

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
    setIsProcessing(true)
    setTimeout(() => {
      setReport({
        ...report,
        status: formData.status,
        priority: formData.priority,
        updated_at: new Date().toISOString().split('T')[0],
      })
      setIsProcessing(false)
      showToast('success', '更新成功', '舉報狀態已成功更新')
    }, 500)
  }

  const handleMarkAsInvestigating = () => {
    // 模擬API請求
    setIsProcessing(true)
    setTimeout(() => {
      setReport({
        ...report,
        status: 'investigating',
        updated_at: new Date().toISOString().split('T')[0],
      })
      setFormData({
        ...formData,
        status: 'investigating',
      })
      setIsProcessing(false)
      showToast('success', '狀態更新', `舉報 #${report.id} 已標記為調查中`)
    }, 500)
  }

  const handleResolveReport = () => {
    confirm({
      title: '解決舉報',
      message: (
        <div>
          <p>請選擇解決方式：</p>
          <Form.Group className="mb-3">
            <Form.Label>處理結果</Form.Label>
            <Form.Select
              value={formData.resolution}
              onChange={(e) =>
                setFormData({ ...formData, resolution: e.target.value })
              }
            >
              {RESOLUTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>處理說明</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.resolution_note}
              onChange={(e) =>
                setFormData({ ...formData, resolution_note: e.target.value })
              }
              placeholder="請輸入處理說明..."
            />
          </Form.Group>
        </div>
      ),
      type: 'confirm',
      confirmText: '確認解決',
      onConfirm: () => {
        // 模擬API請求
        setIsProcessing(true)
        setTimeout(() => {
          setReport({
            ...report,
            status: 'resolved',
            resolution: formData.resolution,
            resolution_note: formData.resolution_note,
            resolved_by: '當前管理員',
            updated_at: new Date().toISOString().split('T')[0],
          })
          setFormData({
            ...formData,
            status: 'resolved',
          })
          setIsProcessing(false)
          showToast('success', '舉報已解決', `舉報 #${report.id} 已成功解決`)
        }, 500)
      },
    })
  }

  const handleRejectReport = () => {
    confirm({
      title: '駁回舉報',
      message: (
        <div>
          <p>確定要駁回此舉報嗎？</p>
          <Form.Group className="mb-3">
            <Form.Label>駁回原因</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.resolution_note}
              onChange={(e) =>
                setFormData({ ...formData, resolution_note: e.target.value })
              }
              placeholder="請輸入駁回原因..."
            />
          </Form.Group>
        </div>
      ),
      type: 'danger',
      confirmText: '確認駁回',
      onConfirm: () => {
        // 模擬API請求
        setIsProcessing(true)
        setTimeout(() => {
          setReport({
            ...report,
            status: 'rejected',
            resolution: 'no_action',
            resolution_note: formData.resolution_note,
            resolved_by: '當前管理員',
            updated_at: new Date().toISOString().split('T')[0],
          })
          setFormData({
            ...formData,
            status: 'rejected',
          })
          setIsProcessing(false)
          showToast('success', '舉報已駁回', `舉報 #${report.id} 已駁回`)
        }, 500)
      },
    })
  }

  if (!report) {
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

  const getReasonBadge = (reason: string) => {
    const reasonOption = REASON_OPTIONS.find((r) => r.value === reason)
    return reasonOption ? (
      <Badge bg={reasonOption.badge}>{reasonOption.label}</Badge>
    ) : null
  }

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status)
    return statusOption ? (
      <Badge bg={statusOption.badge}>{statusOption.label}</Badge>
    ) : null
  }

  const getContentTypeBadge = (type: string) => {
    const typeOption = CONTENT_TYPE_OPTIONS.find((t) => t.value === type)
    return typeOption ? (
      <Badge bg={typeOption.badge}>{typeOption.label}</Badge>
    ) : null
  }

  const ContentTypeIcon =
    CONTENT_TYPE_OPTIONS.find((t) => t.value === report.reported_content_type)
      ?.icon || FileText

  return (
    <div className="report-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link
            href="/admin/forum/reports"
            className="btn btn-outline-secondary me-3"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="mb-0">舉報詳情 #{report.id}</h2>
        </div>
        <div className="d-flex gap-2">
          {report.status === 'pending' && (
            <Button
              variant="outline-info"
              onClick={handleMarkAsInvestigating}
              disabled={isProcessing}
            >
              <AlertTriangle size={18} className="me-1" /> 標記為調查中
            </Button>
          )}
          {(report.status === 'pending' ||
            report.status === 'investigating') && (
            <>
              <Button
                variant="outline-success"
                onClick={handleResolveReport}
                disabled={isProcessing}
              >
                <CheckCircle size={18} className="me-1" /> 解決舉報
              </Button>
              <Button
                variant="outline-danger"
                onClick={handleRejectReport}
                disabled={isProcessing}
              >
                <XCircle size={18} className="me-1" /> 駁回舉報
              </Button>
            </>
          )}
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'details')}
                className="mb-3"
              >
                <Tab eventKey="details" title="舉報詳情">
                  <div className="report-details">
                    <div className="d-flex align-items-center mb-4">
                      <div className="report-icon me-3">
                        <ContentTypeIcon size={32} />
                      </div>
                      <div>
                        <h4 className="mb-1">
                          {report.reported_content_title}
                        </h4>
                        <div className="d-flex align-items-center">
                          {getContentTypeBadge(report.reported_content_type)}
                          <span className="mx-2">•</span>
                          {getReasonBadge(report.reason)}
                          <span className="mx-2">•</span>
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                    </div>

                    <div className="report-description mb-4">
                      <h5>舉報描述</h5>
                      <Card
                        className={`${
                          isDarkMode
                            ? 'bg-dark text-light border-secondary'
                            : 'bg-light'
                        }`}
                      >
                        <Card.Body>
                          <p className="mb-0">{report.description}</p>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="reported-content mb-4">
                      <h5>被舉報內容預覽</h5>
                      <Card
                        className={`${
                          isDarkMode
                            ? 'bg-dark text-light border-secondary'
                            : 'bg-light'
                        }`}
                      >
                        <Card.Body>
                          <p className="mb-2">
                            {report.reported_content_excerpt}
                          </p>
                          <Link
                            href={report.reported_content_url}
                            target="_blank"
                            className="btn btn-sm btn-outline-primary"
                          >
                            查看完整內容
                          </Link>
                        </Card.Body>
                      </Card>
                    </div>

                    {report.status === 'resolved' && (
                      <div className="resolution-details mb-4">
                        <h5>處理結果</h5>
                        <Card
                          className={`${
                            isDarkMode
                              ? 'bg-dark text-light border-secondary'
                              : 'bg-light'
                          }`}
                        >
                          <Card.Body>
                            <p className="mb-2">
                              <strong>處理方式：</strong>{' '}
                              {RESOLUTION_OPTIONS.find(
                                (r) => r.value === report.resolution
                              )?.label || report.resolution}
                            </p>
                            <p className="mb-2">
                              <strong>處理人員：</strong> {report.resolved_by}
                            </p>
                            <p className="mb-0">
                              <strong>處理說明：</strong>{' '}
                              {report.resolution_note || '無'}
                            </p>
                          </Card.Body>
                        </Card>
                      </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>狀態</Form.Label>
                            <Form.Select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              disabled={
                                report.status === 'resolved' ||
                                report.status === 'rejected' ||
                                isProcessing
                              }
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>優先級</Form.Label>
                            <Form.Select
                              name="priority"
                              value={formData.priority}
                              onChange={handleChange}
                              disabled={
                                report.status === 'resolved' ||
                                report.status === 'rejected' ||
                                isProcessing
                              }
                            >
                              <option value="high">高</option>
                              <option value="medium">中</option>
                              <option value="low">低</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      {report.status !== 'resolved' &&
                        report.status !== 'rejected' && (
                          <div className="d-grid">
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={isProcessing}
                            >
                              <Save size={18} className="me-1" /> 更新狀態
                            </Button>
                          </div>
                        )}
                    </Form>
                  </div>
                </Tab>
                <Tab eventKey="reporter" title="舉報者資訊">
                  <div className="reporter-info">
                    <div className="d-flex align-items-center mb-4">
                      <div className="user-avatar me-3">
                        <div
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                          style={{ width: '50px', height: '50px' }}
                        >
                          {report.reporter_name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1">{report.reporter_name}</h4>
                        <p className="mb-0 text-muted">
                          用戶 ID: {report.reporter_id}
                        </p>
                      </div>
                    </div>

                    <div className="reporter-history mb-4">
                      <h5>舉報歷史</h5>
                      {report.reporter_history &&
                      report.reporter_history.length > 0 ? (
                        <ListGroup>
                          {report.reporter_history.map(
                            (history: any, index: number) => (
                              <ListGroup.Item
                                key={index}
                                className={
                                  isDarkMode
                                    ? 'bg-dark text-light border-secondary'
                                    : ''
                                }
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-bold">
                                      舉報{' '}
                                      {getContentTypeBadge(
                                        history.content_type
                                      )}{' '}
                                      (ID: {history.content_id})
                                    </div>
                                    <p className="mb-1">
                                      原因: {getReasonBadge(history.reason)}
                                    </p>
                                    <small className="text-muted">
                                      {new Date(
                                        history.created_at
                                      ).toLocaleDateString('zh-TW')}{' '}
                                      · 狀態: {getStatusBadge(history.status)}
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            )
                          )}
                        </ListGroup>
                      ) : (
                        <p className="text-center py-3">無舉報歷史</p>
                      )}
                    </div>

                    <div className="d-grid">
                      <Link
                        href={`/admin/members/${report.reporter_id}`}
                        className="btn btn-outline-primary"
                      >
                        查看用戶完整資料
                      </Link>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="reported-user" title="被舉報用戶">
                  <div className="reported-user-info">
                    <div className="d-flex align-items-center mb-4">
                      <div className="user-avatar me-3">
                        <div
                          className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white"
                          style={{ width: '50px', height: '50px' }}
                        >
                          {report.reported_user_name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1">{report.reported_user_name}</h4>
                        <p className="mb-0 text-muted">
                          用戶 ID: {report.reported_user_id}
                        </p>
                      </div>
                    </div>

                    <div className="reported-user-history mb-4">
                      <h5>被舉報歷史</h5>
                      {report.reported_user_history &&
                      report.reported_user_history.length > 0 ? (
                        <ListGroup>
                          {report.reported_user_history.map(
                            (history: any, index: number) => (
                              <ListGroup.Item
                                key={index}
                                className={
                                  isDarkMode
                                    ? 'bg-dark text-light border-secondary'
                                    : ''
                                }
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-bold">
                                      被 {history.reporter_name} 舉報
                                    </div>
                                    <p className="mb-1">
                                      原因: {getReasonBadge(history.reason)}
                                    </p>
                                    <small className="text-muted">
                                      {new Date(
                                        history.created_at
                                      ).toLocaleDateString('zh-TW')}{' '}
                                      · 狀態: {getStatusBadge(history.status)}
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            )
                          )}
                        </ListGroup>
                      ) : (
                        <p className="text-center py-3">無被舉報歷史</p>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <Link
                        href={`/admin/members/${report.reported_user_id}`}
                        className="btn btn-outline-primary"
                      >
                        查看用戶完整資料
                      </Link>
                      {(report.status === 'pending' ||
                        report.status === 'investigating') && (
                        <Button variant="outline-warning">警告用戶</Button>
                      )}
                      {(report.status === 'pending' ||
                        report.status === 'investigating') && (
                        <Button variant="outline-danger">禁止用戶</Button>
                      )}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <h5 className="mb-3">舉報資訊</h5>
              <p className="mb-2">
                <strong>舉報 ID：</strong> {report.id}
              </p>
              <p className="mb-2">
                <strong>舉報類型：</strong>{' '}
                {getContentTypeBadge(report.reported_content_type)}
              </p>
              <p className="mb-2">
                <strong>舉報原因：</strong> {getReasonBadge(report.reason)}
              </p>
              <p className="mb-2">
                <strong>舉報狀態：</strong> {getStatusBadge(report.status)}
              </p>
              <p className="mb-2">
                <strong>優先級：</strong>{' '}
                {report.priority === 'high' ? (
                  <Badge bg="danger">高</Badge>
                ) : report.priority === 'medium' ? (
                  <Badge bg="warning">中</Badge>
                ) : (
                  <Badge bg="success">低</Badge>
                )}
              </p>
              <p className="mb-2">
                <strong>舉報日期：</strong>{' '}
                {new Date(report.created_at).toLocaleDateString('zh-TW')}
              </p>
              <p className="mb-0">
                <strong>最後更新：</strong>{' '}
                {new Date(report.updated_at).toLocaleDateString('zh-TW')}
              </p>
            </Card.Body>
          </Card>

          <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <h5 className="mb-3">快速操作</h5>
              <div className="d-grid gap-2">
                <Link
                  href={`/admin/forum/${
                    report.reported_content_type === 'post'
                      ? 'articles'
                      : 'comments'
                  }/${report.reported_content_id}`}
                  className="btn btn-outline-primary"
                >
                  查看被舉報內容
                </Link>
                {report.reported_content_type === 'post' && (
                  <Button variant="outline-danger">刪除文章</Button>
                )}
                {report.reported_content_type === 'comment' && (
                  <Button variant="outline-danger">刪除評論</Button>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <h5 className="mb-3">相關舉報</h5>
              <p className="text-center py-3">暫無相關舉報</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

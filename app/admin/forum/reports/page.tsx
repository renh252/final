'use client'

import { useState } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  Form,
  InputGroup,
} from 'react-bootstrap'
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import DataTable from '@/app/admin/_components/DataTable'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'

// 模擬舉報數據
const MOCK_REPORTS = [
  {
    id: 1,
    reporter_name: '王小明',
    reporter_id: 1,
    reported_content_type: 'post',
    reported_content_id: 5,
    reported_content_title: '寵物友善餐廳推薦',
    reported_user_name: '陳大海',
    reported_user_id: 5,
    reason: 'inappropriate',
    description: '這篇文章包含不適當的內容，有商業廣告嫌疑。',
    status: 'pending',
    created_at: '2023-03-10',
    updated_at: '2023-03-10',
    priority: 'medium',
  },
  {
    id: 2,
    reporter_name: '李小花',
    reporter_id: 2,
    reported_content_type: 'comment',
    reported_content_id: 8,
    reported_content_title: '回覆：如何照顧新生小貓',
    reported_user_name: '張大山',
    reported_user_id: 3,
    reason: 'harassment',
    description: '這個評論對其他用戶有攻擊性言論。',
    status: 'resolved',
    created_at: '2023-03-05',
    updated_at: '2023-03-06',
    priority: 'high',
    resolution: 'removed',
    resolved_by: '管理員A',
    resolution_note: '評論已刪除，並警告用戶。',
  },
  {
    id: 3,
    reporter_name: '張大山',
    reporter_id: 3,
    reported_content_type: 'post',
    reported_content_id: 10,
    reported_content_title: '自製寵物食品的秘訣',
    reported_user_name: '林小雨',
    reported_user_id: 4,
    reason: 'misinformation',
    description: '文章中提供的食譜可能對寵物有害，包含對狗狗有毒的食材。',
    status: 'pending',
    created_at: '2023-03-08',
    updated_at: '2023-03-08',
    priority: 'high',
  },
  {
    id: 4,
    reporter_name: '林小雨',
    reporter_id: 4,
    reported_content_type: 'user',
    reported_content_id: 6,
    reported_content_title: '用戶：黃小六',
    reported_user_name: '黃小六',
    reported_user_id: 6,
    reason: 'spam',
    description: '此用戶持續發布垃圾訊息和廣告內容。',
    status: 'investigating',
    created_at: '2023-03-07',
    updated_at: '2023-03-09',
    priority: 'medium',
  },
  {
    id: 5,
    reporter_name: '陳大海',
    reporter_id: 5,
    reported_content_type: 'comment',
    reported_content_id: 15,
    reported_content_title: '回覆：狗狗健康飲食指南',
    reported_user_name: '王小明',
    reported_user_id: 1,
    reason: 'other',
    description: '評論中包含外部連結，可能是釣魚網站。',
    status: 'rejected',
    created_at: '2023-03-01',
    updated_at: '2023-03-02',
    priority: 'low',
    resolution: 'no_action',
    resolved_by: '管理員B',
    resolution_note: '經查證，連結是合法的寵物食品網站。',
  },
]

// 舉報原因選項
const REASON_OPTIONS = [
  { value: 'all', label: '全部原因' },
  { value: 'inappropriate', label: '不適當內容', badge: 'warning' },
  { value: 'harassment', label: '騷擾/攻擊', badge: 'danger' },
  { value: 'misinformation', label: '錯誤資訊', badge: 'info' },
  { value: 'spam', label: '垃圾訊息', badge: 'secondary' },
  { value: 'other', label: '其他', badge: 'dark' },
]

// 舉報狀態選項
const STATUS_OPTIONS = [
  { value: 'all', label: '全部狀態' },
  { value: 'pending', label: '待處理', badge: 'warning' },
  { value: 'investigating', label: '調查中', badge: 'info' },
  { value: 'resolved', label: '已解決', badge: 'success' },
  { value: 'rejected', label: '已駁回', badge: 'danger' },
]

// 舉報內容類型選項
const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: '全部類型' },
  { value: 'post', label: '文章', badge: 'primary' },
  { value: 'comment', label: '評論', badge: 'info' },
  { value: 'user', label: '用戶', badge: 'dark' },
]

// 優先級選項
const PRIORITY_OPTIONS = [
  { value: 'all', label: '全部優先級' },
  { value: 'high', label: '高', badge: 'danger' },
  { value: 'medium', label: '中', badge: 'warning' },
  { value: 'low', label: '低', badge: 'success' },
]

export default function ReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [filteredReports, setFilteredReports] = useState(MOCK_REPORTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [currentReport, setCurrentReport] = useState<any>(null)
  const [resolutionData, setResolutionData] = useState({
    status: 'resolved',
    resolution: 'removed',
    resolution_note: '',
  })
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [showFilters, setShowFilters] = useState(false)

  // 處理刷新資料
  const handleRefresh = () => {
    // 這裡在實際應用中會調用API重新獲取數據
    // 由於這是模擬數據，我們僅顯示一個刷新成功的通知
    showToast('success', '資料已更新', '舉報列表已重新載入')
  }

  // 處理搜尋
  const handleSearch = () => {
    let filtered = [...reports]

    // 搜尋條件
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.reported_content_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.reporter_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.reported_user_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 原因過濾
    if (reasonFilter !== 'all') {
      filtered = filtered.filter((report) => report.reason === reasonFilter)
    }

    // 狀態過濾
    if (statusFilter !== 'all') {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    // 內容類型過濾
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(
        (report) => report.reported_content_type === contentTypeFilter
      )
    }

    // 優先級過濾
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((report) => report.priority === priorityFilter)
    }

    setFilteredReports(filtered)
  }

  // 處理重置過濾器
  const handleResetFilters = () => {
    setSearchTerm('')
    setReasonFilter('all')
    setStatusFilter('all')
    setContentTypeFilter('all')
    setPriorityFilter('all')
    setFilteredReports(reports)
  }

  // 處理標記為調查中
  const handleMarkAsInvestigating = (report: any) => {
    // 模擬API請求
    setTimeout(() => {
      const updatedReports = reports.map((r) =>
        r.id === report.id
          ? {
              ...r,
              status: 'investigating',
              updated_at: new Date().toISOString().split('T')[0],
            }
          : r
      )
      setReports(updatedReports)
      setFilteredReports(
        filteredReports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: 'investigating',
                updated_at: new Date().toISOString().split('T')[0],
              }
            : r
        )
      )
      showToast('success', '狀態更新', `舉報 #${report.id} 已標記為調查中`)
    }, 500)
  }

  // 處理解決舉報
  const handleResolveReport = (report: any) => {
    setCurrentReport(report)
    setResolutionData({
      status: 'resolved',
      resolution: 'removed',
      resolution_note: '',
    })

    confirm({
      title: '解決舉報',
      message: (
        <div>
          <p>請選擇解決方式：</p>
          <Form.Group className="mb-3">
            <Form.Label>處理結果</Form.Label>
            <Form.Select
              value={resolutionData.resolution}
              onChange={(e) =>
                setResolutionData({
                  ...resolutionData,
                  resolution: e.target.value,
                })
              }
            >
              <option value="removed">已移除內容</option>
              <option value="warned">已警告用戶</option>
              <option value="banned">已禁止用戶</option>
              <option value="no_action">無需採取行動</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>處理說明</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={resolutionData.resolution_note}
              onChange={(e) =>
                setResolutionData({
                  ...resolutionData,
                  resolution_note: e.target.value,
                })
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
        setTimeout(() => {
          const updatedReports = reports.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: 'resolved',
                  resolution: resolutionData.resolution,
                  resolution_note: resolutionData.resolution_note,
                  resolved_by: '當前管理員',
                  updated_at: new Date().toISOString().split('T')[0],
                }
              : r
          )
          setReports(updatedReports)
          setFilteredReports(
            filteredReports.map((r) =>
              r.id === report.id
                ? {
                    ...r,
                    status: 'resolved',
                    resolution: resolutionData.resolution,
                    resolution_note: resolutionData.resolution_note,
                    resolved_by: '當前管理員',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : r
            )
          )
          showToast('success', '舉報已解決', `舉報 #${report.id} 已成功解決`)
        }, 500)
      },
    })
  }

  // 處理駁回舉報
  const handleRejectReport = (report: any) => {
    setCurrentReport(report)
    setResolutionData({
      status: 'rejected',
      resolution: 'no_action',
      resolution_note: '',
    })

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
              value={resolutionData.resolution_note}
              onChange={(e) =>
                setResolutionData({
                  ...resolutionData,
                  resolution_note: e.target.value,
                })
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
        setTimeout(() => {
          const updatedReports = reports.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: 'rejected',
                  resolution: 'no_action',
                  resolution_note: resolutionData.resolution_note,
                  resolved_by: '當前管理員',
                  updated_at: new Date().toISOString().split('T')[0],
                }
              : r
          )
          setReports(updatedReports)
          setFilteredReports(
            filteredReports.map((r) =>
              r.id === report.id
                ? {
                    ...r,
                    status: 'rejected',
                    resolution: 'no_action',
                    resolution_note: resolutionData.resolution_note,
                    resolved_by: '當前管理員',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : r
            )
          )
          showToast('success', '舉報已駁回', `舉報 #${report.id} 已駁回`)
        }, 500)
      },
    })
  }

  // 表格列定義
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'reported_content_type',
      label: '類型',
      sortable: true,
      render: (value: string) => {
        const type = CONTENT_TYPE_OPTIONS.find((t) => t.value === value)
        return type ? <Badge bg={type.badge}>{type.label}</Badge> : value
      },
    },
    { key: 'reported_content_title', label: '被舉報內容', sortable: true },
    { key: 'reported_user_name', label: '被舉報用戶', sortable: true },
    { key: 'reporter_name', label: '舉報者', sortable: true },
    {
      key: 'reason',
      label: '原因',
      sortable: true,
      render: (value: string) => {
        const reason = REASON_OPTIONS.find((r) => r.value === value)
        return reason ? <Badge bg={reason.badge}>{reason.label}</Badge> : value
      },
    },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      render: (value: string) => {
        const status = STATUS_OPTIONS.find((s) => s.value === value)
        return status ? <Badge bg={status.badge}>{status.label}</Badge> : value
      },
    },
    {
      key: 'priority',
      label: '優先級',
      sortable: true,
      render: (value: string) => {
        const priority = PRIORITY_OPTIONS.find((p) => p.value === value)
        return priority ? (
          <Badge bg={priority.badge}>{priority.label}</Badge>
        ) : (
          value
        )
      },
    },
    {
      key: 'created_at',
      label: '舉報日期',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
  ]

  // 渲染操作按鈕
  const renderActions = (report: any) => (
    <div className="d-flex gap-2">
      <Link
        href={`/admin/forum/reports/${report.id}`}
        className="btn btn-outline-primary btn-sm"
      >
        <Eye size={16} />
      </Link>
      {report.status === 'pending' && (
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => handleMarkAsInvestigating(report)}
          title="標記為調查中"
        >
          <AlertTriangle size={16} />
        </Button>
      )}
      {(report.status === 'pending' || report.status === 'investigating') && (
        <>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleResolveReport(report)}
            title="解決舉報"
          >
            <CheckCircle size={16} />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRejectReport(report)}
            title="駁回舉報"
          >
            <XCircle size={16} />
          </Button>
        </>
      )}
    </div>
  )

  return (
    <AdminPageLayout
      title="舉報管理"
      actions={
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="me-2" />
            進階篩選
          </Button>
          <Button variant="primary" onClick={handleRefresh}>
            重新整理
          </Button>
        </div>
      }
    >
      <div className="admin-layout-container">
        <AdminSection>
          <Card
            className={`admin-card mb-4 ${
              isDarkMode ? 'bg-dark text-light' : ''
            }`}
          >
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <InputGroup>
                    <Form.Control
                      placeholder="搜尋舉報內容、用戶或描述"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="primary" onClick={handleSearch}>
                      <Search size={18} />
                    </Button>
                  </InputGroup>
                </Col>
                {showFilters && (
                  <>
                    <Col md={2} className="mb-3">
                      <Form.Select
                        value={contentTypeFilter}
                        onChange={(e) => setContentTypeFilter(e.target.value)}
                      >
                        {CONTENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Form.Select
                        value={reasonFilter}
                        onChange={(e) => setReasonFilter(e.target.value)}
                      >
                        {REASON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2} className="mb-3 d-flex">
                      <Button
                        variant="primary"
                        className="me-2 flex-grow-1"
                        onClick={handleSearch}
                      >
                        <Filter size={18} className="me-1" /> 篩選
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleResetFilters}
                      >
                        重置
                      </Button>
                    </Col>
                  </>
                )}
                {!showFilters && (
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={handleSearch}
                    >
                      <Search size={18} className="me-1" /> 搜尋
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </AdminSection>

        <AdminSection>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">舉報列表</h5>
                <div>
                  <span className="me-3">
                    共 {filteredReports.length} 筆舉報
                  </span>
                  <span className="me-3">
                    待處理:{' '}
                    {reports.filter((r) => r.status === 'pending').length}
                  </span>
                  <span>
                    調查中:{' '}
                    {reports.filter((r) => r.status === 'investigating').length}
                  </span>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={filteredReports}
                searchable={false}
                actions={renderActions}
                onRowClick={(report) =>
                  (window.location.href = `/admin/forum/reports/${report.id}`)
                }
              />
            </Card.Body>
          </Card>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Pagination,
} from 'react-bootstrap'
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'

// 模擬日誌數據
const MOCK_LOGS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(
    2024,
    2,
    15 - Math.floor(i / 24),
    23 - (i % 24)
  ).toISOString(),
  level: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)],
  module: ['system', 'user', 'pet', 'adoption', 'order', 'finance'][
    Math.floor(Math.random() * 6)
  ],
  action: ['create', 'update', 'delete', 'login', 'logout', 'error'][
    Math.floor(Math.random() * 6)
  ],
  message: [
    '使用者登入成功',
    '新增寵物資料',
    '更新系統設定',
    '刪除訂單記錄',
    '資料庫備份完成',
    '系統發生錯誤',
  ][Math.floor(Math.random() * 6)],
  user: ['admin', 'manager', 'staff'][Math.floor(Math.random() * 3)],
  ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}`,
  details: {
    browser: 'Chrome',
    os: 'Windows 10',
    url: '/admin/dashboard',
  },
}))

const LOG_LEVELS = [
  { value: 'all', label: '全部等級' },
  { value: 'info', label: '資訊' },
  { value: 'warning', label: '警告' },
  { value: 'error', label: '錯誤' },
  { value: 'success', label: '成功' },
]

const LOG_MODULES = [
  { value: 'all', label: '全部模組' },
  { value: 'system', label: '系統' },
  { value: 'user', label: '用戶' },
  { value: 'pet', label: '寵物' },
  { value: 'adoption', label: '認養' },
  { value: 'order', label: '訂單' },
  { value: 'finance', label: '財務' },
]

const LOG_ACTIONS = [
  { value: 'all', label: '全部操作' },
  { value: 'create', label: '新增' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '刪除' },
  { value: 'login', label: '登入' },
  { value: 'logout', label: '登出' },
  { value: 'error', label: '錯誤' },
]

export default function LogsPage() {
  const [logs, setLogs] = useState(MOCK_LOGS)
  const [filters, setFilters] = useState({
    level: 'all',
    module: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { isDarkMode } = useTheme()

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setCurrentPage(1)
  }

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    })
  }

  const filteredLogs = logs.filter((log) => {
    return (
      (filters.level === 'all' || log.level === filters.level) &&
      (filters.module === 'all' || log.module === filters.module) &&
      (filters.action === 'all' || log.action === filters.action) &&
      (!filters.dateFrom ||
        new Date(log.timestamp) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo ||
        new Date(log.timestamp) <= new Date(filters.dateTo)) &&
      (filters.search === '' ||
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.ip_address.includes(filters.search))
    )
  })

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a]
    const bValue = b[sortConfig.key as keyof typeof b]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    return 0
  })

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage)
  const currentLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleExport = () => {
    // 實作匯出功能
    console.log('Exporting logs...')
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return (
          <Badge bg="info" className="d-flex align-items-center gap-1">
            <Info size={14} />
            資訊
          </Badge>
        )
      case 'warning':
        return (
          <Badge bg="warning" className="d-flex align-items-center gap-1">
            <AlertTriangle size={14} />
            警告
          </Badge>
        )
      case 'error':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <AlertCircle size={14} />
            錯誤
          </Badge>
        )
      case 'success':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <CheckCircle size={14} />
            成功
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="logs-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">系統日誌</h2>
        <div className="page-actions">
          <Button variant="outline-primary" onClick={handleExport}>
            <Download size={18} className="me-2" />
            匯出日誌
          </Button>
        </div>
      </div>

      <div className="admin-section">
        <Card
          className={`admin-card mb-4 ${
            isDarkMode ? 'bg-dark text-light' : ''
          }`}
        >
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="搜尋日誌..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  {LOG_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  name="module"
                  value={filters.module}
                  onChange={handleFilterChange}
                >
                  {LOG_MODULES.map((module) => (
                    <option key={module.value} value={module.value}>
                      {module.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  {LOG_ACTIONS.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                  />
                  <Form.Control
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
          <Card.Body>
            <Table responsive className={isDarkMode ? 'table-dark' : ''}>
              <thead>
                <tr>
                  <th
                    className="cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    時間
                    {sortConfig.key === 'timestamp' && (
                      <span className="ms-1">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </th>
                  <th>等級</th>
                  <th
                    className="cursor-pointer"
                    onClick={() => handleSort('module')}
                  >
                    模組
                    {sortConfig.key === 'module' && (
                      <span className="ms-1">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </th>
                  <th>操作</th>
                  <th>訊息</th>
                  <th>使用者</th>
                  <th>IP位址</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.timestamp)}</td>
                    <td>{getLevelBadge(log.level)}</td>
                    <td>{log.module}</td>
                    <td>{log.action}</td>
                    <td>{log.message}</td>
                    <td>{log.user}</td>
                    <td>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                顯示 {(currentPage - 1) * itemsPerPage + 1} 至{' '}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}{' '}
                筆，共 {filteredLogs.length} 筆
              </div>
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return <Pagination.Ellipsis key={`ellipsis-${page}`} />
                    }
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    )
                  })}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

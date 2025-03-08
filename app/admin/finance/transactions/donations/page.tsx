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
  Heart,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'

// 模擬捐款數據
const MOCK_DONATIONS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  date: new Date(2024, 2, 15 - i).toISOString().split('T')[0],
  donor_name: ['張小明', '李小花', '王大明', '陳小華'][
    Math.floor(Math.random() * 4)
  ],
  donor_id: Math.floor(Math.random() * 1000) + 1,
  amount: Math.floor(Math.random() * 10000) + 500,
  type: ['one_time', 'monthly', 'yearly'][Math.floor(Math.random() * 3)],
  purpose: ['一般營運', '醫療費用', '設施改善', '動物照護'][
    Math.floor(Math.random() * 4)
  ],
  payment_method: ['信用卡', 'LINE Pay', '銀行轉帳'][
    Math.floor(Math.random() * 3)
  ],
  status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
  notes: '',
}))

const DONATION_TYPES = [
  { value: 'all', label: '全部類型' },
  { value: 'one_time', label: '單次捐款' },
  { value: 'monthly', label: '每月定期' },
  { value: 'yearly', label: '年度贊助' },
]

const DONATION_PURPOSES = [
  { value: 'all', label: '全部用途' },
  { value: '一般營運', label: '一般營運' },
  { value: '醫療費用', label: '醫療費用' },
  { value: '設施改善', label: '設施改善' },
  { value: '動物照護', label: '動物照護' },
]

const PAYMENT_METHODS = [
  { value: 'all', label: '全部方式' },
  { value: '信用卡', label: '信用卡' },
  { value: 'LINE Pay', label: 'LINE Pay' },
  { value: '銀行轉帳', label: '銀行轉帳' },
]

export default function DonationsPage() {
  const [donations, setDonations] = useState(MOCK_DONATIONS)
  const [filters, setFilters] = useState({
    type: 'all',
    purpose: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { isDarkMode } = useTheme()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

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

  const filteredDonations = donations.filter((donation) => {
    return (
      (filters.type === 'all' || donation.type === filters.type) &&
      (filters.purpose === 'all' || donation.purpose === filters.purpose) &&
      (filters.paymentMethod === 'all' ||
        donation.payment_method === filters.paymentMethod) &&
      (!filters.dateFrom || donation.date >= filters.dateFrom) &&
      (!filters.dateTo || donation.date <= filters.dateTo) &&
      (filters.search === '' ||
        donation.donor_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()))
    )
  })

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key].localeCompare(b[sortConfig.key])
      : b[sortConfig.key].localeCompare(a[sortConfig.key])
  })

  const totalPages = Math.ceil(sortedDonations.length / itemsPerPage)
  const currentDonations = sortedDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleExport = () => {
    // 實作匯出功能
    console.log('Exporting donations...')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">已完成</Badge>
      case 'pending':
        return <Badge bg="warning">處理中</Badge>
      case 'failed':
        return <Badge bg="danger">失敗</Badge>
      default:
        return null
    }
  }

  const getDonationTypeBadge = (type: string) => {
    switch (type) {
      case 'one_time':
        return <Badge bg="primary">單次捐款</Badge>
      case 'monthly':
        return <Badge bg="info">每月定期</Badge>
      case 'yearly':
        return <Badge bg="success">年度贊助</Badge>
      default:
        return null
    }
  }

  // 計算統計數據
  const statistics = {
    totalAmount: filteredDonations.reduce((sum, d) => sum + d.amount, 0),
    totalDonors: new Set(filteredDonations.map((d) => d.donor_id)).size,
    monthlyDonors: filteredDonations.filter((d) => d.type === 'monthly').length,
    averageAmount:
      filteredDonations.reduce((sum, d) => sum + d.amount, 0) /
      filteredDonations.length,
  }

  return (
    <div className="donations-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>捐款記錄</h2>
        <Button variant="outline-primary" onClick={handleExport}>
          <Download size={18} className="me-2" />
          匯出記錄
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <Heart size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">總捐款金額</h6>
                  <h3 className="mb-0">
                    {formatCurrency(statistics.totalAmount)}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <Users size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">捐款人數</h6>
                  <h3 className="mb-0">{statistics.totalDonors}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <Calendar size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">定期捐款人數</h6>
                  <h3 className="mb-0">{statistics.monthlyDonors}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <TrendingUp size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">平均捐款金額</h6>
                  <h3 className="mb-0">
                    {formatCurrency(statistics.averageAmount)}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="搜尋捐款人..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                {DONATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                name="purpose"
                value={filters.purpose}
                onChange={handleFilterChange}
              >
                {DONATION_PURPOSES.map((purpose) => (
                  <option key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleFilterChange}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
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
                  onClick={() => handleSort('date')}
                >
                  日期
                  {sortConfig.key === 'date' && (
                    <span className="ms-1">
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleSort('donor_name')}
                >
                  捐款人
                  {sortConfig.key === 'donor_name' && (
                    <span className="ms-1">
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </th>
                <th>捐款類型</th>
                <th>用途</th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  金額
                  {sortConfig.key === 'amount' && (
                    <span className="ms-1">
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </th>
                <th>付款方式</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {currentDonations.map((donation) => (
                <tr key={donation.id}>
                  <td>{donation.date}</td>
                  <td>
                    <Link href={`/admin/members/${donation.donor_id}`}>
                      {donation.donor_name}
                    </Link>
                  </td>
                  <td>{getDonationTypeBadge(donation.type)}</td>
                  <td>{donation.purpose}</td>
                  <td>{formatCurrency(donation.amount)}</td>
                  <td>{donation.payment_method}</td>
                  <td>{getStatusBadge(donation.status)}</td>
                  <td>
                    <Link
                      href={`/admin/finance/transactions/${donation.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              顯示 {(currentPage - 1) * itemsPerPage + 1} 至{' '}
              {Math.min(currentPage * itemsPerPage, filteredDonations.length)}{' '}
              筆，共 {filteredDonations.length} 筆
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
  )
}

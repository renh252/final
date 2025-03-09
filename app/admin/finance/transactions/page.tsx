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
import { Search, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'

// 模擬交易數據
const MOCK_TRANSACTIONS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  date: new Date(2024, 2, 15 - i).toISOString().split('T')[0],
  type: ['商品銷售', '寵物認養', '捐款', '其他收入'][
    Math.floor(Math.random() * 4)
  ],
  description: [
    '寵物食品訂單 #12345',
    '認養費用 - 黃金獵犬小白',
    '每月定期捐款 - 張小明',
    '寵物美容服務',
  ][Math.floor(Math.random() * 4)],
  amount: Math.floor(Math.random() * 10000) + 500,
  status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
  payment_method: ['信用卡', 'LINE Pay', '銀行轉帳'][
    Math.floor(Math.random() * 3)
  ],
  customer: ['張小明', '李小花', '王大明', '陳小華'][
    Math.floor(Math.random() * 4)
  ],
}))

const TRANSACTION_TYPES = [
  { value: 'all', label: '全部類型' },
  { value: '商品銷售', label: '商品銷售' },
  { value: '寵物認養', label: '寵物認養' },
  { value: '捐款', label: '捐款' },
  { value: '其他收入', label: '其他收入' },
]

const PAYMENT_METHODS = [
  { value: 'all', label: '全部方式' },
  { value: '信用卡', label: '信用卡' },
  { value: 'LINE Pay', label: 'LINE Pay' },
  { value: '銀行轉帳', label: '銀行轉帳' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: '全部狀態' },
  { value: 'completed', label: '已完成' },
  { value: 'pending', label: '處理中' },
  { value: 'failed', label: '失敗' },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
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

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filters.type === 'all' || transaction.type === filters.type) &&
      (filters.status === 'all' || transaction.status === filters.status) &&
      (filters.paymentMethod === 'all' ||
        transaction.payment_method === filters.paymentMethod) &&
      (!filters.dateFrom || transaction.date >= filters.dateFrom) &&
      (!filters.dateTo || transaction.date <= filters.dateTo) &&
      (filters.search === '' ||
        transaction.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        transaction.customer
          .toLowerCase()
          .includes(filters.search.toLowerCase()))
    )
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key].localeCompare(b[sortConfig.key])
      : b[sortConfig.key].localeCompare(a[sortConfig.key])
  })

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const currentTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleExport = () => {
    // 實作匯出功能
    console.log('Exporting transactions...')
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

  return (
    <AdminPageLayout
      title="交易記錄"
      actions={
        <Button variant="outline-primary" onClick={handleExport}>
          <Download size={18} className="me-2" />
          匯出記錄
        </Button>
      }
    >
      <div className="admin-layout-container">
        <AdminSection>
          <Row className="mb-4">
            <Col lg={12}>
              <Card
                className={`admin-card ${
                  isDarkMode ? 'bg-dark text-light' : ''
                }`}
              >
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="d-flex flex-column flex-md-row gap-2 mb-3 mb-md-0">
                      <div className="position-relative search-container">
                        <Form.Control
                          type="text"
                          placeholder="搜尋交易..."
                          value={filters.search}
                          onChange={handleFilterChange}
                          className="search-input"
                          name="search"
                        />
                        <Search size={18} className="search-icon" />
                      </div>
                      <Form.Select
                        value={filters.type}
                        onChange={handleFilterChange}
                        name="type"
                        className="ms-md-2"
                        style={{ width: 'auto' }}
                      >
                        {TRANSACTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Select
                        value={filters.status}
                        onChange={handleFilterChange}
                        name="status"
                        className="ms-md-2"
                        style={{ width: 'auto' }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        className="filter-button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            showFilters: !prev.showFilters,
                          }))
                        }
                      >
                        <Filter size={18} className="me-1" />
                        進階篩選
                        {filters.showFilters ? (
                          <ChevronUp size={16} className="ms-1" />
                        ) : (
                          <ChevronDown size={16} className="ms-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {filters.showFilters && (
                    <Card className="mb-4 filter-card">
                      <Card.Body>
                        <Row>
                          <Col md={6} lg={3} className="mb-3">
                            <Form.Group>
                              <Form.Label>日期範圍</Form.Label>
                              <div className="d-flex gap-2 align-items-center">
                                <Form.Control
                                  type="date"
                                  value={filters.dateFrom}
                                  onChange={handleFilterChange}
                                  name="dateFrom"
                                />
                                <span>至</span>
                                <Form.Control
                                  type="date"
                                  value={filters.dateTo}
                                  onChange={handleFilterChange}
                                  name="dateTo"
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6} lg={3} className="mb-3">
                            <Form.Group>
                              <Form.Label>金額範圍</Form.Label>
                              <div className="d-flex gap-2 align-items-center">
                                <Form.Control
                                  type="number"
                                  placeholder="最小"
                                  value={filters.amountRange?.min}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      amountRange: {
                                        ...prev.amountRange,
                                        min: Number(e.target.value),
                                      },
                                    }))
                                  }
                                />
                                <span>至</span>
                                <Form.Control
                                  type="number"
                                  placeholder="最大"
                                  value={filters.amountRange?.max}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      amountRange: {
                                        ...prev.amountRange,
                                        max: Number(e.target.value),
                                      },
                                    }))
                                  }
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6} lg={3} className="mb-3">
                            <Form.Group>
                              <Form.Label>付款方式</Form.Label>
                              <Form.Select
                                value={filters.paymentMethod}
                                onChange={handleFilterChange}
                                name="paymentMethod"
                              >
                                {PAYMENT_METHODS.map((method) => (
                                  <option
                                    key={method.value}
                                    value={method.value}
                                  >
                                    {method.label}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6} lg={3} className="mb-3">
                            <Form.Group>
                              <Form.Label>顧客資料</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="姓名/電子郵件/電話"
                                value={filters.customer}
                                onChange={handleFilterChange}
                                name="customer"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2 mt-2">
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                showFilters: false,
                                amountRange: undefined,
                                customer: '',
                                paymentMethod: 'all',
                                dateFrom: '',
                                dateTo: '',
                              }))
                            }
                          >
                            重置篩選
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              // 實作套用篩選的邏輯
                              console.log('Applying filters:', filters)
                            }}
                          >
                            套用篩選
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                    <thead>
                      <tr>
                        <th
                          onClick={() => handleSort('id')}
                          style={{ width: '70px' }}
                        >
                          ID{' '}
                          {sortConfig.key === 'id' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th onClick={() => handleSort('date')}>
                          日期{' '}
                          {sortConfig.key === 'date' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th onClick={() => handleSort('type')}>
                          類型{' '}
                          {sortConfig.key === 'type' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th>描述</th>
                        <th onClick={() => handleSort('amount')}>
                          金額{' '}
                          {sortConfig.key === 'amount' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th>付款方式</th>
                        <th>狀態</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.id}</td>
                          <td>{transaction.date}</td>
                          <td>{transaction.type}</td>
                          <td>{transaction.description}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>{transaction.payment_method}</td>
                          <td>{getStatusBadge(transaction.status)}</td>
                          <td>
                            <Link
                              href={`/admin/finance/transactions/${transaction.id}`}
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
                    <div className="text-muted">
                      顯示 {currentPage * itemsPerPage - itemsPerPage + 1} 至{' '}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredTransactions.length
                      )}{' '}
                      筆，共 {filteredTransactions.length} 筆
                    </div>
                    <Pagination className={isDarkMode ? 'pagination-dark' : ''}>
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
                            return (
                              <Pagination.Ellipsis key={`ellipsis-${page}`} />
                            )
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
            </Col>
          </Row>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

'use client'

import React, { useState } from 'react'
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
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'

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

  // 統計卡片資料
  const donationStats = [
    {
      title: '總捐款金額',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">
            {formatCurrency(statistics.totalAmount)}
          </div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 12.5% 較上月
          </div>
        </div>
      ),
      color: 'primary',
      icon: <Heart size={24} />,
    },
    {
      title: '捐款人數',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{statistics.totalDonors}</div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 8.2% 較上月
          </div>
        </div>
      ),
      color: 'success',
      icon: <Users size={24} />,
    },
    {
      title: '定期捐款人數',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{statistics.monthlyDonors}</div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 5.7% 較上月
          </div>
        </div>
      ),
      color: 'info',
      icon: <Calendar size={24} />,
    },
    {
      title: '平均捐款金額',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">
            {formatCurrency(statistics.averageAmount)}
          </div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 3.4% 較上月
          </div>
        </div>
      ),
      color: 'warning',
      icon: <TrendingUp size={24} />,
    },
  ]

  return (
    <AdminPageLayout
      title="捐款記錄"
      stats={donationStats}
      actions={
        <Button variant="outline-primary" onClick={handleExport}>
          <Download size={18} className="me-2" />
          匯出記錄
        </Button>
      }
    >
      <div className="admin-layout-container">
        <AdminSection title="捐款查詢">
          <Card
            className={`admin-card ${isDarkMode ? 'bg-dark text-light' : ''}`}
          >
            <Card.Body>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <div className="d-flex flex-column flex-md-row gap-2 mb-3 mb-md-0">
                  <div className="position-relative search-container">
                    <Form.Control
                      type="text"
                      placeholder="搜尋捐款..."
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="search-input"
                    />
                    <Search size={18} className="search-icon" />
                  </div>
                  <Form.Select
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="ms-md-2"
                    style={{ width: 'auto' }}
                  >
                    {DONATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    value={filters.purpose}
                    onChange={handleFilterChange}
                    className="ms-md-2"
                    style={{ width: 'auto' }}
                  >
                    {DONATION_PURPOSES.map((purpose) => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
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
              </div>

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
                    <th onClick={() => handleSort('donor_name')}>
                      捐款人{' '}
                      {sortConfig.key === 'donor_name' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </th>
                    <th onClick={() => handleSort('amount')}>
                      金額{' '}
                      {sortConfig.key === 'amount' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </th>
                    <th>捐款類型</th>
                    <th>用途</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td>{donation.id}</td>
                      <td>{donation.date}</td>
                      <td>
                        <Link href={`/admin/members/${donation.donor_id}`}>
                          {donation.donor_name}
                        </Link>
                      </td>
                      <td>{formatCurrency(donation.amount)}</td>
                      <td>{getDonationTypeBadge(donation.type)}</td>
                      <td>{donation.purpose}</td>
                      <td>{getStatusBadge(donation.status)}</td>
                      <td>
                        <Link
                          href={`/admin/finance/transactions/donations/${donation.id}`}
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
                    filteredDonations.length
                  )}{' '}
                  筆，共 {filteredDonations.length} 筆
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
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

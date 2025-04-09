'use client'

import React, { useState, useEffect } from 'react'
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
  DollarSign,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import { fetchApi } from '@/app/admin/_lib/api'

// 定義捐款數據介面
interface Donation {
  id: number;
  donation_type: string;
  pet_id: number | null;
  amount: number;
  donation_mode: string;
  payment_method: string;
  transaction_status: string;
  create_datetime: string;
  user_id: number | null;
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  trade_no: string;
  retry_trade_no: string | null;
  pet_name?: string;
}

// 定義API響應介面
interface ApiResponse {
  success: boolean;
  data: Donation[];
  total_amount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const DONATION_TYPES = [
  { value: 'all', label: '全部類型' },
  { value: 'one_time', label: '單次捐款' },
  { value: 'monthly', label: '每月定期' },
]

const DONATION_PURPOSES = [
  { value: 'all', label: '全部用途' },
  { value: '醫療救援', label: '醫療救援' },
  { value: '線上認養', label: '線上認養' },
  { value: '捐予平台', label: '捐予平台' },
]

const DONATION_STATUS = [
  { value: 'all', label: '全部狀態' },
  { value: '已付款', label: '已付款' },
  { value: '未付款', label: '未付款' },
  { value: '付款失敗', label: '付款失敗' },
]

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalDonations, setTotalDonations] = useState(0)
  const [filters, setFilters] = useState({
    type: 'all',
    purpose: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'create_datetime',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const { isDarkMode } = useTheme()

  // 格式化貨幣
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
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

  // 獲取捐款數據
  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      
      // 構建查詢參數
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.purpose !== 'all') params.append('purpose', filters.purpose)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      
      // 使用 fetchApi 替代 fetch
      const result = await fetchApi(`/api/admin/finance/donations?${params.toString()}`)
      
      if (result.success) {
        setDonations(result.data)
        setTotalAmount(result.total_amount)
        setTotalDonations(result.pagination.total)
        setTotalPages(result.pagination.totalPages)
      } else {
        console.error('獲取捐款數據失敗:', result.message)
      }
    } catch (error) {
      console.error('獲取捐款數據錯誤:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 當頁面、過濾條件或排序條件變更時重新獲取數據
  useEffect(() => {
    fetchDonations()
  }, [currentPage, filters])

  // 處理過濾條件變更
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setCurrentPage(1) // 重置頁碼
  }

  // 處理排序
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    })
  }

  // 處理頁碼變更
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // 處理匯出
  const handleExport = () => {
    // 待實作匯出功能
    console.log('Exporting donations...')
    alert('匯出功能開發中')
  }

  // 獲取狀態標籤
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '已付款':
        return <Badge bg="success">已付款</Badge>
      case '未付款':
        return <Badge bg="warning">未付款</Badge>
      case '付款失敗':
        return <Badge bg="danger">付款失敗</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  // 獲取捐款類型標籤
  const getDonationTypeBadge = (mode: string) => {
    switch (mode) {
      case '一次性捐款':
        return <Badge bg="primary">單次捐款</Badge>
      case '定期定額':
        return <Badge bg="info">定期捐款</Badge>
      default:
        return <Badge bg="secondary">{mode}</Badge>
    }
  }

  // 捐款統計數據
  const donationStats = [
    {
      title: '總捐款筆數',
      count: totalDonations,
      color: 'primary',
      icon: <Heart size={24} />,
    },
    {
      title: '總捐款金額',
      count: formatCurrency(totalAmount),
      color: 'success',
      icon: <DollarSign size={24} />,
    },
    {
      title: '平均捐款金額',
      count: totalDonations > 0 
        ? formatCurrency(totalAmount / totalDonations) 
        : formatCurrency(0),
      color: 'info',
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
                      placeholder="搜尋捐款人..."
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="search-input"
                    />
                    <Search size={18} className="search-icon" />
                  </div>
                  <Form.Select
                    name="type"
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
                    name="purpose"
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
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="ms-md-2"
                    style={{ width: 'auto' }}
                  >
                    {DONATION_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
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

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">載入中...</span>
                  </div>
                  <p className="mt-2">載入捐款數據中...</p>
                </div>
              ) : (
                <>
                  <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                    <thead>
                      <tr>
                        <th
                          onClick={() => handleSort('id')}
                          style={{ width: '70px', cursor: 'pointer' }}
                        >
                          ID{' '}
                          {sortConfig.key === 'id' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th 
                          onClick={() => handleSort('create_datetime')}
                          style={{ cursor: 'pointer' }}
                        >
                          日期{' '}
                          {sortConfig.key === 'create_datetime' &&
                            (sortConfig.direction === 'asc' ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            ))}
                        </th>
                        <th>捐款人</th>
                        <th 
                          onClick={() => handleSort('amount')}
                          style={{ cursor: 'pointer' }}
                        >
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
                      {donations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            沒有符合條件的捐款記錄
                          </td>
                        </tr>
                      ) : (
                        donations.map((donation) => (
                          <tr key={donation.id}>
                            <td>{donation.id}</td>
                            <td>{formatDate(donation.create_datetime)}</td>
                            <td>
                              {donation.user_id ? (
                                <Link href={`/admin/members/${donation.user_id}`}>
                                  {donation.donor_name}
                                </Link>
                              ) : (
                                donation.donor_name
                              )}
                            </td>
                            <td>{formatCurrency(donation.amount)}</td>
                            <td>{getDonationTypeBadge(donation.donation_mode)}</td>
                            <td>
                              {donation.donation_type}
                              {donation.pet_id && donation.pet_name && (
                                <div className="mt-1">
                                  <small>
                                    <Link href={`/admin/pets/${donation.pet_id}`}>
                                      {donation.pet_name}
                                    </Link>
                                  </small>
                                </div>
                              )}
                            </td>
                            <td>{getStatusBadge(donation.transaction_status)}</td>
                            <td>
                              <Link
                                href={`/admin/finance/transactions/donations/${donation.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                查看
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      顯示 {donations.length} 筆，共 {totalDonations} 筆記錄
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

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageToShow = currentPage > 3 
                          ? currentPage - 3 + i + 1 
                          : i + 1;
                          
                        if (pageToShow <= totalPages) {
                          return (
                            <Pagination.Item
                              key={pageToShow}
                              active={pageToShow === currentPage}
                              onClick={() => handlePageChange(pageToShow)}
                            >
                              {pageToShow}
                            </Pagination.Item>
                          );
                        }
                        return null;
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
                </>
              )}
            </Card.Body>
          </Card>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

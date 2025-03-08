'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Table, Badge } from 'react-bootstrap'
import {
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  ThumbsUp,
  PieChart,
  BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/app/admin/ThemeContext'

// 模擬論壇統計數據
const MOCK_STATS = {
  total_articles: 254,
  pending_articles: 12,
  total_reports: 38,
  open_reports: 15,
  total_comments: 1245,
  total_users: 587,
  active_users: 128,
}

// 模擬熱門文章數據
const MOCK_POPULAR_ARTICLES = [
  {
    id: 1,
    title: '如何照顧年長貓咪的健康',
    author: '貓咪專家',
    views: 1254,
    likes: 89,
    comments: 32,
    created_at: '2024-03-15T08:30:00',
  },
  {
    id: 2,
    title: '狗狗訓練的十個小技巧',
    author: '狗狗訓練師',
    views: 986,
    likes: 76,
    comments: 28,
    created_at: '2024-03-14T14:45:00',
  },
  {
    id: 3,
    title: '認養寵物前需考慮的因素',
    author: '寵物領養顧問',
    views: 875,
    likes: 65,
    comments: 22,
    created_at: '2024-03-13T10:20:00',
  },
  {
    id: 4,
    title: '小型寵物的居家環境布置',
    author: '居家設計師',
    views: 742,
    likes: 51,
    comments: 17,
    created_at: '2024-03-12T15:10:00',
  },
  {
    id: 5,
    title: '寵物營養與飲食指南',
    author: '寵物營養師',
    views: 689,
    likes: 47,
    comments: 14,
    created_at: '2024-03-11T09:05:00',
  },
]

// 模擬最新報告數據
const MOCK_RECENT_REPORTS = [
  {
    id: 1,
    reporter_name: '用戶A',
    reported_content_type: 'article',
    reported_content_title: '不適當的寵物飼養建議',
    reason: 'misleading',
    status: 'pending',
    created_at: '2024-03-15T14:25:00',
  },
  {
    id: 2,
    reporter_name: '用戶B',
    reported_content_type: 'comment',
    reported_content_title: '針對寵物主人的不當評論',
    reason: 'inappropriate',
    status: 'investigating',
    created_at: '2024-03-15T12:30:00',
  },
  {
    id: 3,
    reporter_name: '用戶C',
    reported_content_type: 'user',
    reported_content_title: '重複發布廣告內容的用戶',
    reason: 'spam',
    status: 'pending',
    created_at: '2024-03-14T16:45:00',
  },
  {
    id: 4,
    reporter_name: '用戶D',
    reported_content_type: 'article',
    reported_content_title: '含有錯誤醫療資訊的文章',
    reason: 'misleading',
    status: 'pending',
    created_at: '2024-03-14T10:15:00',
  },
  {
    id: 5,
    reporter_name: '用戶E',
    reported_content_type: 'comment',
    reported_content_title: '言語不當的留言',
    reason: 'inappropriate',
    status: 'pending',
    created_at: '2024-03-13T09:20:00',
  },
]

// 模擬類別分佈數據
const MOCK_CATEGORIES_DATA = [
  { name: '狗狗', articles: 78, percentage: 31 },
  { name: '貓咪', articles: 65, percentage: 26 },
  { name: '小型寵物', articles: 42, percentage: 17 },
  { name: '鳥類', articles: 28, percentage: 11 },
  { name: '水族', articles: 22, percentage: 9 },
  { name: '其他', articles: 15, percentage: 6 },
]

export default function ForumDashboardPage() {
  const { isDarkMode } = useTheme()
  const [timeRange] = useState('month')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">待處理</Badge>
      case 'investigating':
        return <Badge bg="info">調查中</Badge>
      case 'resolved':
        return <Badge bg="success">已解決</Badge>
      case 'rejected':
        return <Badge bg="danger">已拒絕</Badge>
      default:
        return <Badge bg="secondary">未知</Badge>
    }
  }

  const getReportReasonDisplay = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
        return '不當內容'
      case 'spam':
        return '垃圾訊息'
      case 'misleading':
        return '誤導資訊'
      case 'offensive':
        return '冒犯內容'
      case 'other':
        return '其他原因'
      default:
        return reason
    }
  }

  return (
    <div className="forum-dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>論壇管理</h2>
        <div>
          <Link href="/admin/forum/articles">
            <Button variant="outline-primary" className="me-2">
              <FileText size={18} className="me-2" />
              文章管理
            </Button>
          </Link>
          <Link href="/admin/forum/reports">
            <Button variant="outline-danger">
              <AlertCircle size={18} className="me-2" />
              檢舉管理
            </Button>
          </Link>
        </div>
      </div>

      {/* 統計卡片 */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">總文章數</h6>
                  <h2 className="mt-2 mb-0">{MOCK_STATS.total_articles}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FileText size={24} className="text-primary" />
                </div>
              </div>
              <div className="mt-3 small text-muted">
                待審核文章：{MOCK_STATS.pending_articles}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">總檢舉數</h6>
                  <h2 className="mt-2 mb-0">{MOCK_STATS.total_reports}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <AlertCircle size={24} className="text-danger" />
                </div>
              </div>
              <div className="mt-3 small text-muted">
                未處理檢舉：{MOCK_STATS.open_reports}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">總評論數</h6>
                  <h2 className="mt-2 mb-0">{MOCK_STATS.total_comments}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <MessageSquare size={24} className="text-info" />
                </div>
              </div>
              <div className="mt-3 small text-muted">
                本月新增：{Math.floor(MOCK_STATS.total_comments * 0.12)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">活躍用戶</h6>
                  <h2 className="mt-2 mb-0">{MOCK_STATS.active_users}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <Users size={24} className="text-success" />
                </div>
              </div>
              <div className="mt-3 small text-muted">
                總用戶數：{MOCK_STATS.total_users}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 熱門文章與最新檢舉 */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">熱門文章</h5>
              <Link href="/admin/forum/articles">
                <Button variant="link" className="p-0">
                  查看全部
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className={isDarkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      <th>標題</th>
                      <th>作者</th>
                      <th className="text-center">
                        <Eye size={16} />
                      </th>
                      <th className="text-center">
                        <ThumbsUp size={16} />
                      </th>
                      <th className="text-center">
                        <MessageSquare size={16} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_POPULAR_ARTICLES.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <Link
                            href={`/admin/forum/articles/${article.id}`}
                            className={`text-decoration-none ${
                              isDarkMode ? 'text-light' : 'text-dark'
                            }`}
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td>{article.author}</td>
                        <td className="text-center">{article.views}</td>
                        <td className="text-center">{article.likes}</td>
                        <td className="text-center">{article.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">最新檢舉</h5>
              <Link href="/admin/forum/reports">
                <Button variant="link" className="p-0">
                  查看全部
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className={isDarkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      <th>檢舉內容</th>
                      <th>類型</th>
                      <th>原因</th>
                      <th>狀態</th>
                      <th>日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RECENT_REPORTS.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <Link
                            href={`/admin/forum/reports/${report.id}`}
                            className={`text-decoration-none ${
                              isDarkMode ? 'text-light' : 'text-dark'
                            }`}
                          >
                            {report.reported_content_title}
                          </Link>
                        </td>
                        <td>
                          {report.reported_content_type === 'article'
                            ? '文章'
                            : report.reported_content_type === 'comment'
                            ? '評論'
                            : '用戶'}
                        </td>
                        <td>{getReportReasonDisplay(report.reason)}</td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>{formatDate(report.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 類別分佈 */}
      <Row className="mb-4 g-3">
        <Col md={12}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Header>
              <h5 className="mb-0">文章類別分佈</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className={isDarkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>類別</th>
                      <th>文章數</th>
                      <th>百分比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_CATEGORIES_DATA.map((category) => (
                      <tr key={category.name}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">{category.name}</div>
                            <div
                              className="progress flex-grow-1"
                              style={{ height: '10px' }}
                            >
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${category.percentage}%` }}
                                aria-valuenow={category.percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>{category.articles}</td>
                        <td>{category.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

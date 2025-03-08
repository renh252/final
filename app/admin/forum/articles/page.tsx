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
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/app/admin/components/Toast'
import { useConfirm } from '@/app/admin/components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import DataTable from '@/app/admin/components/DataTable'

// 模擬文章數據
const MOCK_ARTICLES = [
  {
    id: 1,
    title: '如何照顧新生小貓',
    author: '王小明',
    author_id: 1,
    category: 'care',
    status: 'published',
    created_at: '2023-02-15',
    updated_at: '2023-02-15',
    views: 1250,
    likes: 85,
    comments: 23,
    featured: true,
  },
  {
    id: 2,
    title: '狗狗健康飲食指南',
    author: '李小花',
    author_id: 2,
    category: 'health',
    status: 'published',
    created_at: '2023-03-01',
    updated_at: '2023-03-01',
    views: 980,
    likes: 62,
    comments: 15,
    featured: false,
  },
  {
    id: 3,
    title: '寵物訓練的基本技巧',
    author: '張大山',
    author_id: 3,
    category: 'training',
    status: 'pending',
    created_at: '2023-03-10',
    updated_at: '2023-03-10',
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
  {
    id: 4,
    title: '貓咪行為解析',
    author: '林小雨',
    author_id: 4,
    category: 'behavior',
    status: 'draft',
    created_at: '2023-03-15',
    updated_at: '2023-03-15',
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
  {
    id: 5,
    title: '寵物友善餐廳推薦',
    author: '陳大海',
    author_id: 5,
    category: 'lifestyle',
    status: 'rejected',
    created_at: '2023-03-05',
    updated_at: '2023-03-08',
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
]

// 文章分類選項
const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部分類' },
  { value: 'care', label: '寵物照顧' },
  { value: 'health', label: '健康飲食' },
  { value: 'training', label: '訓練技巧' },
  { value: 'behavior', label: '行為解析' },
  { value: 'lifestyle', label: '生活方式' },
]

// 文章狀態選項
const STATUS_OPTIONS = [
  { value: 'all', label: '全部狀態' },
  { value: 'published', label: '已發布', badge: 'success' },
  { value: 'pending', label: '待審核', badge: 'warning' },
  { value: 'draft', label: '草稿', badge: 'secondary' },
  { value: 'rejected', label: '已拒絕', badge: 'danger' },
]

export default function ArticlesPage() {
  const [articles, setArticles] = useState(MOCK_ARTICLES)
  const [filteredArticles, setFilteredArticles] = useState(MOCK_ARTICLES)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 處理搜尋
  const handleSearch = () => {
    let filtered = [...articles]

    // 搜尋條件
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 分類過濾
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (article) => article.category === categoryFilter
      )
    }

    // 狀態過濾
    if (statusFilter !== 'all') {
      filtered = filtered.filter((article) => article.status === statusFilter)
    }

    setFilteredArticles(filtered)
  }

  // 處理重置過濾器
  const handleResetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setFilteredArticles(articles)
  }

  // 處理審核文章
  const handleApproveArticle = (article: any) => {
    confirm({
      title: '審核文章',
      message: `確定要審核通過文章「${article.title}」嗎？`,
      type: 'confirm',
      confirmText: '通過',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticles((prev) =>
            prev.map((a) =>
              a.id === article.id
                ? {
                    ...a,
                    status: 'published',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : a
            )
          )
          setFilteredArticles((prev) =>
            prev.map((a) =>
              a.id === article.id
                ? {
                    ...a,
                    status: 'published',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : a
            )
          )
          showToast(
            'success',
            '審核成功',
            `文章「${article.title}」已通過審核並發布`
          )
        }, 500)
      },
    })
  }

  // 處理拒絕文章
  const handleRejectArticle = (article: any) => {
    confirm({
      title: '拒絕文章',
      message: `確定要拒絕文章「${article.title}」嗎？`,
      type: 'danger',
      confirmText: '拒絕',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticles((prev) =>
            prev.map((a) =>
              a.id === article.id
                ? {
                    ...a,
                    status: 'rejected',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : a
            )
          )
          setFilteredArticles((prev) =>
            prev.map((a) =>
              a.id === article.id
                ? {
                    ...a,
                    status: 'rejected',
                    updated_at: new Date().toISOString().split('T')[0],
                  }
                : a
            )
          )
          showToast('success', '操作成功', `文章「${article.title}」已被拒絕`)
        }, 500)
      },
    })
  }

  // 處理刪除文章
  const handleDeleteArticle = (article: any) => {
    confirm({
      title: '刪除文章',
      message: `確定要刪除文章「${article.title}」嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticles((prev) => prev.filter((a) => a.id !== article.id))
          setFilteredArticles((prev) => prev.filter((a) => a.id !== article.id))
          showToast('success', '刪除成功', `文章「${article.title}」已成功刪除`)
        }, 500)
      },
    })
  }

  // 處理設為精選
  const handleToggleFeatured = (article: any) => {
    // 模擬API請求
    setTimeout(() => {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, featured: !a.featured } : a
        )
      )
      setFilteredArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, featured: !a.featured } : a
        )
      )
      showToast(
        'success',
        '操作成功',
        article.featured
          ? `文章「${article.title}」已取消精選`
          : `文章「${article.title}」已設為精選`
      )
    }, 500)
  }

  // 表格列定義
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: '標題', sortable: true },
    { key: 'author', label: '作者', sortable: true },
    {
      key: 'category',
      label: '分類',
      sortable: true,
      render: (value: string) => {
        const category = CATEGORY_OPTIONS.find((c) => c.value === value)
        return category ? category.label : value
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
      key: 'created_at',
      label: '建立日期',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('zh-TW'),
    },
    {
      key: 'views',
      label: '瀏覽量',
      sortable: true,
    },
    {
      key: 'featured',
      label: '精選',
      sortable: true,
      render: (value: boolean) => (value ? <Badge bg="info">精選</Badge> : ''),
    },
  ]

  // 渲染操作按鈕
  const renderActions = (article: any) => (
    <div className="d-flex gap-2">
      <Link
        href={`/admin/forum/articles/${article.id}`}
        className="btn btn-outline-primary btn-sm"
      >
        <Eye size={16} />
      </Link>
      <Link
        href={`/admin/forum/articles/${article.id}?edit=true`}
        className="btn btn-outline-secondary btn-sm"
      >
        <Edit size={16} />
      </Link>
      {article.status === 'pending' && (
        <>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleApproveArticle(article)}
            title="通過審核"
          >
            <CheckCircle size={16} />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRejectArticle(article)}
            title="拒絕"
          >
            <XCircle size={16} />
          </Button>
        </>
      )}
      <Button
        variant={article.featured ? 'warning' : 'outline-warning'}
        size="sm"
        onClick={() => handleToggleFeatured(article)}
        title={article.featured ? '取消精選' : '設為精選'}
      >
        ★
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteArticle(article)}
        title="刪除"
      >
        <Trash size={16} />
      </Button>
    </div>
  )

  return (
    <div className="articles-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">文章管理</h2>
        <Link
          href="/admin/forum/articles/new"
          className="btn btn-primary d-flex align-items-center"
        >
          <Plus size={18} className="me-2" /> 新增文章
        </Link>
      </div>

      <Card className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <InputGroup>
                <Form.Control
                  placeholder="搜尋文章標題或作者"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary" onClick={handleSearch}>
                  <Search size={18} />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3} className="mb-3">
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="mb-3">
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
              <Button variant="outline-secondary" onClick={handleResetFilters}>
                重置
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">文章列表</h5>
            <div>
              <span className="me-3">共 {filteredArticles.length} 篇文章</span>
              <span className="me-3">
                待審核: {articles.filter((a) => a.status === 'pending').length}
              </span>
              <span>
                已發布:{' '}
                {articles.filter((a) => a.status === 'published').length}
              </span>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredArticles}
            searchable={false}
            actions={renderActions}
            onRowClick={(article) =>
              (window.location.href = `/admin/forum/articles/${article.id}`)
            }
          />
        </Card.Body>
      </Card>
    </div>
  )
}

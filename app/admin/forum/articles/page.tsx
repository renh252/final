'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  Form,
  InputGroup,
  Dropdown,
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
  Check,
  X,
  MoreHorizontal,
  FileText,
  Award,
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

  // 使用 useEffect 自動處理過濾，避免手動調用
  useEffect(() => {
    // 在 useEffect 中直接定義過濾邏輯，而不是調用 handleSearch
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
  }, [articles, searchTerm, categoryFilter, statusFilter])

  // 處理搜尋按鈕點擊 - 這個函數現在只是為了保持 UI 功能一致
  const handleSearch = useCallback(() => {
    // 現在這個函數是空的，因為過濾邏輯已經移到 useEffect 中
    // 保留這個函數是為了兼容性
  }, [])

  // 處理重置過濾器
  const handleResetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  // 處理審核文章
  const handleApproveArticle = useCallback(
    (article: any) => {
      confirm({
        title: '審核文章',
        message: `確定要審核通過「${article.title}」這篇文章嗎？`,
        confirmText: '確定審核',
        onConfirm: () => {
          // 這裡應該是API請求，我們模擬一下
          setTimeout(() => {
            const updatedArticles = articles.map((a) => {
              if (a.id === article.id) {
                return { ...a, status: 'published' }
              }
              return a
            })
            setArticles(updatedArticles)
            showToast({
              title: '審核成功',
              message: `文章「${article.title}」已成功審核通過`,
              variant: 'success',
            })
            // 過濾邏輯由 useEffect 自動處理，不需要調用 handleSearch
          }, 500)
        },
      })
    },
    [articles, confirm, showToast]
  )

  // 處理拒絕文章
  const handleRejectArticle = useCallback(
    (article: any) => {
      confirm({
        title: '拒絕文章',
        message: `確定要拒絕「${article.title}」這篇文章嗎？`,
        confirmText: '確定拒絕',
        confirmVariant: 'danger',
        onConfirm: () => {
          // 這裡應該是API請求，我們模擬一下
          setTimeout(() => {
            const updatedArticles = articles.map((a) => {
              if (a.id === article.id) {
                return { ...a, status: 'rejected' }
              }
              return a
            })
            setArticles(updatedArticles)
            showToast({
              title: '已拒絕',
              message: `文章「${article.title}」已被拒絕`,
              variant: 'warning',
            })
            // 過濾邏輯由 useEffect 自動處理，不需要調用 handleSearch
          }, 500)
        },
      })
    },
    [articles, confirm, showToast]
  )

  // 處理刪除文章
  const handleDeleteArticle = useCallback(
    (article: any) => {
      confirm({
        title: '刪除文章',
        message: `確定要刪除「${article.title}」這篇文章嗎？這個操作無法撤銷！`,
        confirmText: '確定刪除',
        confirmVariant: 'danger',
        onConfirm: () => {
          // 這裡應該是API請求，我們模擬一下
          setTimeout(() => {
            const updatedArticles = articles.filter((a) => a.id !== article.id)
            setArticles(updatedArticles)
            showToast({
              title: '刪除成功',
              message: `文章「${article.title}」已成功刪除`,
              variant: 'success',
            })
            // 過濾邏輯由 useEffect 自動處理，不需要調用 handleSearch
          }, 500)
        },
      })
    },
    [articles, confirm, showToast]
  )

  // 處理精選文章
  const handleToggleFeatured = useCallback(
    (article: any) => {
      // 這裡應該是API請求，我們模擬一下
      setTimeout(() => {
        const updatedArticles = articles.map((a) => {
          if (a.id === article.id) {
            return { ...a, featured: !a.featured }
          }
          return a
        })
        setArticles(updatedArticles)
        showToast({
          title: article.featured ? '取消精選' : '設為精選',
          message: `文章「${article.title}」${
            article.featured ? '已取消精選' : '已設為精選'
          }`,
          variant: 'success',
        })
        // 過濾邏輯由 useEffect 自動處理，不需要調用 handleSearch
      }, 500)
    },
    [articles, showToast]
  )

  // 表格列定義
  const columns = useMemo(
    () => [
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
          return status ? (
            <Badge bg={status.badge}>{status.label}</Badge>
          ) : (
            value
          )
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
        render: (value: boolean) =>
          value ? <Badge bg="info">精選</Badge> : '',
      },
    ],
    []
  ) // 空依賴陣列，因為這些列定義不會變更

  // 渲染操作按鈕
  const renderActions = useCallback(
    (article: any) => (
      <div className="d-flex">
        {article.status === 'pending' && (
          <>
            <Button
              variant="success"
              size="sm"
              className="me-1"
              onClick={(e) => {
                e.stopPropagation()
                handleApproveArticle(article)
              }}
            >
              <Check size={16} className="me-1" />
              審核
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="me-1"
              onClick={(e) => {
                e.stopPropagation()
                handleRejectArticle(article)
              }}
            >
              <X size={16} className="me-1" />
              拒絕
            </Button>
          </>
        )}
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            size="sm"
            id={`dropdown-${article.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={16} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              href={`/admin/forum/articles/${article.id}`}
              target="_blank"
            >
              <FileText size={14} className="me-2" />
              查看文章
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFeatured(article)
              }}
            >
              {article.featured ? (
                <>
                  <XCircle size={14} className="me-2" />
                  取消精選
                </>
              ) : (
                <>
                  <Award size={14} className="me-2" />
                  設為精選
                </>
              )}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="text-danger"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteArticle(article)
              }}
            >
              <Trash size={14} className="me-2" />
              刪除文章
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    ),
    [
      handleApproveArticle,
      handleRejectArticle,
      handleToggleFeatured,
      handleDeleteArticle,
    ]
  )

  return (
    <AdminPageLayout
      title="文章管理"
      actions={
        <Link
          href="/admin/forum/articles/new"
          className="btn btn-primary d-flex align-items-center"
        >
          <Plus size={18} className="me-2" /> 新增文章
        </Link>
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
                  <Button
                    variant="outline-secondary"
                    onClick={handleResetFilters}
                  >
                    重置
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </AdminSection>

        <AdminSection>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">文章列表</h5>
                <div>
                  <span className="me-3">
                    共 {filteredArticles.length} 篇文章
                  </span>
                  <span className="me-3">
                    待審核:{' '}
                    {articles.filter((a) => a.status === 'pending').length}
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
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

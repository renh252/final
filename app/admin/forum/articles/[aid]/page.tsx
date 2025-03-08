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
  Trash,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react'
import { useToast } from '@/app/admin/components/Toast'
import { useConfirm } from '@/app/admin/components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

// 模擬文章數據
const MOCK_ARTICLE = {
  id: 1,
  title: '如何照顧新生小貓',
  author: '王小明',
  author_id: 1,
  category: 'care',
  status: 'published',
  content: `<h2>新生小貓的照顧指南</h2>
  <p>新生小貓需要特別的照顧和關注。以下是一些基本的照顧指南：</p>
  <h3>1. 餵食</h3>
  <p>新生小貓需要每2-3小時餵食一次。如果沒有母貓，你需要使用專門的貓奶粉替代品。</p>
  <h3>2. 保暖</h3>
  <p>新生小貓無法自行調節體溫，需要保持在溫暖的環境中，通常是30-32°C。</p>
  <h3>3. 清潔</h3>
  <p>小貓需要幫助排泄，可以用溫暖的濕布輕輕擦拭肛門和生殖器區域，模擬母貓的舔舐動作。</p>
  <h3>4. 健康檢查</h3>
  <p>定期帶小貓去獸醫處進行健康檢查，確保它們健康成長。</p>`,
  created_at: '2023-02-15',
  updated_at: '2023-02-15',
  views: 1250,
  likes: 85,
  comments: 23,
  featured: true,
  tags: ['小貓', '寵物照顧', '新手指南'],
  cover_image: '/images/kitten-care.jpg',
  comment_list: [
    {
      id: 1,
      user_name: '李小花',
      user_id: 2,
      content: '這篇文章非常有幫助！我剛領養了一隻小貓，正在學習如何照顧它。',
      created_at: '2023-02-16',
      likes: 5,
    },
    {
      id: 2,
      user_name: '張大山',
      user_id: 3,
      content: '我想補充一點，小貓的飲食也要注意營養均衡，不能只餵食貓奶。',
      created_at: '2023-02-17',
      likes: 3,
    },
    {
      id: 3,
      user_name: '林小雨',
      user_id: 4,
      content: '請問小貓多大可以開始吃固體食物？',
      created_at: '2023-02-18',
      likes: 2,
    },
  ],
}

// 文章分類選項
const CATEGORY_OPTIONS = [
  { value: 'care', label: '寵物照顧' },
  { value: 'health', label: '健康飲食' },
  { value: 'training', label: '訓練技巧' },
  { value: 'behavior', label: '行為解析' },
  { value: 'lifestyle', label: '生活方式' },
]

// 文章狀態選項
const STATUS_OPTIONS = [
  { value: 'published', label: '已發布', badge: 'success' },
  { value: 'pending', label: '待審核', badge: 'warning' },
  { value: 'draft', label: '草稿', badge: 'secondary' },
  { value: 'rejected', label: '已拒絕', badge: 'danger' },
]

export default function ArticleDetailPage({
  params,
}: {
  params: { aid: string }
}) {
  const [article, setArticle] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState('content')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 模擬從API獲取文章數據
    setTimeout(() => {
      setArticle(MOCK_ARTICLE)
      setFormData(MOCK_ARTICLE)
    }, 500)

    // 如果URL中有edit=true參數，則進入編輯模式
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true)
    }
  }, [params.aid, searchParams])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: target.checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value
    const tagsArray = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData({
      ...formData,
      tags: tagsArray,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 模擬API請求
    setTimeout(() => {
      setArticle({
        ...article,
        ...formData,
        updated_at: new Date().toISOString().split('T')[0],
      })
      setIsEditing(false)
      showToast('success', '更新成功', '文章資訊已成功更新')
    }, 500)
  }

  const handleDeleteArticle = () => {
    confirm({
      title: '刪除文章',
      message: `確定要刪除文章「${article.title}」嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          showToast('success', '刪除成功', `文章「${article.title}」已成功刪除`)
          // 導航回文章列表頁
          window.location.href = '/admin/forum/articles'
        }, 500)
      },
    })
  }

  const handleApproveArticle = () => {
    confirm({
      title: '審核文章',
      message: `確定要審核通過文章「${article.title}」嗎？`,
      type: 'confirm',
      confirmText: '通過',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticle({
            ...article,
            status: 'published',
            updated_at: new Date().toISOString().split('T')[0],
          })
          showToast(
            'success',
            '審核成功',
            `文章「${article.title}」已通過審核並發布`
          )
        }, 500)
      },
    })
  }

  const handleRejectArticle = () => {
    confirm({
      title: '拒絕文章',
      message: `確定要拒絕文章「${article.title}」嗎？`,
      type: 'danger',
      confirmText: '拒絕',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticle({
            ...article,
            status: 'rejected',
            updated_at: new Date().toISOString().split('T')[0],
          })
          showToast('success', '操作成功', `文章「${article.title}」已被拒絕`)
        }, 500)
      },
    })
  }

  const handleToggleFeatured = () => {
    // 模擬API請求
    setTimeout(() => {
      setArticle({
        ...article,
        featured: !article.featured,
      })
      showToast(
        'success',
        '操作成功',
        article.featured
          ? `文章「${article.title}」已取消精選`
          : `文章「${article.title}」已設為精選`
      )
    }, 500)
  }

  const handleDeleteComment = (commentId: number) => {
    confirm({
      title: '刪除評論',
      message: '確定要刪除此評論嗎？此操作無法撤銷。',
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setArticle({
            ...article,
            comment_list: article.comment_list.filter(
              (c: any) => c.id !== commentId
            ),
            comments: article.comments - 1,
          })
          showToast('success', '刪除成功', '評論已成功刪除')
        }, 500)
      },
    })
  }

  if (!article) {
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

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status)
    return statusOption ? (
      <Badge bg={statusOption.badge}>{statusOption.label}</Badge>
    ) : null
  }

  return (
    <div className="article-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link
            href="/admin/forum/articles"
            className="btn btn-outline-secondary me-3"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="mb-0">{isEditing ? '編輯文章' : '文章詳情'}</h2>
        </div>
        <div className="d-flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline-primary"
                onClick={() => setIsEditing(true)}
              >
                編輯文章
              </Button>
              {article.status === 'pending' && (
                <>
                  <Button
                    variant="outline-success"
                    onClick={handleApproveArticle}
                  >
                    <CheckCircle size={18} className="me-1" /> 通過審核
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={handleRejectArticle}
                  >
                    <XCircle size={18} className="me-1" /> 拒絕
                  </Button>
                </>
              )}
              <Button
                variant={article.featured ? 'warning' : 'outline-warning'}
                onClick={handleToggleFeatured}
              >
                <Star size={18} className="me-1" />{' '}
                {article.featured ? '取消精選' : '設為精選'}
              </Button>
              <Button variant="outline-danger" onClick={handleDeleteArticle}>
                <Trash size={18} className="me-1" /> 刪除
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Card
                className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>文章標題</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>文章內容</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="content"
                      value={formData.content || ''}
                      onChange={handleChange}
                      rows={15}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>標籤 (以逗號分隔)</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags ? formData.tags.join(', ') : ''}
                      onChange={handleTagsChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>封面圖片URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="cover_image"
                      value={formData.cover_image || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>分類</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      required
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>狀態</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      required
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="設為精選文章"
                      name="featured"
                      checked={formData.featured || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featured: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>

                  <div className="d-grid gap-2 mt-4">
                    <Button variant="primary" type="submit">
                      <Save size={18} className="me-1" /> 儲存變更
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData(article)
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card
                className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body>
                  <h5 className="mb-3">文章資訊</h5>
                  <p className="mb-2">
                    <strong>作者：</strong> {article.author} (ID:{' '}
                    {article.author_id})
                  </p>
                  <p className="mb-2">
                    <strong>建立日期：</strong>{' '}
                    {new Date(article.created_at).toLocaleDateString('zh-TW')}
                  </p>
                  <p className="mb-2">
                    <strong>最後更新：</strong>{' '}
                    {new Date(article.updated_at).toLocaleDateString('zh-TW')}
                  </p>
                  <p className="mb-2">
                    <strong>瀏覽量：</strong> {article.views}
                  </p>
                  <p className="mb-2">
                    <strong>讚數：</strong> {article.likes}
                  </p>
                  <p className="mb-0">
                    <strong>評論數：</strong> {article.comments}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      ) : (
        <>
          <Row>
            <Col md={8}>
              <Card
                className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">{article.title}</h3>
                    <div>
                      {getStatusBadge(article.status)}
                      {article.featured && (
                        <Badge bg="info" className="ms-2">
                          精選
                        </Badge>
                      )}
                    </div>
                  </div>

                  {article.cover_image && (
                    <div className="article-cover-image mb-4">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="img-fluid rounded"
                        style={{
                          maxHeight: '300px',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k || 'content')}
                    className="mb-3"
                  >
                    <Tab eventKey="content" title="文章內容">
                      <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </Tab>
                    <Tab
                      eventKey="comments"
                      title={`評論 (${article.comments})`}
                    >
                      <div className="article-comments">
                        {article.comment_list &&
                        article.comment_list.length > 0 ? (
                          <ListGroup>
                            {article.comment_list.map((comment: any) => (
                              <ListGroup.Item
                                key={comment.id}
                                className={
                                  isDarkMode
                                    ? 'bg-dark text-light border-secondary'
                                    : ''
                                }
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-bold">
                                      {comment.user_name} (ID: {comment.user_id}
                                      )
                                    </div>
                                    <p className="mb-1">{comment.content}</p>
                                    <small className="text-muted">
                                      {new Date(
                                        comment.created_at
                                      ).toLocaleDateString('zh-TW')}{' '}
                                      · 讚數: {comment.likes}
                                    </small>
                                  </div>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-center py-3">暫無評論</p>
                        )}
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className={`mb-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}
              >
                <Card.Body>
                  <h5 className="mb-3">文章資訊</h5>
                  <p className="mb-2">
                    <strong>作者：</strong> {article.author} (ID:{' '}
                    {article.author_id})
                  </p>
                  <p className="mb-2">
                    <strong>分類：</strong>{' '}
                    {CATEGORY_OPTIONS.find((c) => c.value === article.category)
                      ?.label || article.category}
                  </p>
                  <p className="mb-2">
                    <strong>狀態：</strong> {getStatusBadge(article.status)}
                  </p>
                  <p className="mb-2">
                    <strong>建立日期：</strong>{' '}
                    {new Date(article.created_at).toLocaleDateString('zh-TW')}
                  </p>
                  <p className="mb-2">
                    <strong>最後更新：</strong>{' '}
                    {new Date(article.updated_at).toLocaleDateString('zh-TW')}
                  </p>
                  <p className="mb-2">
                    <strong>瀏覽量：</strong> {article.views}
                  </p>
                  <p className="mb-2">
                    <strong>讚數：</strong> {article.likes}
                  </p>
                  <p className="mb-2">
                    <strong>評論數：</strong> {article.comments}
                  </p>
                  <p className="mb-2">
                    <strong>精選：</strong> {article.featured ? '是' : '否'}
                  </p>
                  <div className="mb-0">
                    <strong>標籤：</strong>
                    <div className="mt-1">
                      {article.tags &&
                        article.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            bg="secondary"
                            className="me-1 mb-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
                <Card.Body>
                  <h5 className="mb-3">快速操作</h5>
                  <div className="d-grid gap-2">
                    <Link
                      href={`/admin/members/${article.author_id}`}
                      className="btn btn-outline-primary"
                    >
                      查看作者資料
                    </Link>
                    <Link
                      href={`/forum/articles/${article.id}`}
                      target="_blank"
                      className="btn btn-outline-secondary"
                    >
                      前台預覽
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

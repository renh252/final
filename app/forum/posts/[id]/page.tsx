'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Button,
  Form,
  Badge,
  Row,
  Col,
} from 'react-bootstrap'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { BsArrowUpCircle, BsArrowUpCircleFill, BsChat } from 'react-icons/bs'
import Link from 'next/link'
import '../../styles/custom-theme.css'

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
  comment_count: number
  user_id: number
  category: {
    id: number
    name: string
    slug: string
  }
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
}

interface Comment {
  id: number
  content: string
  created_at: string
  user_id: number
}

const forumRules = [
  {
    id: 1,
    title: '禁止離題內容',
    description: '所有貼文必須與寵物相關。'
  },
  {
    id: 2,
    title: '禁止廣告與自我推銷',
    description: '禁止未經授權的商業宣傳。'
  },
  {
    id: 3,
    title: '禁止低質量/惡意投機的貼文',
    description: '請確保您的貼文有實質的討論價值。'
  },
  {
    id: 4,
    title: '禁止煽動仇恨',
    description: '保持友善的討論氛圍。'
  }
]

const sidebarLinks = [
  { title: '寵物照護', url: '/care' },
  { title: '寵物健康', url: '/health' },
  { title: '寵物行為', url: '/behavior' },
  { title: '寵物美容', url: '/grooming' },
  { title: '寵物訓練', url: '/training' }
]

export default function PostDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/forum/posts/${params.id}`)
        if (response.data.status === 'success') {
          setPost(response.data.data.post)
          setComments(response.data.data.post.forum_comments || [])
          setLikesCount(response.data.data.post.like_count)
          setLoading(false)
        } else {
          setError(response.data.message || '無法載入文章')
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || '無法載入文章')
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPostDetail()
    }
  }, [params.id])

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/forum/posts/${params.id}`, {
        action: 'like'
      })
      
      if (response.data.status === 'success') {
        setIsLiked(response.data.data.isLiked)
        setLikesCount(response.data.data.likesCount)
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const newCommentData: Comment = {
        id: Date.now(),
        content: newComment,
        created_at: new Date().toISOString(),
        user_id: 1
      }

      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  if (loading) return <div className="forum-layout">載入中...</div>
  if (error) return <div className="forum-layout">錯誤: {error}</div>
  if (!post) return <div className="forum-layout">找不到文章</div>

  return (
    <div className="forum-layout">
      <Container className="py-4">
        <Row>
          {/* 主要內容區 */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                {/* Vote and Content Section */}
                <div className="d-flex">
                  {/* Vote Section */}
                  <div className="bg-light p-2 text-center" style={{ width: '40px' }}>
                    <button 
                      onClick={handleLike}
                      className="btn btn-link p-0 d-block mx-auto"
                      style={{ color: isLiked ? 'var(--primary-color)' : '#878A8C' }}
                    >
                      {isLiked ? <BsArrowUpCircleFill size={24} /> : <BsArrowUpCircle size={24} />}
                    </button>
                    <div className="my-1 fw-bold" style={{ color: isLiked ? 'var(--primary-color)' : '#1A1A1B' }}>
                      {likesCount}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-grow-1 p-3">
                    {/* Post Header */}
                    <div className="mb-2">
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <Badge bg="primary" className="me-2">
                          {post?.category.name}
                        </Badge>
                        <span>由 u/{post?.user_id} 發布於 </span>
                        <span className="ms-1">
                          {formatDistanceToNow(new Date(post?.created_at || ''), { locale: zhTW, addSuffix: true })}
                        </span>
                      </div>
                      <h2 className="h4 mb-3">{post?.title}</h2>
                    </div>

                    {/* Post Content */}
                    <div className="post-content mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                      {post?.content}
                    </div>

                    {/* Tags */}
                    <div className="mb-3">
                      {post?.tags.map(tag => (
                        <Badge 
                          key={tag.id} 
                          bg="secondary" 
                          className="me-1" 
                          style={{ backgroundColor: 'var(--primary-light)', color: 'var(--secondary-color)' }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Post Footer */}
                    <div className="d-flex align-items-center text-muted small">
                      <div className="me-3">
                        <BsChat className="me-1" />
                        {comments.length} 則評論
                      </div>
                      <div>
                        {post?.view_count} 次瀏覽
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Comment Form */}
            <Card className="mt-3 border-0 shadow-sm">
              <Card.Body>
                <Form onSubmit={handleSubmitComment}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="寫下你的評論..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2"
                    />
                  </Form.Group>
                  <div className="text-end">
                    <Button type="submit" variant="primary" disabled={!newComment.trim()}>
                      發表評論
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Comments Section */}
            <div className="mt-3">
              {comments.map(comment => (
                <Card key={comment.id} className="mb-2 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small">
                        <span className="fw-bold">u/{comment.user_id}</span>
                        <span className="text-muted ms-2">
                          {formatDistanceToNow(new Date(comment.created_at), { locale: zhTW, addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          {/* 側邊欄 */}
          <Col lg={4}>
            {/* 社群資訊卡片 */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header>
                <h5 className="mb-0">關於寵物社群</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="fw-bold mb-2">社群資訊</div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>成員數</span>
                    <span className="fw-bold">3.7M</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>在線人數</span>
                    <span className="text-success">559</span>
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    創建於 2025年1月1日
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* 社群規則卡片 */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header>
                <h5 className="mb-0">社群規則</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {forumRules.map((rule, index) => (
                  <div 
                    key={rule.id}
                    className="p-3 border-bottom"
                    style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                  >
                    <div className="fw-bold mb-1">
                      {index + 1}. {rule.title}
                    </div>
                    <small className="text-muted">
                      {rule.description}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* 相關連結卡片 */}
            <Card className="border-0 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">相關連結</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {sidebarLinks.map((link, index) => (
                  <Link 
                    key={link.url}
                    href={link.url}
                    className="d-block p-3 text-decoration-none text-dark border-bottom"
                    style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                  >
                    {link.title}
                  </Link>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

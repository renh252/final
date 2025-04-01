'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
  comment_count: number
  user: {
    id: number
    name: string
    avatar: string
  }
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
  user: {
    id: number
    name: string
    avatar: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
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
    } catch (error) {
      console.error('點讚失敗:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      // 直接在前端添加評論
      const newCommentData: Comment = {
        id: Date.now(),
        content: newComment,
        created_at: new Date().toISOString(),
        user: {
          id: 1,
          name: 'Anonymous User',
          avatar: '/images/default-avatar.png'
        }
      }

      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('發表評論失敗:', error)
    }
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    )
  }

  if (error || !post) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger" role="alert">
          {error || '找不到此文章'}
        </div>
        <Button variant="link" onClick={() => router.back()}>
          返回上一頁
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <Image
              src={post.user.avatar}
              alt={post.user.name}
              width={40}
              height={40}
              className="rounded-circle me-2"
            />
            <div>
              <div className="fw-bold">{post.user.name}</div>
              <small className="text-muted">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: zhTW
                })}
              </small>
            </div>
          </div>

          <h1 className="h3 mb-3">{post.title}</h1>
          
          <div className="mb-3">
            <Badge bg="primary" className="me-2">
              {post.category.name}
            </Badge>
            {post.tags.map(tag => (
              <Badge key={tag.id} bg="secondary" className="me-2">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>

          <div className="d-flex align-items-center text-muted">
            <Button
              variant={isLiked ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={handleLike}
              className="me-3"
            >
              <i className="bi bi-hand-thumbs-up me-1"></i>
              {likesCount}
            </Button>
            <span className="me-3">
              <i className="bi bi-eye me-1"></i>
              {post.view_count}
            </span>
            <span>
              <i className="bi bi-chat-dots me-1"></i>
              {comments.length}
            </span>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">發表評論</h5>
          <Form onSubmit={handleSubmitComment}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="寫下你的評論..."
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              發表評論
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div>
        <h5 className="mb-3">評論 ({comments.length})</h5>
        {comments.map((comment) => (
          <Card key={comment.id} className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <Image
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  width={32}
                  height={32}
                  className="rounded-circle me-2"
                />
                <div>
                  <div className="fw-bold">{comment.user.name}</div>
                  <small className="text-muted">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: zhTW
                    })}
                  </small>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  )
}

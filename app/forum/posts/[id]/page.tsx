'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Button,
  Form,
  Badge,
} from 'react-bootstrap'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

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
      // 直接在前端添加評論
      const newCommentData: Comment = {
        id: Date.now(),
        content: newComment,
        created_at: new Date().toISOString(),
        user_id: 1
      }

      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('發表評論失敗:', error)
    }
  }

  if (loading) return <div>載入中...</div>
  if (error) return <div>錯誤: {error}</div>
  if (!post) return <div>找不到文章</div>

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="h2 mb-3">{post.title}</h1>
              <div className="text-muted mb-2">
                <small>
                  發布於 {formatDistanceToNow(new Date(post.created_at), { locale: zhTW, addSuffix: true })}
                  {post.created_at !== post.updated_at && 
                    ` • 編輯於 ${formatDistanceToNow(new Date(post.updated_at), { locale: zhTW, addSuffix: true })}`
                  }
                </small>
              </div>
              <div className="mb-2">
                <Badge bg="primary" className="me-2">
                  {post.category.name}
                </Badge>
                {post.tags.map(tag => (
                  <Badge key={tag.id} bg="secondary" className="me-1">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-muted">
              <small>觀看次數: {post.view_count}</small>
            </div>
          </div>

          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button 
              variant={isLiked ? "primary" : "outline-primary"}
              onClick={handleLike}
            >
              {isLiked ? '已讚' : '讚'} ({likesCount})
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4">
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

      <div className="mt-4">
        <h3>評論 ({comments.length})</h3>
        {comments.map(comment => (
          <Card key={comment.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>用戶 {comment.user_id}</strong>
                  <small className="text-muted ms-2">
                    {formatDistanceToNow(new Date(comment.created_at), { locale: zhTW, addSuffix: true })}
                  </small>
                </div>
              </div>
              <Card.Text className="mt-2">
                {comment.content}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  )
}

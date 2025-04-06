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
import { BsArrowUpCircle, BsArrowUpCircleFill, BsArrowDownCircle, BsArrowDownCircleFill, BsChat, BsShare, BsFlag, BsHeart, BsHeartFill } from 'react-icons/bs'
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import Link from 'next/link'
import styles from './PostDetail.module.css'
import '../../styles/custom-theme.css'
import ReportModal from '../../components/ReportModal'
import SuccessAlert from '@/app/_components/successAlert'
interface Post {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
  dislike_count: number
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
    title: '互相尊重，每個人都是毛孩的好家人',
    description: '所有貼文必須與寵物相關。'
  },
  {
    id: 2,
    title: '避免張貼廣告或無關內容',
    description: '禁止未經授權的商業宣傳。'
  },
  {
    id: 3,
    title: '歡迎分享你家寶貝的大小事，越實用越好',
    description: '請確保您的貼文有實質的討論價值。'
  },
  {
    id: 4,
    title: '發文時別忘了善用分類標籤，讓大家更容易找到',
    description: '保持友善的討論氛圍。'
  }
]

const sidebarLinks = [
  {
    url: 'https://twitter.com',
    title: 'X',
    icon: FaTwitter
  },
  {
    url: 'https://facebook.com',
    title: 'Facebook',
    icon: FaFacebook
  },
  {
    url: 'https://instagram.com',
    title: 'Instagram',
    icon: FaInstagram
  }
]

export default function PostDetailPage() {
  const params = useParams()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    SuccessAlert()
  }

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/forum/posts/${params.id}`)
        if (response.data.status === 'success') {
          setPost(response.data.data.post)
          setComments(response.data.data.post.forum_comments || [])
          // 計算總和：讚同數減去不讚同數
          setVoteCount(response.data.data.post.like_count - (response.data.data.post.dislike_count || 0))
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
    if (isDisliked) {
      setIsDisliked(false)
      setVoteCount(prev => prev + 1) // 移除不讚同
    }
    try {
      const response = await axios.post(`/api/forum/posts/${params.id}`, {
        action: 'like'
      })
      
      if (response.data.status === 'success') {
        const wasLiked = isLiked
        setIsLiked(response.data.data.isLiked)
        // 根據之前的狀態調整計數
        setVoteCount(prev => prev + (wasLiked ? -1 : 1))
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleDislike = async () => {
    if (isLiked) {
      setIsLiked(false)
      setVoteCount(prev => prev - 1) // 移除讚同
    }
    try {
      const response = await axios.post(`/api/forum/posts/${params.id}`, {
        action: 'dislike'
      })
      
      if (response.data.status === 'success') {
        const wasDisliked = isDisliked
        setIsDisliked(response.data.data.isDisliked)
        // 根據之前的狀態調整計數
        setVoteCount(prev => prev - (wasDisliked ? -1 : 1))
      }
    } catch (err) {
      console.error('Error disliking post:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: `查看這篇寵物論壇文章：${post?.title}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err))
    } else {
      // 如果瀏覽器不支援原生分享，複製連結到剪貼簿
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('連結已複製到剪貼簿'))
        .catch(err => console.error('Error copying to clipboard:', err))
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
                  <div className={styles.voteSection}>
                    <button 
                      onClick={handleLike}
                      className={`btn btn-link ${styles.voteButton} ${isLiked ? styles.liked : styles.default}`}
                      title="讚同"
                      aria-label="讚同這篇文章"
                    >
                      {isLiked ? <BsArrowUpCircleFill size={24} /> : <BsArrowUpCircle size={24} />}
                    </button>
                    <div className={`${styles.voteCount} ${
                      isLiked ? styles.liked : 
                      isDisliked ? styles.disliked : 
                      styles.default
                    }`}>
                      {voteCount}
                    </div>
                    <button 
                      onClick={handleDislike}
                      className={`btn btn-link ${styles.voteButton} ${isDisliked ? styles.disliked : styles.default}`}
                      title="不讚同"
                      aria-label="不讚同這篇文章"
                    >
                      {isDisliked ? <BsArrowDownCircleFill size={24} /> : <BsArrowDownCircle size={24} />}
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className={styles.contentSection}>
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
                    <div className="mb-4">
                      {post?.content}
                    </div>

                    {/* Post Actions */}
                    <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center gap-3">
                        <button
                          onClick={handleFavorite}
                          className={`btn btn-link ${styles.favoriteButton}`}
                          title={isFavorited ? "取消收藏" : "加入收藏"}
                          aria-label={isFavorited ? "取消收藏這篇文章" : "收藏這篇文章"}
                        >
                          {isFavorited ? <BsHeartFill size={18} /> : <BsHeart size={18} />}
                          <span className="ms-1">{isFavorited ? '已收藏' : '收藏'}</span>
                        </button>
                        <button
                          onClick={() => setShowReportModal(true)}
                          className={`btn btn-link ${styles.reportButton}`}
                          title="檢舉文章"
                          aria-label="檢舉這篇文章"
                        >
                          <BsFlag size={18} /> <span className="ms-1">檢舉</span>
                        </button>
                        <button
                          onClick={handleShare}
                          className={`btn btn-link ${styles.shareButton}`}
                          title="分享文章"
                          aria-label="分享這篇文章"
                        >
                          <BsShare size={18} /> <span className="ms-1">分享</span>
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          href={`/forum/posts/${post?.id}#comments`}
                          className="text-decoration-none text-muted"
                        >
                          <BsChat size={18} /> <span className="ms-1">{comments.length} 則留言</span>
                        </Link>
                      </div>
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
                    <span className="fw-bold">15</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>在線人數</span>
                    <span className="text-success">1</span>
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">
                    創建於 2025年3月15日
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* 社群規則卡片 */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header>
                <h5 className="mb-0">論壇守則：</h5>
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
                <h5 className="mb-0">「毛孩之家」粉絲團</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {sidebarLinks.map((link, index) => (
                  <Link 
                    key={link.url}
                    href={link.url}
                    className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                    style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="me-3" size={24} />
                    {link.title}
                  </Link>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        contentType="post"
        contentId={Number(params.id)}
      />
    </div>
  )
}

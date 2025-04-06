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
import Image from 'next/image'
import styles from './PostDetail.module.css'
import './PostDetail.enhanced.css'
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
  images?: string[]
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
  const [isAnimated, setIsAnimated] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    SuccessAlert()
  }

  useEffect(() => {
    // 當頁面載入完成後觸發動畫
    if (!loading && post) {
      setTimeout(() => {
        setIsAnimated(true)
      }, 100)
    }
  }, [loading, post])

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
      <Container className="forum-container p-0">

        <Row>
          {/* 主要內容區 */}
          <Col lg={8}>

            <Card className="border-0 shadow-sm rounded-0">
              <Card.Body className="p-0">
                {/* Vote and Content Section */}
                <div className="d-flex">
                  {/* Vote Section */}
                  <div className="vote-section hover-float">
                    <button 
                      onClick={handleLike}
                      className={`btn btn-link vote-button ${isLiked ? styles.liked : styles.default}`}
                      title="讚同"
                      aria-label="讚同這篇文章"
                    >
                      {isLiked ? <BsArrowUpCircleFill size={24} /> : <BsArrowUpCircle size={24} />}
                    </button>
                    <div className={`vote-count ${
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
                    <div className={`post-meta mb-4 animate-content ${isAnimated ? 'play' : ''}`}>
                      <div className="meta-header d-flex align-items-center gap-3 mb-2">
                        <Badge bg="primary" className="category-badge hover-float">
                          <i className="bi bi-folder me-1"></i>
                          {post?.category.name}
                        </Badge>
                        <div className="user-info">
                          <i className="bi bi-person-circle me-1"></i>
                          <span>u/{post?.user_id}</span>
                        </div>
                        <div className="post-time">
                          <i className="bi bi-clock me-1"></i>
                          {formatDistanceToNow(new Date(post?.created_at || ''), { locale: zhTW, addSuffix: true })}
                        </div>
                      </div>
                      <h2 className="h4 mb-3 post-title">{post?.title}</h2>
                    </div>

                    {/* Post Content */}
                    <div className={`post-content mb-4 animate-content ${isAnimated ? 'play' : ''}`}>
                      <div className="content-wrapper">
                        {post?.content}
                      </div>
                      {post?.images && post.images.length > 0 && (
                        <div className="post-images mt-4">
                          {post.images.map((image: string, index: number) => (
                            <div key={index} className="post-image-wrapper hover-float">
                              <Image
                                src={image}
                                alt={`文章附圖 #${index + 1}`}
                                width={800}
                                height={600}
                                className="post-image"
                                priority={index === 0}
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
            <Card className="comment-form mt-3 border-0 shadow-sm">
              <Card.Body>
                <Form onSubmit={handleSubmitComment}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="寫下你的評論..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-textarea mb-2"
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
            <div className="mt-4">
              {comments.map((comment, index) => (
                <Card 
                  key={comment.id} 
                  className="comment-card mb-3 border-0 shadow-sm animate__animated animate__fadeIn overflow-hidden"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex gap-3 mb-3">
                      <div className="comment-avatar">
                        {comment.user_id.toString().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">u/{comment.user_id}</span>
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <i className="bi bi-clock"></i>
                            {formatDistanceToNow(new Date(comment.created_at), { 
                              locale: zhTW, 
                              addSuffix: true 
                            })}
                          </span>
                        </div>
                        <div className="comment-content">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-5 text-muted animate__animated animate__fadeIn comment-empty-state">
                  <i className="bi bi-chat-square-text fs-1 mb-3 d-block"></i>
                  <p className="mb-0">還沒有人留言，來當第一個留言的人吧！</p>
                </div>
              )}
            </div>
          </Col>

          {/* 側邊欄 */}
          <Col lg={4}>
            {/* 社群資訊卡片 */}
            <Card className="sidebar-card border-0 shadow-sm mb-3">
              <Card.Header className="sidebar-header">
                <h5 className="mb-0">關於寵物社群</h5>
              </Card.Header>
              <Card.Body>
                <div className="community-stats mb-4 hover-lift">
                  <div className="stats-header">
                    <i className="bi bi-house-heart-fill"></i>
                    關於寵物社群
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">成員數</div>
                      <div className="stat-value">15 位成員</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="bi bi-emoji-smile-fill text-success"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">目前在線</div>
                      <div className="stat-value text-success">1 位成員</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">社群創建</div>
                      <div className="stat-value">
                        {formatDistanceToNow(new Date('2025-03-15'), { locale: zhTW, addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* 社群規則卡片 */}
            <Card className="sidebar-card border-0 shadow-sm mb-3">
              <Card.Header className="sidebar-header">
                <h5 className="mb-0">論壇守則：</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {forumRules.map((rule, index) => (
                  <div 
                    key={rule.id}
                    className={`forum-rule p-3 ${index !== forumRules.length - 1 ? 'border-bottom' : ''}`}
                  >
                    <div className="rule-number">{index + 1}</div>
                    <div className="rule-content">
                      <div className="rule-title">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {rule.title}
                      </div>
                      <div className="rule-description">
                        {rule.description}
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* 相關連結卡片 */}
            <Card className="sidebar-card border-0 shadow-sm">
              <Card.Header className="sidebar-header">
                <h5 className="mb-0">「毛孩之家」粉絲團</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {sidebarLinks.map((link) => (
                  <Link 
                    key={link.url}
                    href={link.url}
                    className="social-link d-flex align-items-center p-3 text-decoration-none hover-slide"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="social-icon">
                      <link.icon size={20} />
                    </div>
                    <span className="social-title">{link.title}</span>
                    <i className="bi bi-box-arrow-up-right ms-auto"></i>
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

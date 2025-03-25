'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Post } from '../../hooks/useForumData';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [commentSort, setCommentSort] = useState<'best' | 'new' | 'old'>('best');

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/forum/posts/${params.id}`);
        if (response.data.status === 'success') {
          setPost(response.data.data.post);
          setComments(response.data.data.comments || []);
          setVoteCount(response.data.data.post.like_count || 0);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || '無法載入文章');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPostDetail();
    }
  }, [params.id]);

  const handleVote = async (type: 'up' | 'down') => {
    if (userVote === type) {
      // 取消投票
      setUserVote(null);
      setVoteCount(prev => type === 'up' ? prev - 1 : prev + 1);
    } else {
      // 新投票或改變投票
      const voteChange = userVote ? 2 : 1;
      setVoteCount(prev => type === 'up' ? prev + voteChange : prev - voteChange);
      setUserVote(type);
    }

    try {
      await axios.post(`/api/forum/posts/${params.id}/vote`, { type });
    } catch (err) {
      console.error('投票失敗', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/forum/posts/${params.id}/comments`, {
        content: newComment
      });

      if (response.data.status === 'success') {
        setComments(prev => [response.data.data, ...prev]);
        setNewComment('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '發表評論失敗');
    }
  };

  const sortComments = (comments: Comment[]) => {
    switch (commentSort) {
      case 'new':
        return [...comments].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'old':
        return [...comments].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'best':
      default:
        return comments; // 假設已經按最佳排序
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
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
    );
  }

  const tags = post.tags?.split(',').filter(Boolean) || [];

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3">
        <Button variant="link" className="p-0 me-2" onClick={() => router.back()}>
          <i className="bi bi-arrow-left"></i>
        </Button>
        <Link href="/forum" className="text-decoration-none text-dark">
          <span className="fw-bold">回到論壇</span>
        </Link>
      </div>

      <Row>
        {/* 左側投票區 */}
        <Col xs={1} className="pe-0">
          <div className="d-flex flex-column align-items-center bg-light rounded-start p-2" style={{ position: 'sticky', top: '1rem' }}>
            <Button 
              variant="link" 
              className={`p-0 mb-1 ${userVote === 'up' ? 'text-danger' : 'text-secondary'}`}
              onClick={() => handleVote('up')}
            >
              <i className="bi bi-arrow-up-circle-fill fs-4"></i>
            </Button>
            
            <div className="fw-bold my-1">{voteCount}</div>
            
            <Button 
              variant="link" 
              className={`p-0 mt-1 ${userVote === 'down' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => handleVote('down')}
            >
              <i className="bi bi-arrow-down-circle-fill fs-4"></i>
            </Button>
          </div>
        </Col>

        {/* 右側內容區 */}
        <Col xs={11} className="ps-0">
          <Card className="border-0 mb-4">
            <Card.Body className="bg-light rounded-end">
              <div className="d-flex flex-column">
                {/* 文章頭部信息 */}
                <div className="text-muted small mb-2">
                  <span className="me-2">
                    <i className="bi bi-person-circle me-1"></i>
                    {post.author_name || '匿名用戶'}
                  </span>
                  <span>
                    <i className="bi bi-clock me-1"></i>
                    {formatDistanceToNow(new Date(post.created_at), { locale: zhTW, addSuffix: true })}
                  </span>
                </div>

                {/* 文章標題 */}
                <h3 className="mb-3">{post.title}</h3>

                {/* 標籤 */}
                {tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {tags.map(tag => (
                      <Link 
                        key={tag} 
                        href={`/forum?tags=${tag}`} 
                        className="badge text-decoration-none rounded-pill px-3 py-2"
                        style={{ backgroundColor: '#F3F3F3', color: '#1A1A1B' }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* 文章內容 */}
                <div className="my-3 post-content" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.6' }}>
                  {post.content}
                </div>

                {/* 文章底部統計 */}
                <div className="d-flex align-items-center text-muted mt-3">
                  <div className="me-3">
                    <i className="bi bi-chat-dots me-1"></i>
                    {comments.length} 評論
                  </div>
                  <div className="me-3">
                    <i className="bi bi-eye me-1"></i>
                    {post.view_count || 0} 瀏覽
                  </div>
                  <div className="me-3">
                    <i className="bi bi-share me-1"></i>
                    分享
                  </div>
                  <div className="me-3">
                    <i className="bi bi-bookmark me-1"></i>
                    收藏
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 評論區 */}
          <Card className="border-0 mb-4">
            <Card.Body className="bg-light rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">評論 ({comments.length})</h5>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" size="sm" id="comment-sort-dropdown">
                    {commentSort === 'best' ? '最佳評論' : commentSort === 'new' ? '最新評論' : '最舊評論'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setCommentSort('best')}>最佳評論</Dropdown.Item>
                    <Dropdown.Item onClick={() => setCommentSort('new')}>最新評論</Dropdown.Item>
                    <Dropdown.Item onClick={() => setCommentSort('old')}>最舊評論</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {/* 評論輸入框 */}
              <Form onSubmit={handleSubmitComment} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="分享你的想法..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border-0 bg-white"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" disabled={!newComment.trim()}>
                    發表評論
                  </Button>
                </div>
              </Form>

              {/* 評論列表 */}
              <div className="comment-list">
                {sortComments(comments).length > 0 ? (
                  sortComments(comments).map(comment => (
                    <div key={comment.id} className="comment-item mb-3 pb-3 border-bottom">
                      <div className="d-flex">
                        {/* 左側頭像 */}
                        <div className="me-2">
                          <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '32px', height: '32px', backgroundColor: '#593E2F' }}>
                            {comment.author_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        
                        {/* 右側內容 */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span className="fw-bold me-2">{comment.author_name || '匿名用戶'}</span>
                            <small className="text-muted">
                              {formatDistanceToNow(new Date(comment.created_at), { locale: zhTW, addSuffix: true })}
                            </small>
                          </div>
                          <div className="comment-content">{comment.content}</div>
                          
                          {/* 評論操作 */}
                          <div className="d-flex mt-2 text-muted">
                            <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                              <i className="bi bi-reply me-1"></i>回覆
                            </Button>
                            <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                              <i className="bi bi-hand-thumbs-up me-1"></i>讚
                            </Button>
                            <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                              <i className="bi bi-hand-thumbs-down me-1"></i>踩
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-chat-dots mb-2 fs-3"></i>
                    <p>還沒有評論，成為第一個留言的人吧！</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Dropdown, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Post } from '../../hooks/useForumData';
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
  const [searchComment, setSearchComment] = useState('');
  const [showRules, setShowRules] = useState(false);

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
        // Add the new comment to the comments array
        setComments(prev => [response.data.data, ...prev]);
        setNewComment('');
      } else {
        alert(response.data.message || '發表評論失敗');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '發表評論失敗');
    }
  };

  const sortComments = (comments: Comment[]) => {
    let sortedComments = [...comments];
    
    // 先根據排序選項排序
    switch (commentSort) {
      case 'new':
        sortedComments = sortedComments.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'old':
        sortedComments = sortedComments.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'best':
      default:
        // 假設最佳評論是按讚數排序，這裡我們沒有讚數資料，所以保持原樣
        break;
    }
    
    // 如果有搜尋關鍵字，則過濾評論
    if (searchComment.trim()) {
      const keyword = searchComment.toLowerCase();
      sortedComments = sortedComments.filter(comment => 
        comment.content.toLowerCase().includes(keyword) ||
        comment.author_name.toLowerCase().includes(keyword)
      );
    }
    
    return sortedComments;
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
  const forumRules = [
    '您的貼文必須是一個不受歡迎的觀點',
    '不要發布低品質/諷刺/惡搞貼文',
    '不要發布已經在首頁上出現過的觀點',
    '保持禮貌',
    '不要發布政治貼文',
    '不要發布 r/self 風格的貼文'
  ];

  return (
    <Container className="py-4" fluid>
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          {/* 頂部導航 */}
          <div className="d-flex align-items-center mb-3">
            <Button variant="link" className="p-0 me-2" onClick={() => router.back()}>
              <i className="bi bi-arrow-left"></i>
            </Button>
            <Link href="/forum" className="text-decoration-none text-dark">
              <span className="fw-bold">回到論壇</span>
            </Link>
            <div className="ms-auto d-flex align-items-center">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>加入社群</Tooltip>}
              >
                <Button variant="dark" size="sm" className="rounded-pill me-2">
                  加入
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>分享此貼文</Tooltip>}
              >
                <Button variant="outline-secondary" size="sm" className="rounded-circle p-1 me-2">
                  <i className="bi bi-share"></i>
                </Button>
              </OverlayTrigger>
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="bg-transparent border-0 p-0">
                  <i className="bi bi-three-dots-vertical"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#"><i className="bi bi-bookmark me-2"></i>收藏</Dropdown.Item>
                  <Dropdown.Item href="#"><i className="bi bi-flag me-2"></i>舉報</Dropdown.Item>
                  <Dropdown.Item href="#"><i className="bi bi-eye-slash me-2"></i>隱藏</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
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
                    <div className="text-muted small mb-2 d-flex align-items-center">
                      <Link href="/forum" className="text-decoration-none me-2">
                        <span className="fw-bold text-dark">r/毛孩之家</span>
                      </Link>
                      <span className="mx-1">•</span>
                      <span className="d-flex align-items-center me-2">
                        <i className="bi bi-person-circle me-1"></i>
                        <span>發表於 <Link href="#" className="text-decoration-none text-muted">{post.author_name || '匿名用戶'}</Link></span>
                      </span>
                      <span className="mx-1">•</span>
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
                      <div className="me-3 d-flex align-items-center">
                        <i className="bi bi-chat-dots me-1"></i>
                        <span>{comments.length} 評論</span>
                      </div>
                      <div className="me-3 d-flex align-items-center">
                        <i className="bi bi-eye me-1"></i>
                        <span>{post.view_count || 0} 瀏覽</span>
                      </div>
                      <div className="me-3 d-flex align-items-center">
                        <i className="bi bi-share me-1"></i>
                        <span>分享</span>
                      </div>
                      <div className="me-3 d-flex align-items-center">
                        <i className="bi bi-bookmark me-1"></i>
                        <span>收藏</span>
                      </div>
                      <div className="me-3 d-flex align-items-center">
                        <i className="bi bi-flag me-1"></i>
                        <span>舉報</span>
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
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="搜尋評論..."
                        className="me-2 rounded-pill"
                        size="sm"
                        value={searchComment}
                        onChange={(e) => setSearchComment(e.target.value)}
                      />
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" size="sm" id="comment-sort-dropdown" className="rounded-pill">
                          {commentSort === 'best' ? '最佳評論' : commentSort === 'new' ? '最新評論' : '最舊評論'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => setCommentSort('best')}>
                            <i className="bi bi-star me-2"></i>最佳評論
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setCommentSort('new')}>
                            <i className="bi bi-clock-history me-2"></i>最新評論
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setCommentSort('old')}>
                            <i className="bi bi-calendar-date me-2"></i>最舊評論
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
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
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Button 
                          variant="link" 
                          className="text-muted p-0 me-3" 
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-image me-1"></i>添加圖片
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-muted p-0" 
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-link-45deg me-1"></i>添加連結
                        </Button>
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={!newComment.trim()} 
                        className="rounded-pill"
                      >
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
                                <Badge bg="secondary" className="me-2 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  OP
                                </Badge>
                                <small className="text-muted">
                                  {formatDistanceToNow(new Date(comment.created_at), { locale: zhTW, addSuffix: true })}
                                </small>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>編輯過的評論</Tooltip>}
                                >
                                  <span className="ms-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                    <i className="bi bi-pencil-square"></i>
                                  </span>
                                </OverlayTrigger>
                              </div>
                              <div className="comment-content">{comment.content}</div>
                              
                              {/* 評論操作 */}
                              <div className="d-flex mt-2 text-muted">
                                <div className="d-flex align-items-center me-3">
                                  <Button variant="link" className="p-0 me-1 text-muted" style={{ fontSize: '0.875rem' }}>
                                    <i className="bi bi-hand-thumbs-up"></i>
                                  </Button>
                                  <span className="small">12</span>
                                  <Button variant="link" className="p-0 ms-1 text-muted" style={{ fontSize: '0.875rem' }}>
                                    <i className="bi bi-hand-thumbs-down"></i>
                                  </Button>
                                </div>
                                <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                                  <i className="bi bi-reply me-1"></i>回覆
                                </Button>
                                <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                                  <i className="bi bi-award me-1"></i>獎勵
                                </Button>
                                <Button variant="link" className="p-0 me-3 text-muted" style={{ fontSize: '0.875rem' }}>
                                  <i className="bi bi-flag me-1"></i>舉報
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
        </Col>
        
        {/* 右側資訊欄 */}
        <Col xs={12} lg={3}>
          <div style={{ position: 'sticky', top: '1rem' }}>
            {/* 社群資訊卡片 */}
            <Card className="mb-3">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <span>「毛孩之家」寵物討論區</span>
                <Button variant="outline-light" size="sm">加入</Button>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="fw-bold mb-2">為您的觀點提供一個平台</div>
                  <div className="text-muted small">分享您的熱門話題和不受歡迎的觀點！</div>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <div>
                    <div className="fw-bold">4.6萬</div>
                    <div>成員</div>
                  </div>
                  <div>
                    <div className="fw-bold">1.5千</div>
                    <div>線上</div>
                  </div>
                  <div>
                    <div className="fw-bold">前1%</div>
                    <div>排名</div>
                  </div>
                </div>
                <div className="text-muted small">
                  <i className="bi bi-calendar me-1"></i>創建於 2012年2月14日
                </div>
              </Card.Body>
              <Card.Footer className="bg-light">
                <Button variant="primary" className="w-100 mb-2">創建貼文</Button>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" size="sm" className="w-100 me-1">分享</Button>
                  <Button variant="outline-secondary" size="sm" className="w-100 ms-1">...</Button>
                </div>
              </Card.Footer>
            </Card>

            {/* 社群規則卡片 */}
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">社群規則</span>
                  <Button 
                    variant="link" 
                    className="p-0 text-dark" 
                    onClick={() => setShowRules(!showRules)}
                  >
                    <i className={`bi bi-chevron-${showRules ? 'up' : 'down'}`}></i>
                  </Button>
                </div>
              </Card.Header>
              {showRules && (
                <Card.Body>
                  <ol className="ps-3 mb-0">
                    {forumRules.map((rule, index) => (
                      <li key={index} className="mb-2">
                        <div className="d-flex">
                          <span className="me-2">{index + 1}.</span>
                          <span>{rule}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card.Body>
              )}
            </Card>

            {/* 版主卡片 */}
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <span className="fw-bold">版主</span>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                    style={{ width: '24px', height: '24px', backgroundColor: '#593E2F' }}>
                    <span style={{ fontSize: '0.7rem' }}>A</span>
                  </div>
                  <span>Admin</span>
                  <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>創建者</Badge>
                </div>
                <div className="d-flex align-items-center">
                  <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                    style={{ width: '24px', height: '24px', backgroundColor: '#593E2F' }}>
                    <span style={{ fontSize: '0.7rem' }}>M</span>
                  </div>
                  <span>Moderator</span>
                </div>
              </Card.Body>
              <Card.Footer className="bg-light text-center">
                <Button variant="link" className="text-muted p-0" style={{ fontSize: '0.875rem' }}>
                  查看所有版主
                </Button>
              </Card.Footer>
            </Card>

            {/* 社群連結 */}
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <span className="fw-bold">社群連結</span>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  <Link href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-book me-2"></i>
                    <span>Wiki</span>
                  </Link>
                  <Link href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-discord me-2"></i>
                    <span>Discord</span>
                  </Link>
                  <Link href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-telegram me-2"></i>
                    <span>Telegram</span>
                  </Link>
                </div>
              </Card.Body>
            </Card>

            {/* 頁腳 */}
            <div className="text-muted small">
              <div className="d-flex flex-wrap gap-2 mb-2">
                <Link href="#" className="text-muted text-decoration-none">幫助</Link>
                <Link href="#" className="text-muted text-decoration-none">Reddit幣</Link>
                <Link href="#" className="text-muted text-decoration-none">Reddit高級會員</Link>
                <Link href="#" className="text-muted text-decoration-none">關於</Link>
                <Link href="#" className="text-muted text-decoration-none">條款</Link>
                <Link href="#" className="text-muted text-decoration-none">隱私政策</Link>
              </div>
              <div> 2025 論壇, Inc. 保留所有權利</div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

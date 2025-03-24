'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Share2, ArrowBigUp, ArrowBigDown, Flag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import ReportModal from '../components/ReportModal';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  category: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  tags?: string;
}

interface Comment {
  id: number;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/forum/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('文章載入失敗');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">載入中...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || '找不到該文章'}
        </Alert>
      </Container>
    );
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/forum/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (!response.ok) {
        throw new Error('投票失敗');
      }

      // Refresh the post data
      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('投票錯誤:', err);
      // TODO: Show error toast
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!response.ok) {
        throw new Error('發表留言失敗');
      }

      // Refresh the post data
      const updatedPost = await response.json();
      setPost(updatedPost);
      setCommentContent('');
    } catch (err) {
      console.error('留言錯誤:', err);
      // TODO: Show error toast
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {/* Author Info */}
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-container me-3">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="rounded-circle"
                    />
                  ) : (
                    <div className={`${styles.avatarPlaceholder} rounded-circle d-flex align-items-center justify-content-center text-white bg-primary`}>
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h6 className="mb-0">{post.author.name}</h6>
                  <small className="text-muted">
                    {new Date(post.created_at).toLocaleDateString('zh-TW')}
                  </small>
                </div>
              </div>

              {/* Post Content */}
              <h2 className="mb-4">{post.title}</h2>
              <div className={`post-content mb-4 ${styles.whiteSpacePreWrap}`}>
                {post.content}
              </div>

              {/* Tags */}
              {post.tags && (
                <div className="mb-4">
                  {post.tags.split(',').map((tag) => (
                    <Link
                      key={tag}
                      href={`/forum?tags=${tag.trim()}`}
                      className={`me-2 px-3 py-1 rounded-pill text-decoration-none ${styles.tagBadge}`}
                    >
                      #{tag.trim()}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center border-top border-bottom py-3 mb-4">
                <div className="d-flex gap-3">
                  <Button variant="light" onClick={() => handleVote('up')} className="d-flex align-items-center gap-1">
                    <ArrowBigUp size={20} />
                    <span>{post.upvotes}</span>
                  </Button>
                  <Button variant="light" onClick={() => handleVote('down')} className="d-flex align-items-center gap-1">
                    <ArrowBigDown size={20} />
                    <span>{post.downvotes}</span>
                  </Button>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="light" className="d-flex align-items-center gap-1">
                    <Share2 size={20} />
                    分享
                  </Button>
                  <Button variant="light" onClick={() => setShowReportModal(true)} className="d-flex align-items-center gap-1">
                    <Flag size={20} />
                    檢舉
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              <h5 className="mb-4">留言 ({post.comments.length})</h5>
              <Form className="mb-4" onSubmit={(e) => { e.preventDefault(); handleComment(); }}>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="寫下你的留言..."
                    className="mb-2"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                </Form.Group>
                <div className="text-end">
                  <Button type="submit" variant="primary">發表留言</Button>
                </div>
              </Form>

              {/* Comments List */}
              <div className="comments-list">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="comment mb-3 p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar-container me-2">
                        {comment.author.avatar ? (
                          <Image
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            width={32}
                            height={32}
                            className="rounded-circle"
                          />
                        ) : (
                          <div className={`${styles.avatarPlaceholder} rounded-circle d-flex align-items-center justify-content-center text-white bg-primary`}>
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="fw-bold">{comment.author.name}</div>
                        <small className="text-muted">
                          {new Date(comment.created_at).toLocaleDateString('zh-TW')}
                        </small>
                      </div>
                    </div>
                    <div className={styles.commentContent}>{comment.content}</div>
                    <div className="d-flex gap-2 mt-2">
                      <Button variant="light" size="sm" className="d-flex align-items-center gap-1">
                        <ArrowBigUp size={16} />
                        <span>{comment.upvotes}</span>
                      </Button>
                      <Button variant="light" size="sm" className="d-flex align-items-center gap-1">
                        <ArrowBigDown size={16} />
                        <span>{comment.downvotes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        contentId={post.id}
        contentType="post"
      />
    </Container>
  );
}

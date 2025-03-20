'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Post } from '../../hooks/useForumData';

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

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/forum/posts/${params.id}`);
        if (response.data.status === 'success') {
          setPost(response.data.data.post);
          setComments(response.data.data.comments);
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/forum/posts/${params.id}/comments`, {
        content: newComment
      });

      if (response.data.status === 'success') {
        setComments(prev => [...prev, response.data.data]);
        setNewComment('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '發表評論失敗');
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

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 p-0" onClick={() => router.back()}>
        <i className="bi bi-arrow-left me-2"></i>
        返回列表
      </Button>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title className="h3 mb-3">{post.title}</Card.Title>
              <div className="text-muted small mb-2">
                <span className="me-3">
                  <i className="bi bi-person me-1"></i>
                  {post.author_name}
                </span>
                <span>
                  <i className="bi bi-clock me-1"></i>
                  {formatDistanceToNow(new Date(post.created_at), { locale: zhTW, addSuffix: true })}
                </span>
              </div>
              <div className="d-flex gap-2">
                {post.tags?.split(',').map(tag => (
                  <span key={tag} className="badge bg-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="d-flex gap-3 text-muted">
              <span>
                <i className="bi bi-eye me-1"></i>
                {post.view_count}
              </span>
              <span>
                <i className="bi bi-chat-dots me-1"></i>
                {post.comment_count}
              </span>
              <span>
                <i className="bi bi-heart me-1"></i>
                {post.like_count}
              </span>
            </div>
          </div>

          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Card.Text>
        </Card.Body>
      </Card>

      <h4 className="mb-3">評論 ({comments.length})</h4>
      
      <Form onSubmit={handleSubmitComment} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="寫下你的評論..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary">
          發表評論
        </Button>
      </Form>

      {comments.map(comment => (
        <Card key={comment.id} className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <div className="d-flex align-items-center">
                {comment.author_avatar && (
                  <img
                    src={comment.author_avatar}
                    alt={comment.author_name}
                    className="rounded-circle me-2"
                    width={32}
                    height={32}
                  />
                )}
                <span className="fw-bold">{comment.author_name}</span>
              </div>
              <small className="text-muted">
                {formatDistanceToNow(new Date(comment.created_at), { locale: zhTW, addSuffix: true })}
              </small>
            </div>
            <Card.Text>{comment.content}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

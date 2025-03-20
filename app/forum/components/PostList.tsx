import React from 'react';
import Link from 'next/link';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { Post } from '../hooks/useForumData';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="post-list">
      {posts.map(post => (
        <Card key={post.id} className="mb-3">
          <Card.Body>
            <Row>
              <Col md={8}>
                <Link href={`/forum/posts/${post.id}`} className="text-decoration-none">
                  <Card.Title className="mb-2 text-primary">{post.title}</Card.Title>
                </Link>
                <div className="d-flex gap-2 mb-2">
                  {post.tags?.split(',').map(tag => (
                    <Badge key={tag} bg="secondary" className="text-decoration-none">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Card.Text className="text-muted small">
                  <span className="me-2">
                    作者：{post.author_name}
                  </span>
                  <span className="me-2">
                    發布於：{formatDistanceToNow(new Date(post.created_at), { locale: zhTW, addSuffix: true })}
                  </span>
                </Card.Text>
              </Col>
              <Col md={4} className="text-end">
                <div className="d-flex justify-content-end gap-3 text-muted small">
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
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

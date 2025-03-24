import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Post } from '../hooks/useForumData';
import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="empty-state text-center py-5 my-4 bg-light rounded-3">
        <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
        <h5 className="text-muted">沒有尋找到相關文章</h5>
        <p className="text-muted">請嘗試重新搜尋</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      <Row>
        {posts.map(post => (
          <Col key={post.id} xs={12} className="mb-3">
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

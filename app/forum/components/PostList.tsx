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
        <h5 className="text-muted">没有找到相关帖子</h5>
        <p className="text-muted">请尝试使用其他关键词搜索或创建一篇新帖子</p>
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

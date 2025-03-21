'use client';

import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

interface ForumHeaderProps {
  totalPosts: number;
  totalUsers: number;
  totalCategories: number;
  onNewPostClick: () => void;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
  totalPosts,
  totalUsers,
  totalCategories,
  onNewPostClick
}) => {
  return (
    <div className="forum-header text-white p-4 mb-4">
      <Row className="align-items-center">
        <Col md={8}>
          <h1 className="fw-bold mb-2">寵物論壇</h1>
          <p className="mb-0">分享您的寵物故事、照片和經驗，與其他寵物愛好者交流。</p>
          
          <div className="d-flex mt-3">
            <div className="me-4">
              <span className="d-block fw-bold h4 mb-0">{totalPosts}</span>
              <small>文章</small>
            </div>
            <div className="me-4">
              <span className="d-block fw-bold h4 mb-0">{totalUsers}</span>
              <small>用戶</small>
            </div>
            <div>
              <span className="d-block fw-bold h4 mb-0">{totalCategories}</span>
              <small>分類</small>
            </div>
          </div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button 
            variant="light" 
            size="lg" 
            className="fw-bold text-primary shadow-sm"
            onClick={onNewPostClick}
          >
            發布新文章
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ForumHeader;

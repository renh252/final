'use client'

import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import styles from './ForumHeader.module.css'

interface ForumHeaderProps {
  totalPosts: number
  totalUsers: number
  totalCategories: number
  onNewPostClick: () => void
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
  totalPosts,
  totalUsers,
  totalCategories,
  onNewPostClick,
}) => {
  return (
    <div className={`${styles.forumHeader} text-white p-4 mb-4`}>
      <Row className="align-items-center">
        <Col md={8}>
          <h1 className="fw-bold mb-2">「毛孩之家」寵物討論區</h1>
          <p className="mb-0">
            分享您的寵物故事、照片和經驗，與其他寵物愛好者交流。
          </p>

          <div className={`d-flex mt-3 ${styles.stats}`}>
            <div className="me-4">
              <span className={`d-block ${styles.statsNumber}`}>
                {totalPosts}
              </span>
              <small className={styles.statsLabel}>文章</small>
            </div>
            <div className="me-4">
              <span className={`d-block ${styles.statsNumber}`}>
                {totalUsers}
              </span>
              <small className={styles.statsLabel}>用戶</small>
            </div>
            <div>
              <span className={`d-block ${styles.statsNumber}`}>
                {totalCategories}
              </span>
              <small className={styles.statsLabel}>分類</small>
            </div>
          </div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button
            variant="light"
            size="lg"
            className="fw-bold shadow-sm"
            style={{ color: '#C79650' }}
            onClick={onNewPostClick}
          >
            發布新文章
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default ForumHeader

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FeaturedArticles from './FeaturedArticles';
import ArticleList from './ArticleList';

export default function ForumLayout({ children }) {
  return (
    <Container>
      <h1 className="my-4">论坛</h1>
      <FeaturedArticles />
      <Row>
        <Col md={8}>
          <ArticleList />
        </Col>
        <Col md={4}>
          {/* 这里可以添加侧边栏组件,如热门标签、最新评论等 */}
          {children}
        </Col>
      </Row>
    </Container>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '../forum.module.css';

export default function FeaturedArticles() {
  const [featuredArticles, setFeaturedArticles] = useState([]);

  useEffect(() => {
    // 从API获取置顶文章数据
    const fetchFeaturedArticles = async () => {
      try {
        const response = await fetch('/api/featured-articles');
        if (!response.ok) {
          throw new Error('Failed to fetch featured articles');
        }
        const data = await response.json();
        setFeaturedArticles(data);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
        // 如果API请求失败,使用备用数据
        setFeaturedArticles([
          { id: 1, title: '置顶文章1', description: '这是置顶文章1的简介', likes: 100, comments: 50 },
          { id: 2, title: '置顶文章2', description: '这是置顶文章2的简介', likes: 80, comments: 30 },
          { id: 3, title: '置顶文章3', description: '这是置顶文章3的简介', likes: 120, comments: 70 },
        ]);
      }
    };

    fetchFeaturedArticles();
  }, []);

  return (
    <Row className="mb-4">
      {featuredArticles.map((article) => (
        <Col key={article.id} md={4} className="mb-3">
          <Card className={styles.featuredCard}>
            <Card.Body>
              <Card.Title>
                <Link href={`/forum/article/${article.id}`}>{article.title}</Link>
              </Card.Title>
              <Card.Text>{article.description}</Card.Text>
              <Card.Text>
                <small className="text-muted">
                  👍 {article.likes} 💬 {article.comments}
                </small>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
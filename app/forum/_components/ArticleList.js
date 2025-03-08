import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Pagination } from 'react-bootstrap';
import Link from 'next/link';
import styles from '../forum.module.css';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const fetchArticles = async (page) => {
    try {
      const response = await fetch(`/api/articles?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data.articles);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Row>
        {articles.map((article) => (
          <Col key={article.id} md={6} className="mb-3">
            <Card className={styles.articleCard}>
              <Card.Body>
                <Card.Title>
                  <Link href={`/forum/article/${article.id}`}>{article.title}</Link>
                </Card.Title>
                <Card.Text>{article.description}</Card.Text>
                <Card.Text>
                  <small className="text-muted">
                    作者: {article.author} | 发布时间: {new Date(article.createdAt).toLocaleDateString()}
                    <br />
                    👍 {article.likes} 💬 {article.comments}
                  </small>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination className="justify-content-center mt-4">
        {[...Array(totalPages).keys()].map((number) => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => handlePageChange(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
}
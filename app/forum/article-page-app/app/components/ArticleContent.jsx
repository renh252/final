import React from 'react';
import { Card, Button } from 'react-bootstrap';
import styles from '../styles/article.module.css';

const ArticleContent = ({ article }) => {
  return (
    <Card className={styles.articleCard}>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>{article.content}</Card.Text>
        <div className={styles.authorInfo}>
          <span>By {article.author}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        <Button variant="primary" className={styles.trackButton}>
          Track Article
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ArticleContent;
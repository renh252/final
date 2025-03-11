import React from 'react';
import { Card, Button } from 'react-bootstrap';
import styles from '../styles/article.module.css';

const ArticleCard = ({ article }) => {
  return (
    <Card className={styles.articleCard}>
      <Card.Img variant="top" src={article.image || '/images/placeholder.svg'} />
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>
          {article.excerpt}
        </Card.Text>
        <Button variant="primary" href={`/article/${article.id}`}>
          Read More
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;
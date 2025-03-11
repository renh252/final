import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/article.module.css';

const ArticleHeader = ({ title, author, date }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.meta}>
        <span className={styles.author}>By {author}</span>
        <span className={styles.date}>{date}</span>
      </div>
    </header>
  );
};

ArticleHeader.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

export default ArticleHeader;
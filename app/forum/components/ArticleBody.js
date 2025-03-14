import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../article.module.css';  // 修正路徑

const ArticleBody = ({ content }) => {
    return (
        <div className={styles.articleContent}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default ArticleBody;
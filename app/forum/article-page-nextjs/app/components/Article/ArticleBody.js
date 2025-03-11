import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../../../styles/article.module.css';

const ArticleBody = ({ content }) => {
    return (
        <div className={styles.articleBody}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default ArticleBody;
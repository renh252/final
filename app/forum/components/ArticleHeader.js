'use client';
import React from 'react';
import PropTypes from 'prop-types';

const ArticleHeader = ({ title, author, publishedAt, category }) => {
    return (
        <header className="article-header">
            <h1>{title}</h1>
            <p className="text-muted">By {author} on {new Date(publishedAt).toLocaleDateString()}</p>
            <span className="badge bg-secondary">{category}</span>
        </header>
    );
};

ArticleHeader.propTypes = {
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
};

export default ArticleHeader;
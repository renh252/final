'use client';
import React from 'react';

const ArticleFooter = () => {
    const handleLike = () => {
        // Logic for liking the article
        console.log('Article liked');
    };

    const handleBookmark = () => {
        // Logic for bookmarking the article
        console.log('Article bookmarked');
    };

    const handleShare = () => {
        // Logic for sharing the article
        console.log('Article shared');
    };

    return (
        <div className="article-footer">
            <button onClick={handleLike} className="btn btn-primary">Like</button>
            <button onClick={handleBookmark} className="btn btn-secondary">Bookmark</button>
            <button onClick={handleShare} className="btn btn-success">Share</button>
        </div>
    );
};

export default ArticleFooter;
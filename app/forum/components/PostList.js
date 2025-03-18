'use client';
import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';

const PostList = ({ articles }) => {
    const [clickedArticleId, setClickedArticleId] = useState(null);

    const handleArticleClick = (id) => {
        setClickedArticleId(id);
    };

    if (!articles || articles.length === 0) {
        return <div className="alert alert-info">沒有文章可顯示</div>;
    }

    return (
        <ListGroup className="mb-4">
            {articles.map((article) => (
                <ListGroup.Item
                    key={article.id}
                    action
                    href={`/forum/article/${article.id}`}
                    onClick={() => handleArticleClick(article.id)}
                    style={{
                        backgroundColor: clickedArticleId === article.id ? '#e7c698' : '',
                        borderColor: clickedArticleId === article.id ? '#e7c698' : '',
                    }}
                >
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{article.title}</h5>
                        <small>{article.publishDate}</small>
                    </div>
                    <p className="mb-1">{article.summary}</p>
                    <small>作者: {article.author}</small>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default PostList;
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useContext } from 'react';
import { ArticleContext } from '../context/ArticleContext';

const PostList = () => {
    const { articles } = useContext(ArticleContext);

    return (
        <ListGroup>
            {articles.map(article => (
                <ListGroup.Item key={article.id} className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5>{article.title}</h5>
                        <p>{article.summary}</p>
                        <small>作者: {article.author} | 發布時間: {new Date(article.publishedAt).toLocaleDateString()}</small>
                    </div>
                    <img src={article.thumbnail} alt={article.title} className="img-thumbnail ms-2" style={{ width: '100px' }} />
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default PostList;
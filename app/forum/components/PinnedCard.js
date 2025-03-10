import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'next/link';

const PinnedCard = ({ article }) => {
    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>
                    <Link href={`/forum/article/${article.id}`}>
                        <span className="badge bg-warning me-2">置頂</span>
                        {article.title}
                    </Link>
                </Card.Title>
                <Card.Text>
                    {article.summary}
                </Card.Text>
                <Card.Footer className="text-muted">
                    作者: {article.author} | 發布時間: {new Date(article.publishedAt).toLocaleDateString()}
                </Card.Footer>
            </Card.Body>
        </Card>
    );
};

export default PinnedCard;
'use client';
import React from 'react';
import { Card } from 'react-bootstrap';
import Link from 'next/link';

function PinnedCard({ article }) {
    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>
                    <i className="fas fa-thumbtack"></i> {article.title}
                </Card.Title>
                <Card.Text>{article.summary}</Card.Text>
                <Link href={`/forum/article/${article.id}`} className="btn btn-primary">
                    查看文章
                </Link>
            </Card.Body>
        </Card>
    );
}

export default PinnedCard;
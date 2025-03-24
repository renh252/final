'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from 'react-bootstrap';
import '../styles/custom-theme.css';

interface Tag {
  id: number;
  name: string;
  post_count: number;
}

interface TagCloudProps {
  tags: Tag[];
  title?: string;
}

export default function TagCloud({ tags, title = '熱門標籤' }: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // 根據標籤使用次數計算字體大小
  const getTagSize = (count: number): number => {
    const minSize = 0.8;
    const maxSize = 1.6;
    const minCount = Math.min(...tags.map(tag => tag.post_count));
    const maxCount = Math.max(...tags.map(tag => tag.post_count));
    
    if (minCount === maxCount) return (minSize + maxSize) / 2;
    
    const size = minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
    return Math.round(size * 100) / 100;
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header style={{ backgroundColor: '#D9B77F', borderBottom: '1px solid #C79650' }}>
        <h5 className="mb-0" style={{ color: '#FFFFFF' }}>
          <i className="bi bi-tags me-2"></i>
          {title}
        </h5>
      </Card.Header>
      <Card.Body className="tag-cloud">
        {tags.length === 0 ? (
          <p className="text-muted mb-0">尚無標籤</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link 
                href={`/forum?tags=${tag.name}`} 
                key={tag.id}
                className="badge rounded-pill text-decoration-none"
                style={{ 
                  fontSize: `${getTagSize(tag.post_count)}rem`,
                  backgroundColor: '#C79650',
                  color: 'white',
                  padding: '0.4em 0.8em',
                  transition: 'all 0.2s ease'
                }}
              >
                #{tag.name} <span className="ms-1">{tag.post_count}</span>
              </Link>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

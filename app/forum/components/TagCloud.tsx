'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from 'react-bootstrap';
import { Tag } from '../hooks/useForumData';

interface TagCloudProps {
  tags: Tag[];
  title?: string;
}

export default function TagCloud({ tags, title = '熱門標籤' }: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Sort tags by post count
  const sortedTags = [...tags].sort((a, b) => b.post_count - a.post_count);
  
  return (
    <Card className="tag-cloud mb-4 shadow-sm">
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0">
          <i className="bi bi-tags me-2"></i>
          {title}
        </h5>
      </Card.Header>
      <Card.Body className="p-3">
        <div className="d-flex flex-wrap gap-2">
          {sortedTags.map(tag => {
            // Calculate font size based on post count (min: 0.8rem, max: 1.2rem)
            const fontSize = 0.8 + Math.min(0.4, (tag.post_count / Math.max(...sortedTags.map(t => t.post_count))) * 0.4);
            
            return (
              <Link 
                href={`/forum?tags=${tag.name}`} 
                key={tag.id} 
                className="tag-item text-decoration-none px-2 py-1 rounded-pill bg-light text-secondary hover-bg-secondary hover-text-white transition-all"
                style={{ fontSize: `${fontSize}rem` }}
              >
                #{tag.name}
                <span className="ms-1 small">({tag.post_count})</span>
              </Link>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}

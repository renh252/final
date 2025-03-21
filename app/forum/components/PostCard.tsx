'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Post } from '../hooks/useForumData';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const tags = post.tags?.split(',').filter(Boolean) || [];
  
  return (
    <div className="post-card bg-white rounded-3 shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <div className="avatar-container me-2">
              {post.author_avatar ? (
                <Image 
                  src={post.author_avatar} 
                  alt={post.author_name} 
                  width={40} 
                  height={40} 
                  className="rounded-circle"
                />
              ) : (
                <div className="avatar-placeholder rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                  {post.author_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <div className="fw-bold">{post.author_name}</div>
              <div className="text-muted small">
                {formatDistanceToNow(new Date(post.created_at), { locale: zhTW, addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="category-badge px-2 py-1 rounded-pill bg-light-primary text-primary small">
            {post.category_name}
          </div>
        </div>
        
        <Link href={`/forum/posts/${post.id}`} className="text-decoration-none">
          <h5 className="post-title fw-bold text-dark mb-2 hover-text-primary transition-all">
            {post.title}
          </h5>
        </Link>
        
        <div className="post-content text-secondary mb-3">
          {post.content.length > 150 
            ? `${post.content.substring(0, 150)}...` 
            : post.content}
        </div>
        
        {tags.length > 0 && (
          <div className="post-tags d-flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <Link 
                href={`/forum?tags=${tag}`} 
                key={tag} 
                className="tag-badge text-decoration-none px-2 py-1 rounded-pill bg-light text-secondary small hover-bg-secondary hover-text-white transition-all"
              >
                #{tag.trim()}
              </Link>
            ))}
          </div>
        )}
        
        <div className="post-stats d-flex justify-content-between align-items-center pt-3 border-top">
          <div className="d-flex gap-3">
            <div className="stat-item d-flex align-items-center text-muted">
              <i className="bi bi-eye me-1"></i>
              <span>{post.view_count || 0}</span>
            </div>
            <div className="stat-item d-flex align-items-center text-muted">
              <i className="bi bi-chat-dots me-1"></i>
              <span>{post.comment_count || 0}</span>
            </div>
            <div className="stat-item d-flex align-items-center text-muted">
              <i className="bi bi-heart me-1"></i>
              <span>{post.like_count || 0}</span>
            </div>
          </div>
          <Link 
            href={`/forum/posts/${post.id}`} 
            className="read-more-link text-decoration-none text-primary small"
          >
            閱讀全文 <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

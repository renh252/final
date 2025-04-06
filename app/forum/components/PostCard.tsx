'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Post } from '../hooks/useForumData'
import styles from './PostCard.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const tags = post.tags?.split(',').filter(Boolean) || []

  return (
    <div className={styles.postCard}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <div className={styles.authorInfo}>
            <div className={styles.avatarContainer}>
              {post.author_avatar ? (
                <Image
                  src={post.author_avatar}
                  alt={post.author_name}
                  fill
                  className={styles.postImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {post.author_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <div className={styles.authorName}>{post.author_name}</div>
              <div className={styles.postTime}>
                {formatDistanceToNow(new Date(post.created_at), {
                  locale: zhTW,
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
          <div className={styles.categoryBadge}>
            {post.category_name}
          </div>
        </div>

        <Link href={`/forum/posts/${post.id}`} className="text-decoration-none">
          <h2 className={styles.postTitle}>
            {post.title}
          </h2>
        </Link>

        {post.image_url && (
          <div className={styles.imageContainer}>
            <Link href={`/forum/posts/${post.id}`}>
              <Image 
                src={post.image_url} 
                alt={post.title}
                fill
                className={styles.postImage}
              />
            </Link>
          </div>
        )}

        <div className={styles.postContent}>
          {post.content.length > 150
            ? `${post.content.substring(0, 150)}...`
            : post.content}
        </div>

        {tags.length > 0 && (
          <div className={styles.tagContainer}>
            {tags.map((tag) => (
              <Link
                href={`/forum?tags=${tag}`}
                key={tag}
                className={styles.tagBadge}
              >
                #{tag.trim()}
              </Link>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <i className={`bi bi-eye-fill ${styles.statIcon}`}></i>
              <span>{post.view_count || 0}</span>
            </div>
            <div className={styles.statItem}>
              <i className={`bi bi-chat-dots-fill ${styles.statIcon}`}></i>
              <span>{post.comment_count || 0}</span>
            </div>
            <div className={styles.statItem}>
              <i className={`bi bi-heart-fill ${styles.statIcon}`}></i>
              <span>{post.like_count || 0}</span>
            </div>
          </div>
          <Link
            href={`/forum/posts/${post.id}`}
            className={styles.readMore}
          >
            查看更多 <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}

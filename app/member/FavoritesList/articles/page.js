'use client'

import React, { useState, useEffect } from 'react'
import { usePageTitle } from '@/app/context/TitleContext'
import Link from 'next/link'
import { BsHeartFill } from 'react-icons/bs'

export default function ArticleLikePage(props) {
  usePageTitle('收藏文章')
  const [favoriteArticles, setFavoriteArticles] = useState([
    {
      id: 10,
      title: '如何訓練你的鸚鵡：建立良好互動關係的秘訣',
      content: '鸚鵡是聰明又可愛的寵物，但訓練牠們需要耐心和技巧。這篇文章將分享鸚鵡訓練的方法，幫助你和你的鸚鵡建立良好的互動關係！ 1. 訓練前的準備：建立信任關係： 在訓練前，先和鸚鵡建立信任關係，讓牠們感到安心和舒適。',
      username: '寵物專家',
      created_at: '2025-04-05T11:05:58.000Z'
    }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 模擬 API 載入
    setLoading(false)
  }, [])

  const handleRemoveFavorite = async (postId) => {
    try {
      const response = await fetch('/api/forum/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          action: 'remove'
        }),
      })

      if (response.ok) {
        setFavoriteArticles(prev => prev.filter(article => article.id !== postId))
      } else {
        throw new Error('Failed to remove favorite')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('取消收藏失敗，請稍後再試')
    }
  }

  if (loading) return <div className="p-4">載入中...</div>
  if (error) return <div className="p-4 text-danger">{error}</div>

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">收藏文章</h1>
      {favoriteArticles.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">還沒有收藏任何文章</p>
        </div>
      ) : (
        <div className="row g-4">
          {favoriteArticles.map(article => (
            <div key={article.id} className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-2">
                        <Link href={`/forum/posts/${article.id}`} className="text-decoration-none text-dark">
                          {article.title}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small mb-2">
                        {article.username} • 
                        {new Date(article.created_at).toLocaleDateString('zh-TW')}
                      </p>
                      <p className="card-text mb-3">{article.content.length > 100 ? `${article.content.slice(0, 100)}...` : article.content}</p>
                      <Link href={`/forum/posts/${article.id}`} className="btn btn-outline-primary btn-sm">
                        查看原文
                      </Link>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(article.id)}
                      className="btn btn-link text-danger"
                      title="取消收藏"
                    >
                      <BsHeartFill size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CreatePostForm from '@/app/forum/components/Editor/CreatePostForm'

export default function CreatePostPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 檢查用戶是否已登入
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include',
        })
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          // 未登入時重定向到登入頁
          router.push('/login?redirect=/forum/create')
        }
      } catch (error) {
        console.error('身份驗證檢查失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">請先登入才能發佈文章</div>
      </div>
    )
  }

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0 fs-4">發佈新文章</h2>
            </div>
            <div className="card-body">
              <CreatePostForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

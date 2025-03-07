"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Chat, EmojiSmile, ArrowLeft } from "react-bootstrap-icons"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"

export default function ArticleDetail({ id }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/forum/article/${id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch article")
        }
        const data = await res.json()
        setArticle(data)
        setLoading(false)
      } catch (err) {
        setError("Error loading article. Please try again later.")
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!article) {
    return <ErrorMessage message="Article not found" />
  }

  return (
    <div className="container py-4">
      <Link href="/forum/list" className="btn btn-outline-secondary mb-4">
        <ArrowLeft size={18} className="me-1" /> Back to forum
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h1 className="mb-3">{article.title}</h1>

          <div className="d-flex align-items-center mb-4">
            <Image
              src={article.author.avatar || "/placeholder.svg?height=48&width=48"}
              alt={article.author.name}
              width={48}
              height={48}
              className="rounded-circle me-2"
            />
            <div>
              <div className="fw-bold">{article.author.name}</div>
              <div className="text-muted small">{article.publishedAt}</div>
            </div>
          </div>

          {article.image && (
            <div className="mb-4 position-relative" style={{ height: "400px" }}>
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-fit-cover rounded"
              />
            </div>
          )}

          <div className="mb-4">{article.content}</div>

          <div className="d-flex gap-3">
            <button className="btn btn-outline-danger">
              <Heart className="me-1" /> {article.likes}
            </button>
            <button className="btn btn-outline-primary">
              <Chat className="me-1" /> {article.comments}
            </button>
            <button className="btn btn-outline-warning">
              <EmojiSmile className="me-1" /> {article.reactions}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


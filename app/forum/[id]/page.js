import { Suspense } from "react"
import ArticleDetail from "../_components/ArticleDetail"
import LoadingSpinner from "../_components/LoadingSpinner"

export async function generateMetadata({ params }) {
  const article = await getArticleData(params.id)

  return {
    title: article.title,
    description: article.summary,
  }
}

async function getArticleData(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/forum/article/${id}`)

  if (!res.ok) {
    throw new Error("Failed to fetch article")
  }

  return res.json()
}

export default function ArticlePage({ params }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ArticleDetail id={params.id} />
    </Suspense>
  )
}


import Link from "next/link"
import { Heart, Chat } from "react-bootstrap-icons"

export default function FeaturedArticles({ articles = [] }) {
  if (articles.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <h2 className="mb-3">
        <span className="text-warning">●</span> 置頂文章
      </h2>
      <div className="row">
        {articles.map((article) => (
          <div className="col-md-6 col-lg-4 mb-3" key={article.id}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-2">
                  <Link href={`/forum/${article.id}`} className="text-decoration-none text-dark stretched-link">
                    {article.title}
                  </Link>
                </h5>
                <p className="card-text text-muted mb-3">{article.summary}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <button className="btn btn-sm btn-outline-danger me-2 border-0">
                      <Heart /> <span>{article.likes}</span>
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-2 border-0">
                      <Chat /> <span>{article.comments}</span>
                    </button>
                  </div>
                  <small className="text-muted">{article.publishedAt}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


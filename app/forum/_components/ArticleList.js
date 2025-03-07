import Link from "next/link"
import Image from "next/image"
import { Heart, Chat, EmojiSmile } from "react-bootstrap-icons"

export default function ArticleList({ articles = [] }) {
  if (articles.length === 0) {
    return <div className="alert alert-info">No articles found.</div>
  }

  return (
    <div className="mb-4">
      {articles.map((article) => (
        <div key={article.id} className="card mb-3 border-0 shadow-sm">
          <div className="card-body">
            <div className="row">
              <div className={`col-${article.image ? "9" : "12"}`}>
                <h5 className="card-title mb-2">
                  <Link href={`/forum/${article.id}`} className="text-decoration-none text-dark">
                    {article.title}
                  </Link>
                </h5>

                <div className="d-flex align-items-center mb-2">
                  <Image
                    src={article.author.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={article.author.name}
                    width={32}
                    height={32}
                    className="rounded-circle me-2"
                  />
                  <span className="me-2">{article.author.name}</span>
                  <small className="text-muted">{article.publishedAt}</small>
                </div>

                <p className="card-text text-muted">{article.summary}</p>

                <div className="d-flex align-items-center">
                  <button className="btn btn-sm btn-outline-danger me-2 border-0">
                    <Heart /> <span>{article.likes}</span>
                  </button>
                  <button className="btn btn-sm btn-outline-primary me-2 border-0">
                    <Chat /> <span>{article.comments}</span>
                  </button>
                  <button className="btn btn-sm btn-outline-warning border-0">
                    <EmojiSmile /> <span>{article.reactions}</span>
                  </button>
                </div>
              </div>

              {article.image && (
                <div className="col-3">
                  <div className="position-relative h-100 min-height-100">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-fit-cover rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


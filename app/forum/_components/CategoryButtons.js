"use client"

export default function CategoryButtons({ selectedCategory, onCategoryChange }) {
  const categories = [
    { id: "all", name: "所有分類" },
    { id: "health", name: "貓咪健康" },
    { id: "food", name: "貓下肚子" },
    { id: "lifestyle", name: "居住分享" },
    { id: "pet-stores", name: "店家推薦" },
  ]

  return (
    <div className="d-flex justify-content-center mt-3 mb-4">
      <div className="btn-group">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`btn ${selectedCategory === category.id ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}


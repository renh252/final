// FILEPATH: c:/Users/Martin/Desktop/final/app/forum/_components/CategoryButtons.js

"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ButtonGroup, Button } from 'react-bootstrap'

const categories = [
  { id: "category-1", name: "版主公告" },
  { id: "category-2", name: "寵物健康" },
  { id: "category-3", name: "飼養分享" },
  { id: "category-4", name: "感想分享" },
  { id: "category-5", name: "綜合討論" },
]

export default function CategoryButtons() {
  const [activeCategory, setActiveCategory] = useState(null)
  const router = useRouter()

  const handleCategoryClick = (categoryId, categoryName) => {
    setActiveCategory(categoryId)
    router.push(`?category=${encodeURIComponent(categoryName)}`)
  }

  return (
    <ButtonGroup className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "primary" : "outline-primary"}
          className="rounded-pill"
          onClick={() => handleCategoryClick(category.id, category.name)}
        >
          {category.name}
        </Button>
      ))}
    </ButtonGroup>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Carousel } from "react-bootstrap"

export default function ArticleCarousel({ articles = [] }) {
  const [index, setIndex] = useState(0)

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <Carousel activeIndex={index} onSelect={handleSelect} className="carousel-dark">
        {articles.map((article) => (
          <Carousel.Item key={article.id}>
            <div className="position-relative" style={{ height: "300px" }}>
              <Image
                src={article.image || "/placeholder.svg?height=300&width=800"}
                alt={article.title}
                fill
                className="object-fit-cover"
                priority
              />
              <Carousel.Caption>
                <Link href={`/forum/${article.id}`} className="text-decoration-none">
                  <h3 className="bg-white bg-opacity-75 text-dark p-2 rounded">{article.title}</h3>
                </Link>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}


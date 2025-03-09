// FILEPATH: c:/Users/Martin/Desktop/final/app/forum/_components/Carousel.js

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Carousel } from "react-bootstrap"
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons"

const ArticleCarousel = ({ articles }) => {
  const [index, setIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  const pauseAutoPlay = () => setIsAutoPlaying(false)
  const resumeAutoPlay = () => setIsAutoPlaying(true)

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setIndex((prevIndex) => (prevIndex === articles.length - 1 ? 0 : prevIndex + 1))
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, articles.length])

  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <Carousel
      activeIndex={index}
      onSelect={handleSelect}
      prevIcon={<ChevronLeft size={24} />}
      nextIcon={<ChevronRight size={24} />}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      className="relative h-[400px] rounded-lg overflow-hidden"
    >
      {articles.map((article, idx) => (
        <Carousel.Item key={article.id || idx} className="h-[400px]">
          <Link href={`/article/${article.id}`} passHref>
            <a className="block h-full">
              <Image
                src={article.image}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                priority={idx === 0}
              />
              <Carousel.Caption className="bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white text-xl font-bold">{article.title}</h3>
              </Carousel.Caption>
            </a>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default ArticleCarousel
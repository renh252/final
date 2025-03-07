"use client"

import { useState, useEffect } from "react"
import ArticleCarousel from "./ArticleCarousel"
import CategoryButtons from "./CategoryButtons"
import Navigation from "./Navigation"
import SearchBox from "./SearchBox"
import FeaturedArticles from "./FeaturedArticles"
import ArticleList from "./ArticleList"
import Pagination from "./Pagination"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"

export default function ForumListingPage() {
  const [articles, setArticles] = useState([])
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [carouselArticles, setCarouselArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeNavItem, setActiveNavItem] = useState("popular")

  useEffect(() => {
    fetchData()
  }, [currentPage, selectedCategory, activeNavItem])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch carousel articles
      const carouselRes = await fetch("/api/forum/carousel")
      const carouselData = await carouselRes.json()
      setCarouselArticles(carouselData.articles)

      // Fetch featured articles
      const featuredRes = await fetch("/api/forum/featured")
      const featuredData = await featuredRes.json()
      setFeaturedArticles(featuredData.articles)

      // Fetch articles based on page, category and active nav
      const articlesRes = await fetch(
        `/api/forum/list?page=${currentPage}&category=${selectedCategory}&sort=${activeNavItem}`,
      )
      const articlesData = await articlesRes.json()
      setArticles(articlesData.articles)
      setTotalPages(articlesData.pagination.totalPages)

      setLoading(false)
    } catch (err) {
      setError("Error fetching forum data. Please try again later.")
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleNavChange = (navItem) => {
    setActiveNavItem(navItem)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = async (query) => {
    setLoading(true)
    try {
      const searchRes = await fetch(`/api/forum/search?q=${query}`)
      const searchData = await searchRes.json()
      setArticles(searchData.articles)
      setTotalPages(searchData.pagination.totalPages)
      setCurrentPage(1)
      setLoading(false)
    } catch (err) {
      setError("Error searching forum. Please try again later.")
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <ArticleCarousel articles={carouselArticles} />

      <CategoryButtons selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

      <div className="row mt-4 mb-3">
        <div className="col-md-6">
          <Navigation activeItem={activeNavItem} onNavChange={handleNavChange} />
        </div>
        <div className="col-md-6">
          <SearchBox onSearch={handleSearch} />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <FeaturedArticles articles={featuredArticles} />
          <ArticleList articles={articles} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}


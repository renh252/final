'use client'
import React, { useEffect, useState } from 'react'
import Carousel from './components/Carousel'
import ButtonGroup from './components/ButtonGroup'
import NavTabs from './components/NavTabs'
import SearchBox from './components/SearchBox'
import PinnedCard from './components/PinnedCard'
import PostList from './components/PostList'
import Pagination from './components/Pagination'
import Loading from './app/loading'
import { ArticleProvider } from './context/ArticleContext'
import CreatePostButton from './components/CreatePostButton'

const ForumPage = () => {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [pinnedArticles, setPinnedArticles] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5)

  // 模擬輪播文章數據
  const mockFeaturedArticles = [
    {
      id: 'f1',
      title: '新手養貓必看：如何打造貓咪友善的居家環境',
      imageUrl:
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=2060&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      author: '貓咪愛好者',
      date: '2025-03-15',
      excerpt: '貓咪初次到家時，正確的環境準備能夠幫助牠們快速適應新家...',
      likes: 342,
      comments: 87,
    },
    {
      id: 'f2',
      title: '狗狗健康飲食指南：哪些食物絕對不能餵',
      imageUrl:
        'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      author: '寵物營養師',
      date: '2025-03-14',
      excerpt:
        '雖然狗狗總是眼巴巴地看著你的食物，但某些人類食物對狗狗有致命危險...',
      likes: 287,
      comments: 63,
    },
    {
      id: 'f3',
      title: '寵物行為解析：當你的兔子這樣做時，牠在想什麼？',
      imageUrl:
        'https://images.unsplash.com/photo-1609791636587-50feca5caee7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      author: '小動物行為專家',
      date: '2025-03-12',
      excerpt:
        '每個兔子主人都應該了解這些常見行為背後的含義，以建立更好的互動關係...',
      likes: 248,
      comments: 42,
    },
  ]

  // 模擬置頂文章數據
  const mockPinnedArticles = [
    {
      id: 'p1',
      title: '【重要公告】論壇使用規則更新',
      author: '系統管理員',
      date: '2025-03-16',
      isPinned: true,
      likes: 123,
      comments: 45,
      excerpt:
        '親愛的會員，我們更新了論壇使用規則，請務必閱讀以確保您的發言符合社區準則。',
    },
    {
      id: 'p2',
      title: '【資源整理】寵物急救知識大全',
      author: '寵物醫生',
      date: '2025-03-14',
      isPinned: true,
      likes: 457,
      comments: 67,
      excerpt: '本文整理了各種常見的寵物緊急情況與基本處理方法，建議收藏備用。',
    },
  ]

  // 模擬普通文章列表
  const mockArticles = [
    {
      id: '1',
      title: '新手養貓須知：如何選擇適合的貓糧',
      author: '貓咪達人',
      date: '2025-03-17',
      category: '貓咪飼養',
      likes: 156,
      comments: 42,
      excerpt:
        '選擇正確的貓糧對貓咪健康至關重要。本文將從營養需求、年齡階段等多角度分析如何為您的愛貓挑選合適的食物。',
    },
    {
      id: '2',
      title: '狗狗訓練技巧：如何教會狗狗基本指令',
      author: '寵物訓練師',
      date: '2025-03-16',
      category: '狗狗訓練',
      likes: 203,
      comments: 53,
      excerpt:
        '透過正確的獎勵機制和持續練習，可以有效地教會狗狗坐下、握手等基本指令，建立良好的溝通基礎。',
    },
    {
      id: '3',
      title: '寵物鳥的家居環境布置指南',
      author: '鳥類愛好者',
      date: '2025-03-15',
      category: '鳥類寵物',
      likes: 89,
      comments: 17,
      excerpt:
        '鳥籠的選擇、玩具的擺放、安全隱患的排除...這些都是讓您的寵物鳥健康快樂生活的關鍵。',
    },
    {
      id: '4',
      title: '兔子飼養小秘訣：新手常見問題解答',
      author: '兔子專家',
      date: '2025-03-14',
      category: '小寵飼養',
      likes: 142,
      comments: 35,
      excerpt:
        '飼養兔子看似簡單，但有許多細節需要注意。本文整理了新手飼養兔子時最常遇到的問題和解決方法。',
    },
    {
      id: '5',
      title: '寵物魚缸保養全攻略：如何維持水質穩定',
      author: '水族達人',
      date: '2025-03-13',
      category: '水族寵物',
      likes: 76,
      comments: 24,
      excerpt:
        '良好的水質是魚缸生態系統的基礎。本文分享專業的水質管理和定期保養方法，讓您的水族箱常保清澈健康。',
    },
    {
      id: '6',
      title: '多貓家庭和平共處的秘訣',
      author: '貓行為學家',
      date: '2025-03-12',
      category: '貓咪行為',
      likes: 187,
      comments: 63,
      excerpt:
        '當家裡有多隻貓咪時，如何避免領地衝突、建立和諧的貓咪社會結構？本文提供實用建議。',
    },
    {
      id: '7',
      title: '老年犬照顧指南：讓牠們優雅地變老',
      author: '資深獸醫',
      date: '2025-03-11',
      category: '狗狗健康',
      likes: 231,
      comments: 47,
      excerpt:
        '狗狗進入老年階段後，飲食、運動和醫療照顧都需要調整。本文幫助您理解老年犬的特殊需求。',
    },
    {
      id: '8',
      title: '倉鼠居住環境大改造：從基礎到進階',
      author: '小寵專家',
      date: '2025-03-10',
      category: '小寵飼養',
      likes: 94,
      comments: 28,
      excerpt:
        '一個好的倉鼠籠不只是睡覺的地方，更是遊樂場和探險天地。本文教您打造理想的倉鼠居住環境。',
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 嘗試從API獲取數據
        const [featuredRes, pinnedRes, articlesRes] = await Promise.all([
          fetch('/api/forum/featured').catch(() => null),
          fetch('/api/forum/list?page=1').catch(() => null),
          fetch('/api/forum/list?page=1').catch(() => null),
        ])

        if (featuredRes && featuredRes.ok) {
          const featuredData = await featuredRes.json()
          setFeaturedArticles(featuredData)
        } else {
          // 使用模擬數據
          setFeaturedArticles(mockFeaturedArticles)
        }

        if (pinnedRes && pinnedRes.ok) {
          const pinnedData = await pinnedRes.json()
          setPinnedArticles(pinnedData)
        } else {
          // 使用模擬數據
          setPinnedArticles(mockPinnedArticles)
        }

        if (articlesRes && articlesRes.ok) {
          const articlesData = await articlesRes.json()
          setArticles(articlesData.articles)
          setTotalPages(articlesData.totalPages)
        } else {
          // 使用模擬數據
          setArticles(mockArticles)
          setTotalPages(5) // 假設共有5頁
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // 發生錯誤時使用模擬數據
        setFeaturedArticles(mockFeaturedArticles)
        setPinnedArticles(mockPinnedArticles)
        setArticles(mockArticles)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePageChange = async (page) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/forum/list?page=${page}`)
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles)
      } else {
        // 使用模擬分頁數據 - 可根據頁碼篩選模擬文章
        const startIndex = ((page - 1) * 8) % mockArticles.length
        const paginatedArticles = [
          ...mockArticles.slice(startIndex),
          ...mockArticles.slice(0, startIndex),
        ].slice(0, 8)
        setArticles(paginatedArticles)
      }
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching data:', error)
      // 使用模擬分頁數據
      const startIndex = ((page - 1) * 8) % mockArticles.length
      const paginatedArticles = [
        ...mockArticles.slice(startIndex),
        ...mockArticles.slice(0, startIndex),
      ].slice(0, 8)
      setArticles(paginatedArticles)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <ArticleProvider>
      <div className="container">
        <Carousel items={featuredArticles} />
        <ButtonGroup />
        <div className="d-flex justify-content-between align-items-center my-3">
          <NavTabs />
          <div className="d-flex align-items-center gap-2">
            <CreatePostButton />
            <SearchBox />
          </div>
        </div>
        <div className="pinned-articles">
          {pinnedArticles.map((article) => (
            <PinnedCard key={article.id} article={article} />
          ))}
        </div>
        <PostList articles={articles} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </ArticleProvider>
  )
}

export default ForumPage

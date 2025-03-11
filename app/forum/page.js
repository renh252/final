'use client';
import React, { useEffect, useState } from 'react';
import Carousel from './components/Carousel';
import ButtonGroup from './components/ButtonGroup';
import NavTabs from './components/NavTabs';
import SearchBox from './components/SearchBox';
import PinnedCard from './components/PinnedCard';
import PostList from './components/PostList';
import Pagination from './components/Pagination';
import Loading from './app/loading';
import { ArticleProvider } from './context/ArticleContext';

const ForumPage = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [pinnedArticles, setPinnedArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, pinnedRes, articlesRes] = await Promise.all([
          fetch('/api/forum/featured/route'),
          fetch('/api/forum/list/route?page=1'),
          fetch('/api/forum/list/route?page=1')
        ]);

        const featuredData = await featuredRes.json();
        const pinnedData = await pinnedRes.json();
        const articlesData = await articlesRes.json();

        setFeaturedArticles(featuredData);
        setPinnedArticles(pinnedData);
        setArticles(articlesData.articles);
        setTotalPages(articlesData.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/list/route?page=${page}`);
      const data = await res.json();
      setArticles(data.articles);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ArticleProvider>
      <div className="container">
        <Carousel items={featuredArticles} />
        <ButtonGroup />
        <div className="d-flex justify-content-between align-items-center my-3">
          <NavTabs />
          <SearchBox />
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
  );
};

export default ForumPage;
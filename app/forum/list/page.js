import React from 'react';
import Head from 'next/head';
import ArticleCarousel from '../_components/ArticleCarousel';
import CategoryButtons from '../_components/CategoryButtons';
import Navigation from '../_components/Navigation';
import SearchBox from '../_components/SearchBox';
import FeaturedArticles from '../_components/FeaturedArticles';
import ArticleList from '../_components/ArticleList';
import Pagination from '../_components/Pagination';
import styles from '../forum.module.css';

export default function ForumListPage() {
  return (
    <>
      <Head>
        <title>寵物論壇網站</title>
        <meta name="description" content="寵物論壇網站" />
      </Head>
      <div className="container mt-4">
        <Navigation />
        <SearchBox />
        <ArticleCarousel />
        <CategoryButtons />
        <FeaturedArticles />
        <ArticleList />
        <Pagination />
      </div>
    </>
  );
}
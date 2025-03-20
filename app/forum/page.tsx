'use client';

import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import CreatePostModal from './components/CreatePostModal';
import PostList from './components/PostList';
import PostFilter from './components/PostFilter';
import { useForumData } from './hooks/useForumData';

export default function ForumPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'hot'>('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const { categories, posts, pagination, loading, refetch } = useForumData({
    category: selectedCategory,
    sort: sortBy,
    search: searchTerm,
    page: currentPage,
    limit: 10
  });

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        const response = await fetch('/api/forum/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: selectedCategory,
            sort: sortBy,
            search: searchTerm,
            page: currentPage,
            limit: 10
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '論壇資料載入失敗');
        }
        const data = await response.json();
        // Update state with fetched data
      } catch (err) {
        console.error('Error fetching forum data:', err);
        setError(err.message);
      }
    };

    fetchForumData();
  }, [selectedCategory, sortBy, searchTerm, currentPage]);

  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>論壇討論區</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          發表新文章
        </Button>
      </div>

      <PostFilter
        categories={categories}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        searchTerm={searchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onSearchChange={setSearchTerm}
      />

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <PostList posts={posts} />
          
          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button
                variant="outline-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                上一頁
              </Button>
              <Button
                variant="outline-primary"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                下一頁
              </Button>
            </div>
          )}
        </>
      )}

      <CreatePostModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          refetch();
        }}
        categories={categories}
      />
    </Container>
  );
}

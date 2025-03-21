'use client';

import React, { useState, ReactNode } from 'react';
import { Container, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'next/navigation';
import PostList from './components/PostList';
import PostFilter from './components/PostFilter';
import CreatePostModal from './components/CreatePostModal';
import ForumHeader from './components/ForumHeader';
import TagCloud from './components/TagCloud';
import { useForumData } from './hooks/useForumData';

export default function ForumPage() {
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'latest' | 'hot'>(searchParams.get('sort') as 'latest' | 'hot' || 'latest');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const { 
    categories, 
    posts, 
    pagination, 
    loading, 
    error, 
    refetch,
    tags,
    stats 
  } = useForumData({
    category: selectedCategory,
    sort: sortBy,
    search: searchTerm,
    page: currentPage,
    limit: 10
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'latest' | 'hot') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  // Generate pagination items
  const paginationItems: ReactNode[] = [];
  if (pagination.totalPages > 1) {
    // Always show first page
    paginationItems.push(
      <Pagination.Item 
        key={1} 
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      paginationItems.push(<Pagination.Ellipsis key="ellipsis1" />);
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(pagination.totalPages - 1, currentPage + 1); i++) {
      paginationItems.push(
        <Pagination.Item 
          key={i} 
          active={currentPage === i}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Add ellipsis if needed
    if (currentPage < pagination.totalPages - 2) {
      paginationItems.push(<Pagination.Ellipsis key="ellipsis2" />);
    }

    // Always show last page
    if (pagination.totalPages > 1) {
      paginationItems.push(
        <Pagination.Item 
          key={pagination.totalPages} 
          active={currentPage === pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
        >
          {pagination.totalPages}
        </Pagination.Item>
      );
    }
  }

  return (
    <div className="forum-page py-4">
      <Container>
        <ForumHeader 
          totalPosts={stats.totalPosts}
          totalUsers={stats.totalUsers}
          totalCategories={stats.totalCategories}
          onNewPostClick={() => setShowCreateModal(true)}
        />

        <Row>
          <Col md={8}>
            <PostFilter
              categories={categories}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              searchTerm={searchTerm}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
            />

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">載入中...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <>
                <PostList posts={posts} />
                
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {paginationItems}
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
          
          <Col md={4}>
            <TagCloud tags={tags} />
            
            <div className="forum-info card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  論壇資訊
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  歡迎來到寵物論壇！這裡是分享您寵物生活的地方。請遵守社區規則，尊重他人。
                </p>
                <div className="forum-rules">
                  <h6 className="fw-bold">論壇規則：</h6>
                  <ul className="ps-3 mb-0">
                    <li>尊重所有用戶</li>
                    <li>不要發布垃圾內容</li>
                    <li>分享有價值的寵物資訊</li>
                    <li>使用適當的標籤分類您的帖子</li>
                  </ul>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <CreatePostModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
        categories={categories}
      />
    </div>
  );
}

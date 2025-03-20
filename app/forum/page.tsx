'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'next/image';
import CreatePostModal from './components/CreatePostModal';
import { useForumData, ForumFilters } from './hooks/useForumData';
import styles from './styles.module.css';

// 輪播圖資料
const carouselItems = [
  {
    id: 1,
    image: '/images/forum/banner1.jpg',
    caption: '布偶貓新手指南，從挑貓到日常照護，打造貓皇的幸福生活！'
  },
  // 其他輪播項目...
];

export default function ForumPage() {
  const {
    categories,
    tags,
    posts,
    pagination,
    loading,
    error,
    fetchPosts
  } = useForumData();

  const [filters, setFilters] = useState<ForumFilters>({
    category: 'all',
    tags: [],
    sort: 'latest',
    search: '',
    page: 1,
    limit: 10
  });

  const [showCreatePost, setShowCreatePost] = useState(false);

  // 處理分類變更
  const handleCategoryChange = useCallback((categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      category: categorySlug,
      page: 1 // 重置頁碼
    }));
  }, []);

  // 處理標籤選擇
  const handleTagSelect = useCallback((tagSlug: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tagSlug)
        ? prev.tags.filter(t => t !== tagSlug)
        : [...(prev.tags || []), tagSlug],
      page: 1 // 重置頁碼
    }));
  }, []);

  // 處理排序變更
  const handleSortChange = useCallback((sort: 'latest' | 'hot') => {
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1 // 重置頁碼
    }));
  }, []);

  // 處理搜尋
  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({
      ...prev,
      search,
      page: 1 // 重置頁碼
    }));
  }, []);

  // 處理分頁
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  // 監聽篩選條件變更，重新獲取文章
  useEffect(() => {
    fetchPosts(filters);
  }, [filters, fetchPosts]);

  return (
    <Container fluid className={styles['forum-container']}>
      {/* 輪播圖區域 */}
      <Carousel className={styles['forum-carousel']}>
        {carouselItems.map((item) => (
          <Carousel.Item key={item.id}>
            <div className={styles['carousel-image-container']}>
              <Image
                src={item.image}
                alt={item.caption}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority
              />
            </div>
            <Carousel.Caption>
              <p>{item.caption}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* 分類選單 */}
      <div className={styles['category-menu']}>
        <Row className="g-2 mb-3">
          <Col>
            <Button
              variant={filters.category === 'all' ? 'primary' : 'outline-primary'}
              className="w-100"
              onClick={() => handleCategoryChange('all')}
            >
              全部分類
            </Button>
          </Col>
          {categories.map((category) => (
            <Col key={category.id}>
              <Button
                variant={filters.category === category.slug ? 'primary' : 'outline-primary'}
                className="w-100"
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
              </Button>
            </Col>
          ))}
        </Row>

        {/* 標籤選擇區 */}
        <div className={styles['tags-container']}>
          <h6 className="mb-2">熱門標籤</h6>
          <div className="d-flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant={filters.tags?.includes(tag.slug) ? 'secondary' : 'outline-secondary'}
                size="sm"
                onClick={() => handleTagSelect(tag.slug)}
                className={styles['tag-button']}
              >
                #{tag.name}
                <span className="ms-1 opacity-75">({tag.post_count})</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 功能列 */}
      <Row className={styles['function-row']}>
        <Col md={6}>
          <div className="d-flex gap-2">
            <Button
              variant={filters.sort === 'hot' ? 'primary' : 'outline-primary'}
              onClick={() => handleSortChange('hot')}
            >
              熱門
            </Button>
            <Button
              variant={filters.sort === 'latest' ? 'primary' : 'outline-primary'}
              onClick={() => handleSortChange('latest')}
            >
              最新
            </Button>
          </div>
        </Col>
        <Col md={6} className="d-flex justify-content-end gap-2">
          <Form.Control
            type="search"
            placeholder="搜尋文章..."
            className={styles['search-box']}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button variant="primary" onClick={() => setShowCreatePost(true)}>
            <Plus className="me-1" size={18} />
            發文
          </Button>
        </Col>
      </Row>

      {/* 文章列表 */}
      {loading.posts ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <div className="text-center py-5 text-danger">{error}</div>
      ) : (
        <Row className="g-4">
          {posts.map((post) => (
            <Col key={post.id} xs={12}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {post.author_avatar && (
                      <Image
                        src={post.author_avatar}
                        alt={post.author_name}
                        width={40}
                        height={40}
                        className="rounded-circle me-2"
                      />
                    )}
                    <div>
                      <div className="fw-bold">{post.author_name}</div>
                      <small className="text-muted">
                        {new Date(post.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.content}</Card.Text>
                  <div className="d-flex gap-3">
                    <Button variant="link" className="text-muted p-0">
                      <Heart size={18} className="me-1" />
                      {post.like_count}
                    </Button>
                    <Button variant="link" className="text-muted p-0">
                      <MessageCircle size={18} className="me-1" />
                      {post.comment_count}
                    </Button>
                    <Button variant="link" className="text-muted p-0">
                      <Share2 size={18} className="me-1" />
                      分享
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 分頁控制 */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="outline-primary"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            上一頁
          </Button>
          <div className="mx-3">
            第 {pagination.page} 頁，共 {pagination.totalPages} 頁
          </div>
          <Button
            variant="outline-primary"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            下一頁
          </Button>
        </div>
      )}

      {/* 發文表單 Modal */}
      <CreatePostModal
        show={showCreatePost}
        onHide={() => setShowCreatePost(false)}
        categories={categories}
      />
    </Container>
  );
}

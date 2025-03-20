'use client';

import { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { Heart, MessageCircle, Share2, Search, Plus } from 'lucide-react';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'next/image';
import CreatePostModal from './components/CreatePostModal';
import styles from './styles.module.css';

// 模擬資料，之後會從API獲取
const categories = [
  { id: 1, name: '貓咪' },
  { id: 2, name: '狗狗' },
  { id: 3, name: '鳥類' },
  { id: 4, name: '爬蟲' },
  { id: 5, name: '其他' },
];

const carouselItems = [
  {
    id: 1,
    image: '/images/forum/banner1.jpg',
    caption: '布偶貓新手指南，從挑貓到日常照護，打造貓皇的幸福生活！'
  },
  // 其他輪播項目...
];

const pinnedPosts = [
  {
    id: 1,
    title: '【必知】寵物認養前必須知道的準備事項',
    content: '準備迎接新成員了嗎？這裡有完整的認養指南...',
    likes: 156,
    comments: 45,
    shares: 23,
    image: '/images/pets/cat1.jpg'
  },
  // 其他置頂文章...
];

export default function ForumPage() {
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

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
        <Row className="g-2">
          {categories.map((category) => (
            <Col key={category.id}>
              <Button
                variant={currentCategory === category.id ? 'primary' : 'outline-primary'}
                className="w-100"
                onClick={() => setCurrentCategory(category.id)}
              >
                {category.name}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* 功能列 */}
      <Row className={styles['function-row']}>
        <Col md={6}>
          <div className="d-flex gap-2">
            <Button
              variant={sortBy === 'hot' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('hot')}
            >
              熱門
            </Button>
            <Button
              variant={sortBy === 'new' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('new')}
            >
              最新
            </Button>
            <Button
              variant={sortBy === 'rules' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('rules')}
            >
              板規
            </Button>
          </div>
        </Col>
        <Col md={4}>
          <Form.Group className="d-flex gap-2">
            <Form.Control
              type="search"
              placeholder="搜尋文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-primary">
              <Search size={20} />
            </Button>
          </Form.Group>
        </Col>
        <Col md={2} className="text-end">
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus size={20} />
            發文
          </Button>
        </Col>
      </Row>

      {/* 置頂文章 */}
      <div className={styles['pinned-posts']}>
        {pinnedPosts.map((post) => (
          <Card key={post.id} className="mb-3">
            <Card.Body>
              <Row>
                <Col md={9}>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.content}</Card.Text>
                  <div className="d-flex gap-4">
                    <span className="d-flex align-items-center gap-1">
                      <Heart size={18} />
                      {post.likes}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <MessageCircle size={18} />
                      {post.comments}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Share2 size={18} />
                      {post.shares}
                    </span>
                  </div>
                </Col>
                <Col md={3}>
                  <div className={styles['post-image-container']}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="rounded"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* 分頁導航 */}
      <div className="d-flex justify-content-center">
        <Button variant="outline-primary" className="mx-1">上一頁</Button>
        {[1, 2, 3, 4, 5].map((page) => (
          <Button
            key={page}
            variant="outline-primary"
            className="mx-1"
          >
            {page}
          </Button>
        ))}
        <Button variant="outline-primary" className="mx-1">下一頁</Button>
      </div>

      {/* 發文 Modal */}
      <CreatePostModal
        show={showCreatePost}
        onHide={() => setShowCreatePost(false)}
        categories={categories}
      />
    </Container>
  );
}

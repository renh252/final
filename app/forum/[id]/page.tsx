'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Heart, MessageCircle, Share2, ArrowBigUp, ArrowBigDown, Flag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import ReportModal from '../components/ReportModal';

// 模擬資料，之後會從API獲取
const post = {
  id: 1,
  title: '【必知】寵物認養前必須知道的準備事項',
  content: `在決定認養寵物之前，有許多重要的準備工作需要完成。以下是一些關鍵要點：

1. 居住環境評估
- 確認房東是否允許養寵物
- 評估居住空間是否足夠
- 確保環境安全，移除危險物品

2. 時間規劃
- 每天遛狗時間
- 餵食時間
- 陪伴和互動時間

3. 經濟準備
- 日常飼料支出
- 醫療保健費用
- 寵物用品花費`,
  author: {
    id: 1,
    name: '寵物專家',
    avatar: '/images/avatars/expert.jpg'
  },
  category: '貓咪',
  createdAt: '2025-03-19T10:00:00Z',
  upvotes: 156,
  downvotes: 12,
  comments: [
    {
      id: 1,
      author: {
        id: 2,
        name: '貓奴一號',
        avatar: '/images/avatars/user1.jpg'
      },
      content: '這篇文章真的很實用！我在準備認養貓咪時就是參考這些建議。',
      createdAt: '2025-03-19T11:30:00Z',
      upvotes: 23,
      downvotes: 1,
    },
    // 更多評論...
  ],
  images: [
    '/images/posts/pet-preparation1.jpg',
    '/images/posts/pet-preparation2.jpg'
  ]
};

/**
 * 文章頁面元件
 * 
 * @param params 路由參數
 * @param params.id 文章 ID
 */
export default function PostPage({ params }: { params: { id: string } }) {
  const [comment, setComment] = useState('');
  const [showReplies, setShowReplies] = useState<Record<number, boolean>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: number } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container className={styles.postContainer}>
      <Row>
        <Col md={8} className="mx-auto">
          {/* 文章卡片 */}
          <Card className={styles.postCard}>
            {/* 投票區 */}
            <div className={styles.voteSection}>
              <Button variant="link" className={styles.voteButton}>
                <ArrowBigUp size={24} />
              </Button>
              <span className={styles.voteCount}>{post.upvotes - post.downvotes}</span>
              <Button variant="link" className={styles.voteButton}>
                <ArrowBigDown size={24} />
              </Button>
            </div>

            <Card.Body>
              {/* 文章標題區 */}
              <div className={styles.postHeader}>
                <div className={styles.postMeta}>
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className={styles.authorAvatar}
                  />
                  <span className={styles.authorName}>{post.author.name}</span>
                  <span className={styles.postTime}>
                    發表於 {formatDate(post.createdAt)}
                  </span>
                </div>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <div className={styles.postCategory}>
                  <Link href={`/forum?category=${post.category}`}>
                    {post.category}
                  </Link>
                </div>
              </div>

              {/* 文章內容 */}
              <div className={styles.postContent}>
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* 圖片區 */}
              {post.images.length > 0 && (
                <div className={styles.imageGrid}>
                  {post.images.map((image, index) => (
                    <div key={index} className={styles.imageContainer}>
                      <Image
                        src={image}
                        alt={`圖片 ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 互動區 */}
              <div className={styles.interactionBar}>
                <Button variant="link" className={styles.interactionButton}>
                  <Heart size={20} />
                  <span>收藏</span>
                </Button>
                <Button variant="link" className={styles.interactionButton}>
                  <MessageCircle size={20} />
                  <span>{post.comments.length} 則留言</span>
                </Button>
                <Button variant="link" className={styles.interactionButton}>
                  <Share2 size={20} />
                  <span>分享</span>
                </Button>
                <Button 
                  variant="link" 
                  className={styles.interactionButton}
                  onClick={() => {
                    setReportTarget({ type: 'post', id: post.id });
                    setShowReportModal(true);
                  }}
                >
                  <Flag size={20} />
                  <span>檢舉</span>
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* 留言區 */}
          <div className={styles.commentSection}>
            <h3 className={styles.commentTitle}>留言</h3>
            
            {/* 留言輸入框 */}
            <Form className={styles.commentForm}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="寫下你的想法..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
              <div className={styles.commentFormFooter}>
                <Button variant="primary" type="submit">
                  發表留言
                </Button>
              </div>
            </Form>

            {/* 留言列表 */}
            <div className={styles.commentList}>
              {post.comments.map((comment) => (
                <Card key={comment.id} className={styles.commentCard}>
                  <Card.Body>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthor}>
                        <Image
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          width={24}
                          height={24}
                          className={styles.commentAvatar}
                        />
                        <span className={styles.commentAuthorName}>
                          {comment.author.name}
                        </span>
                        <span className={styles.commentTime}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div className={styles.commentVotes}>
                        <Button variant="link" className={styles.voteButton}>
                          <ArrowBigUp size={16} />
                        </Button>
                        <span>{comment.upvotes - comment.downvotes}</span>
                        <Button variant="link" className={styles.voteButton}>
                          <ArrowBigDown size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className={styles.commentContent}>
                      {comment.content}
                    </div>
                    <div className={styles.commentActions}>
                      <Button
                        variant="link"
                        className={styles.commentActionButton}
                        onClick={() => setShowReplies(prev => ({
                          ...prev,
                          [comment.id]: !prev[comment.id]
                        }))}
                      >
                        回覆
                      </Button>
                      <Button
                        variant="link"
                        className={styles.commentActionButton}
                        onClick={() => {
                          setReportTarget({ type: 'comment', id: comment.id });
                          setShowReportModal(true);
                        }}
                      >
                        <Flag size={16} />
                        <span>檢舉</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* 檢舉 Modal */}
      {reportTarget && (
        <ReportModal
          show={showReportModal}
          onHide={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          contentType={reportTarget.type}
          contentId={reportTarget.id}
        />
      )}
    </Container>
  );
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Nav,
  Tabs,
  Tab,
  Badge,
  Button,
} from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import styles from './notifications.module.css'
import { useAuth } from '@/app/context/AuthContext'

// 通知類型
type NotificationType =
  | 'shop'
  | 'pet'
  | 'donation'
  | 'forum'
  | 'member'
  | 'system'

// 通知圖標
const notificationIcons = {
  shop: '/images/icons/shop.png',
  pet: '/images/icons/pet.png',
  donation: '/images/icons/donation.png',
  forum: '/images/icons/forum.png',
  member: '/images/icons/member.png',
  system: '/images/icons/system.png',
  default: '/images/default-avatar.png',
}

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  link?: string
  image?: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  // 添加控制變數，設為 true 可顯示模擬通知，設為 false 則使用實際 API
  const SHOW_MOCK_NOTIFICATIONS = false

  useEffect(() => {
    // 獲取通知列表
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        if (SHOW_MOCK_NOTIFICATIONS) {
          // 使用模擬數據
          setTimeout(() => {
            const mockNotifications: Notification[] = [
              {
                id: 1,
                type: 'forum',
                title: '新留言通知',
                message: '有人在您的貼文「尋找愛貓新家」留言',
                link: '/forum/post/1',
                image: '/images/default-avatar.png',
                isRead: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                type: 'pet',
                title: '寵物領養通知',
                message: '您申請的寵物「小花」領養申請已通過初審',
                link: '/pets/2',
                image: notificationIcons.pet,
                isRead: false,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                id: 3,
                type: 'system',
                title: '系統通知',
                message: '您的帳號已通過驗證',
                image: notificationIcons.system,
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                id: 4,
                type: 'shop',
                title: '訂單已建立',
                message: '您的訂單 #T12345 已建立成功，等待付款',
                link: '/member/orders/T12345',
                image: notificationIcons.shop,
                isRead: false,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
              },
              {
                id: 5,
                type: 'donation',
                title: '感謝您的捐款',
                message: '感謝您捐款 $500 元，您的愛心將幫助更多流浪動物',
                link: '/donate/history',
                image: notificationIcons.donation,
                isRead: false,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
              },
              {
                id: 6,
                type: 'member',
                title: '會員等級提升',
                message: '恭喜您已升級為金牌會員，享有更多特權',
                link: '/member',
                image: notificationIcons.member,
                isRead: true,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
              },
              {
                id: 7,
                type: 'shop',
                title: '商品已出貨',
                message: '您的訂單 #T12345 已出貨，預計 3 天內送達',
                link: '/member/orders/T12345',
                image: notificationIcons.shop,
                isRead: true,
                createdAt: new Date(Date.now() - 345600000).toISOString(),
              },
              {
                id: 8,
                type: 'pet',
                title: '領養審核結果',
                message:
                  '恭喜！您對寵物「小白」的領養申請已通過，請安排時間前往中心',
                link: '/pets/5',
                image: notificationIcons.pet,
                isRead: true,
                createdAt: new Date(Date.now() - 432000000).toISOString(),
              },
              {
                id: 9,
                type: 'forum',
                title: '文章被讚',
                message: '您的文章「養貓新手須知」獲得了 10 個讚',
                link: '/forum/post/7',
                image: notificationIcons.forum,
                isRead: true,
                createdAt: new Date(Date.now() - 518400000).toISOString(),
              },
              {
                id: 10,
                type: 'system',
                title: '平台更新通知',
                message: '平台已更新，新增寵物健康追蹤功能',
                image: notificationIcons.system,
                isRead: true,
                createdAt: new Date(Date.now() - 604800000).toISOString(),
              },
            ]
            setNotifications(mockNotifications)
            setLoading(false)
          }, 800)
        } else if (isAuthenticated) {
          // 使用實際 API
          const userId = user?.id
          const response = await fetch(`/api/notifications?userId=${userId}`)

          if (!response.ok) {
            throw new Error('獲取通知失敗')
          }

          const data = await response.json()

          if (data.success) {
            setNotifications(data.notifications)
          }
          setLoading(false)
        } else {
          // 未登入
          setLoading(false)
          setNotifications([])
        }
      } catch (error) {
        console.error('獲取通知失敗:', error)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated, user])

  const handleRead = async (id: number) => {
    try {
      if (!SHOW_MOCK_NOTIFICATIONS && isAuthenticated) {
        // 實際 API 呼叫
        const response = await fetch(`/api/notifications/${id}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user?.id }),
        })

        if (!response.ok) {
          throw new Error('標記通知已讀失敗')
        }
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (error) {
      console.error('標記通知已讀失敗:', error)
    }
  }

  const handleReadAll = async () => {
    try {
      if (!SHOW_MOCK_NOTIFICATIONS && isAuthenticated) {
        // 實際 API 呼叫
        const response = await fetch('/api/notifications/read-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user?.id }),
        })

        if (!response.ok) {
          throw new Error('標記全部已讀失敗')
        }
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('標記全部已讀失敗:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '剛剛'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`
    return `${Math.floor(diff / 86400000)}天前`
  }

  // 根據選擇的分類過濾通知
  const filteredNotifications =
    activeCategory === 'all'
      ? notifications
      : notifications.filter(
          (notification) => notification.type === activeCategory
        )

  // 獲取未讀通知數
  const getUnreadCount = (type: string = 'all') => {
    if (type === 'all') {
      return notifications.filter((n) => !n.isRead).length
    }
    return notifications.filter((n) => n.type === type && !n.isRead).length
  }

  // 如果未登入且不顯示模擬通知，顯示提示訊息
  if (!isAuthenticated && !SHOW_MOCK_NOTIFICATIONS) {
    return (
      <Container className={styles.container}>
        <Row className="justify-content-center">
          <Col lg={8} md={10} sm={12}>
            <div className={styles.notLoggedIn}>
              <h2>請先登入</h2>
              <p>您需要登入才能查看通知內容</p>
              <Link href="/member/MemberLogin/login">
                <Button variant="primary">前往登入</Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className={styles.container}>
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12}>
          <div className={styles.header}>
            <h1 className={styles.title}>通知中心</h1>
            {getUnreadCount() > 0 && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleReadAll}
                className={styles.readAllButton}
              >
                全部標為已讀
              </Button>
            )}
          </div>

          <Nav variant="tabs" className={styles.tabs}>
            <div style={{ display: 'flex', minWidth: 'max-content' }}>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'all' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('all')}
                >
                  全部
                  {getUnreadCount() > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount()}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'shop' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('shop')}
                >
                  商城
                  {getUnreadCount('shop') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('shop')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'pet' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('pet')}
                >
                  寵物
                  {getUnreadCount('pet') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('pet')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'forum' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('forum')}
                >
                  論壇
                  {getUnreadCount('forum') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('forum')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'donation' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('donation')}
                >
                  捐款
                  {getUnreadCount('donation') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('donation')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'member' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('member')}
                >
                  會員
                  {getUnreadCount('member') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('member')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={`${styles.tab} ${
                    activeCategory === 'system' ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory('system')}
                >
                  系統
                  {getUnreadCount('system') > 0 && (
                    <Badge bg="danger" className={styles.tabBadge}>
                      {getUnreadCount('system')}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </div>
          </Nav>

          <div className={styles.notificationList}>
            {loading ? (
              <div className={styles.loading}>載入中...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className={styles.empty}>
                目前沒有
                {activeCategory !== 'all'
                  ? `${getNotificationTypeName(activeCategory)}類型的`
                  : ''}
                通知
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.item} ${
                    !notification.isRead ? styles.unread : ''
                  } ${styles[notification.type]}`}
                  onClick={() =>
                    notification.link
                      ? (window.location.href = notification.link)
                      : handleRead(notification.id)
                  }
                >
                  <div className={styles.content}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={
                          notification.image ||
                          notificationIcons[notification.type] ||
                          notificationIcons.default
                        }
                        alt=""
                        width={48}
                        height={48}
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.text}>
                      <div className={styles.typeLabel}>
                        {getNotificationTypeName(notification.type)}
                      </div>
                      <div className={styles.itemTitle}>
                        {notification.title}
                      </div>
                      <div className={styles.message}>
                        {notification.message}
                      </div>
                      <div className={styles.time}>
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <div className={styles.actions}>
                        <Button
                          variant="light"
                          size="sm"
                          className={styles.readButton}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRead(notification.id)
                          }}
                        >
                          標為已讀
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

// 獲取通知類型的中文名稱
function getNotificationTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    shop: '商城',
    pet: '寵物',
    donation: '捐款',
    forum: '論壇',
    member: '會員',
    system: '系統',
    all: '全部',
  }
  return typeMap[type] || '其他'
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Badge, Nav } from 'react-bootstrap'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './NotificationBell.module.css'

// 擴展通知類型
type NotificationType =
  | 'shop'
  | 'pet'
  | 'donation'
  | 'forum'
  | 'member'
  | 'system'

// 為不同類型通知定義圖標
const notificationIcons = {
  shop: '/images/icons/shop.png',
  pet: '/images/icons/pet.png',
  donation: '/images/icons/donation.png',
  forum: '/images/icons/forum.png',
  member: '/images/icons/member.png',
  system: '/images/icons/system.png',
  // 如果沒有特定圖標，可以使用預設
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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isOpen, setIsOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 添加控制變數，設為 true 可顯示模擬通知
  const SHOW_MOCK_NOTIFICATIONS = true

  // 檢測是否為手機版
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992)
    }

    // 初始檢查
    checkMobile()

    // 監聽窗口大小變化
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!SHOW_MOCK_NOTIFICATIONS) return

    const timer = setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'forum',
          title: '新留言通知',
          message: '有人在您的貼文「尋找愛貓新家」留言',
          link: '/forum/posts/1',
          image: '/images/default-avatar.png',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'pet',
          title: '寵物領養通知',
          message: '您申請的寵物「多多」領養申請已通過初審',
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
          message: '您的訂單 #ORD00001 已建立成功，等待付款',
          link: '/member/orders/ORD00001',
          image: notificationIcons.shop,
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 5,
          type: 'donation',
          title: '感謝您的捐款',
          message: '感謝您捐款 $500 元，您的愛心將幫助更多流浪動物',
          link: 'member/donations',
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
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleRead = async (id: number) => {
    try {
      // TODO: 實際API呼叫
      // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('標記通知已讀失敗:', error)
    }
  }

  const handleReadAll = async () => {
    try {
      // TODO: 實際API呼叫
      // await fetch('/api/notifications/read-all', { method: 'POST' });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
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

  // 獲取每個分類的未讀通知數
  const getUnreadCountByType = (type: string) => {
    if (type === 'all') return unreadCount
    return notifications.filter((n) => n.type === type && !n.isRead).length
  }

  // 重新計算選單位置函數
  const updateMenuPosition = () => {
    if (!bellRef.current) return

    if (isMobile) {
      // 手機版：從頂部展開，寬度100%
      setMenuPosition({
        top: 0,
        right: 0,
      })
    } else {
      // 桌面版：從通知圖標下方展開
      const rect = bellRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      let rightPosition = windowWidth - rect.right

      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        right: rightPosition,
      })
    }
  }

  // 點擊通知鈴鐺時重新計算位置
  const toggleMenu = () => {
    // 在手機版檢查並關閉漢堡選單
    if (isMobile) {
      // 獲取當前展開的漢堡選單
      const expandedNavbar = document.querySelector('.navbar-collapse.show')

      // 如果漢堡選單已展開，先關閉它
      if (expandedNavbar) {
        const navbarToggle = document.querySelector(
          '.navbar-toggler'
        ) as HTMLElement
        if (navbarToggle) {
          navbarToggle.click()

          // 短暫延遲後再開啟通知選單
          setTimeout(() => {
            const newIsOpen = !isOpen
            setIsOpen(newIsOpen)
            if (newIsOpen) {
              setTimeout(updateMenuPosition, 10)
            }
          }, 300) // 增加延遲以確保漢堡選單完全收起
          return
        }
      }
    }

    // 正常開啟/關閉通知選單（非手機版或漢堡選單未展開）
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    if (newIsOpen) {
      setTimeout(updateMenuPosition, 0)
    }
  }

  // 監聽視窗大小變化，更新選單位置
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', updateMenuPosition)
      return () => window.removeEventListener('resize', updateMenuPosition)
    }
  }, [isOpen])

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        bellRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 計算選單位置
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    right: 0,
  })

  // 處理通知項目點擊
  const handleItemClick = (notification: Notification) => {
    handleRead(notification.id)
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  // 處理鍵盤事件
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    callback: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  }

  // 處理選單鍵盤事件
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 使用 Portal 渲染下拉選單
  const renderMenu = () => {
    if (!isOpen || !isMounted) return null

    const menuStyle = {
      position: 'fixed',
      top: `${menuPosition.top}px`,
      right: `${menuPosition.right}px`,
      zIndex: 1050,
    } as React.CSSProperties

    // 如果是手機版，移除top和right樣式，讓CSS控制
    if (isMobile) {
      delete menuStyle.top
      delete menuStyle.right
    }

    const menu = (
      <div ref={menuRef} className={styles.menu} style={menuStyle}>
        <div className={styles.header}>
          <span className={styles.title}>通知中心</span>
          <div>
            {unreadCount > 0 && (
              <button className={styles.readAllButton} onClick={handleReadAll}>
                全部標為已讀
              </button>
            )}
            {isMobile && (
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="關閉通知中心"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 通知分類標籤 */}
        <Nav variant="tabs" className={styles.categoryTabs}>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'all' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('all')}
            >
              全部
              {getUnreadCountByType('all') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('all')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'shop' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('shop')}
            >
              商城
              {getUnreadCountByType('shop') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('shop')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'pet' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('pet')}
            >
              寵物
              {getUnreadCountByType('pet') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('pet')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'forum' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('forum')}
            >
              論壇
              {getUnreadCountByType('forum') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('forum')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'donation' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('donation')}
            >
              捐款
              {getUnreadCountByType('donation') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('donation')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'member' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('member')}
            >
              會員
              {getUnreadCountByType('member') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('member')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as="button"
              className={`${styles.categoryTab} ${
                activeCategory === 'system' ? styles.active : ''
              }`}
              onClick={() => setActiveCategory('system')}
            >
              系統
              {getUnreadCountByType('system') > 0 && (
                <Badge bg="danger" className={styles.tabBadge}>
                  {getUnreadCountByType('system')}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className={styles.notificationList}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.empty}>
              目前沒有
              {activeCategory !== 'all'
                ? `${getNotificationTypeName(activeCategory)}類型的`
                : ''}
              通知
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <button
                key={notification.id}
                className={`${styles.item} ${
                  !notification.isRead ? styles.unread : ''
                } ${styles[notification.type]}`}
                onClick={() => handleItemClick(notification)}
                aria-label={`${notification.title}: ${notification.message}`}
                style={{ '--item-index': index } as React.CSSProperties}
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
                      width={40}
                      height={40}
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.text}>
                    <div className={styles.typeLabel}>
                      {getNotificationTypeName(notification.type)}
                    </div>
                    <div className={styles.itemTitle}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.time}>
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <Link href="/notifications" className={styles.viewAll}>
          查看所有通知
        </Link>
      </div>
    )

    return createPortal(menu, document.body)
  }

  return (
    <>
      <button
        ref={bellRef as React.RefObject<HTMLButtonElement>}
        onClick={(e) => {
          e.preventDefault()
          toggleMenu()
        }}
        className={styles.notificationIconLink}
        aria-label="開啟通知中心"
      >
        <Bell size={20} className={styles.notificationIcon} />
        {unreadCount > 0 && (
          <div className={styles.notificationCount}>{unreadCount}</div>
        )}
      </button>
      {renderMenu()}
    </>
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

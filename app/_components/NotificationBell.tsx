'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Badge, Nav } from 'react-bootstrap'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './NotificationBell.module.css'
import { useAuth } from '@/app/context/AuthContext'

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
  // 資料庫可能返回的欄位
  created_at?: string
  is_read?: boolean
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const bellRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuth()

  // 添加控制變數，設為 true 可顯示模擬通知，設為 false 則使用實際 API
  const SHOW_MOCK_NOTIFICATIONS = false

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
      // 桌面版：固定在頂部56px位置，通知圖標右對齊
      const rect = bellRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      let rightPosition = windowWidth - rect.right

      setMenuPosition({
        top: 56 + window.scrollY, // 固定距離頂部56px
        right: rightPosition,
      })
    }
  }

  // 監聽視窗大小變化，更新選單位置
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', updateMenuPosition)
      return () => window.removeEventListener('resize', updateMenuPosition)
    }
    return undefined // 當 isOpen 為 false 時返回空函數
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

  // 獲取通知列表
  const fetchNotifications = async () => {
    // 如果未登入或顯示模擬通知，則跳過實際 API 請求
    if (!isAuthenticated || SHOW_MOCK_NOTIFICATIONS) return

    setLoading(true)
    try {
      const userId = user?.id
      const response = await fetch(`/api/notifications?userId=${userId}`)

      if (!response.ok) {
        throw new Error('獲取通知失敗')
      }

      const data = await response.json()

      if (data.success) {
        // 將 created_at 轉換為 createdAt（如果需要）
        const formattedNotifications = data.notifications.map(
          (notification) => ({
            ...notification,
            createdAt: notification.createdAt || notification.created_at,
          })
        )

        setNotifications(formattedNotifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('獲取通知失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (SHOW_MOCK_NOTIFICATIONS) {
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
    } else {
      // 如果用戶已登入，從實際 API 獲取通知
      if (isAuthenticated) {
        fetchNotifications()
      }
    }
  }, [isAuthenticated, user])

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
      setUnreadCount((prev) => Math.max(0, prev - 1))
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
      setUnreadCount(0)
    } catch (error) {
      console.error('標記全部已讀失敗:', error)
    }
  }

  const formatTime = (dateString: string) => {
    // 檢查傳入的日期是否為有效字符串
    if (!dateString) {
      return '未知時間'
    }

    try {
      let parsedDate: Date

      // 處理MySQL timestamp格式 (YYYY-MM-DD HH:MM:SS)
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // 替換全部空格為T，確保格式正確
        const formattedString = dateString.replace(/\s/, 'T')
        parsedDate = new Date(formattedString)
      } else {
        parsedDate = new Date(dateString)
      }

      // 檢查日期是否有效
      if (isNaN(parsedDate.getTime())) {
        console.warn('無效的日期格式:', dateString)
        return '未知時間'
      }

      const now = new Date()
      const diff = now.getTime() - parsedDate.getTime()

      // 處理時間顯示邏輯
      if (diff < 0) {
        // 處理未來時間
        const absDiff = Math.abs(diff)

        if (absDiff > 86400000) {
          // 超過1天
          return `${parsedDate.getFullYear()}-${String(
            parsedDate.getMonth() + 1
          ).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
        }
        return '即將'
      } else if (diff < 60000) {
        // 小於1分鐘
        return '剛剛'
      } else if (diff < 3600000) {
        // 小於1小時
        const minutes = Math.floor(diff / 60000)
        return `${minutes}分鐘前`
      } else if (diff < 86400000) {
        // 小於1天
        const hours = Math.floor(diff / 3600000)
        return `${hours}小時前`
      } else if (diff < 2592000000) {
        // 小於30天
        const days = Math.floor(diff / 86400000)
        return `${days}天前`
      } else {
        // 超過30天
        return `${parsedDate.getFullYear()}-${String(
          parsedDate.getMonth() + 1
        ).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
      }
    } catch (error) {
      console.error('格式化日期時發生錯誤:', error)
      return '未知時間'
    }
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

  // 如果沒有登入，不顯示通知中心
  if (!isAuthenticated && !SHOW_MOCK_NOTIFICATIONS) {
    return null
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
      <div
        ref={menuRef}
        className={styles.menu}
        style={menuStyle}
        role="dialog"
        aria-label="通知中心"
      >
        {/* ESC 鍵可以關閉選單 */}
        <button
          className={styles.hiddenEscButton}
          aria-hidden="true"
          tabIndex={0}
          onKeyDown={handleMenuKeyDown}
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
        />

        <div className={styles.header}>
          <span className={styles.title}>通知中心</span>
          <div>
            {unreadCount > 0 && (
              <button
                className={styles.readAllButton}
                onClick={handleReadAll}
                onKeyDown={(e) => handleKeyDown(e, handleReadAll)}
              >
                全部標為已讀
              </button>
            )}
            {isMobile && (
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="關閉通知中心"
                onKeyDown={(e) => handleKeyDown(e, () => setIsOpen(false))}
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('all'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('shop'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('pet'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('forum'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('donation'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('member'))
              }
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
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveCategory('system'))
              }
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
          {loading ? (
            <div className={styles.empty}>載入中...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.empty}>
              目前沒有
              {activeCategory !== 'all'
                ? `${getNotificationTypeName(activeCategory)}類型的`
                : ''}
              通知
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              // 檢查時間屬性
              const timeValue =
                notification.createdAt || notification.created_at

              return (
                <button
                  key={notification.id}
                  className={`${styles.item} ${
                    !notification.isRead && !notification.is_read
                      ? styles.unread
                      : ''
                  } ${styles[notification.type]}`}
                  onClick={() => handleItemClick(notification)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => handleItemClick(notification))
                  }
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
                      <div className={styles.itemTitle}>
                        {notification.title}
                      </div>
                      <div className={styles.message}>
                        {notification.message}
                      </div>
                      <div className={styles.time}>
                        {formatTime(timeValue || '')}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <Link
          href="/notifications"
          className={styles.viewAll}
          onClick={() => setIsOpen(false)}
        >
          查看所有通知
        </Link>
      </div>
    )

    return createPortal(menu, document.body)
  }

  return (
    <>
      <button
        ref={bellRef}
        onClick={(e) => {
          e.preventDefault()
          toggleMenu()
        }}
        className={styles.notificationIconLink}
        aria-label="開啟通知中心"
        onKeyDown={(e) => handleKeyDown(e, toggleMenu)}
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

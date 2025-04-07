'use client'

// @ts-ignore NodeJS.Timeout
import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Spinner } from 'react-bootstrap'
import styles from './admin/header.module.css'
import { useAdmin } from '../AdminContext'
import { useTheme } from '../ThemeContext'

// 通知類型定義
type NotificationType =
  | 'shop'
  | 'pet'
  | 'donation'
  | 'forum'
  | 'member'
  | 'system'

// 通知介面
interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  link?: string
  image?: string
  isRead: boolean
  createdAt: string
  created_at?: string // 資料庫回傳的原始欄位名稱
  is_read?: number // 資料庫回傳的原始欄位名稱
}

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

export default function AdminNotificationBell() {
  const { admin, isLoading } = useAdmin()
  const { isDarkMode } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<any>(null)

  // 獲取通知數據
  const fetchNotifications = async () => {
    if (!admin?.id) return

    try {
      setIsLoadingNotifications(true)
      setError(null)

      // 調用通知 API，獲取管理員的通知
      const response = await fetch(
        `/api/notifications?adminId=${admin.id}&limit=10`
      )

      if (!response.ok) {
        throw new Error('獲取通知失敗')
      }

      const data = await response.json()

      if (data.success) {
        // 格式化通知數據
        const formattedNotifications = data.notifications.map(
          (notification: any) => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            image: notification.image,
            isRead: notification.isRead || notification.is_read === 1,
            createdAt: notification.createdAt || notification.created_at,
          })
        )

        setNotifications(formattedNotifications)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('獲取通知失敗:', err)
      setError('獲取通知失敗')
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // 格式化時間顯示
  const formatTime = (dateString: string) => {
    if (!dateString) return '未知時間'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn('無效的日期格式:', dateString)
        return '未知時間'
      }

      const now = new Date()
      const diff = now.getTime() - date.getTime()

      // 如果是未來時間，顯示 "未來時間"
      if (diff < 0) return '未來時間'

      // 時間差顯示
      if (diff < 60000) return '剛剛'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`
      if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`

      // 超過30天，顯示完整日期
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('格式化時間出錯:', error)
      return '未知時間'
    }
  }

  // 標記通知為已讀
  const handleReadNotification = async (notificationId: number) => {
    if (!admin?.id) return

    try {
      // 調用通知已讀 API
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId: admin.id }),
        }
      )

      if (!response.ok) {
        throw new Error('標記通知已讀失敗')
      }

      // 更新本地狀態
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('標記通知已讀失敗:', error)
    }
  }

  // 標記全部通知為已讀
  const handleMarkAllAsRead = async () => {
    if (!admin?.id || unreadCount === 0) return

    try {
      // 調用通知全部已讀 API
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId: admin.id }),
      })

      if (!response.ok) {
        throw new Error('標記全部已讀失敗')
      }

      // 更新本地狀態
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('標記全部已讀失敗:', error)
    }
  }

  // 組件載入時獲取通知，並定期刷新
  useEffect(() => {
    // 首次載入時獲取通知
    if (admin?.id) {
      fetchNotifications()

      // 設置定期刷新
      intervalRef.current = setInterval(fetchNotifications, 30000) // 每30秒刷新一次
    }

    // 清理函數
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [admin?.id])

  // 獲取通知類型的中文名稱
  const getNotificationTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      shop: '商城',
      pet: '寵物',
      donation: '捐款',
      forum: '論壇',
      member: '會員',
      system: '系統',
    }
    return typeMap[type] || '其他'
  }

  return (
    <div className="dropdown me-3">
      <button
        className={`btn btn-link position-relative ${
          isDarkMode ? 'text-light' : 'text-dark'
        }`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        type="button"
        aria-label="通知"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      <ul
        className={`dropdown-menu dropdown-menu-end ${styles.notificationMenu}`}
      >
        <li className={styles.notificationHeader}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">通知中心</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-primary p-0"
                onClick={handleMarkAllAsRead}
                title="標記全部為已讀"
              >
                <small>
                  <CheckSquare size={12} className="me-1" />
                  全部已讀
                </small>
              </button>
            )}
          </div>
        </li>
        {isLoadingNotifications ? (
          <li className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </li>
        ) : error ? (
          <li className="dropdown-item text-danger">{error}</li>
        ) : notifications.length === 0 ? (
          <li className="dropdown-item text-muted">目前沒有通知</li>
        ) : (
          notifications.map((notification) => (
            <li key={notification.id}>
              <Link
                href={notification.link || '#'}
                className={`dropdown-item ${styles.notificationMenuItem} ${
                  !notification.isRead ? styles.unread : ''
                }`}
                onClick={() => handleReadNotification(notification.id)}
              >
                <div className="d-flex align-items-start">
                  <div className="me-2" style={{ minWidth: '32px' }}>
                    <Image
                      src={
                        notification.image ||
                        notificationIcons[notification.type] ||
                        notificationIcons.default
                      }
                      alt=""
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">
                        {getNotificationTypeName(notification.type)}
                      </small>
                      <small className="text-muted ms-2">
                        {formatTime(notification.createdAt)}
                      </small>
                    </div>
                    <div className="fw-bold text-truncate mb-1">
                      {notification.title}
                    </div>
                    <small className="d-block" style={{ lineHeight: '1.4' }}>
                      {notification.message}
                    </small>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <Link
            className="dropdown-item text-center"
            href="/admin/notifications"
          >
            查看所有通知
          </Link>
        </li>
      </ul>
    </div>
  )
}

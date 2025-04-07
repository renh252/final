'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Badge, Form, Button, Spinner } from 'react-bootstrap'
import { useAdmin } from '@/app/admin/AdminContext'
import { withAuth } from '@/app/admin/_hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Filter, CheckSquare, RefreshCw } from 'lucide-react'
import AdminPageLayout from '@/app/admin/_components/AdminPageLayout'
import styles from './notifications.module.css'

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
  created_at?: string
  is_read?: number
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

function AdminNotificationsPage() {
  const { admin } = useAdmin()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [showRead, setShowRead] = useState(true)

  // 加載通知
  const fetchNotifications = async () => {
    if (!admin?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // 調用通知API
      const response = await fetch(
        `/api/notifications?adminId=${admin.id}&limit=100`
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
        applyFilters(formattedNotifications, filter, showRead)
      }
    } catch (err) {
      console.error('獲取通知失敗:', err)
      setError('獲取通知失敗')
    } finally {
      setIsLoading(false)
    }
  }

  // 應用過濾器
  const applyFilters = (
    notifications: Notification[],
    typeFilter: string,
    showReadState: boolean
  ) => {
    let filtered = [...notifications]

    // 按類型過濾
    if (typeFilter !== 'all') {
      filtered = filtered.filter(
        (notification) => notification.type === typeFilter
      )
    }

    // 按已讀/未讀過濾
    if (!showReadState) {
      filtered = filtered.filter((notification) => !notification.isRead)
    }

    setFilteredNotifications(filtered)
  }

  // 標記已讀
  const handleMarkAsRead = async (id: number) => {
    if (!admin?.id) return

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId: admin.id }),
      })

      if (!response.ok) {
        throw new Error('標記通知已讀失敗')
      }

      // 更新本地狀態
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )

      setNotifications(updatedNotifications)
      applyFilters(updatedNotifications, filter, showRead)
    } catch (error) {
      console.error('標記通知已讀失敗:', error)
    }
  }

  // 標記全部已讀
  const handleMarkAllAsRead = async () => {
    if (!admin?.id) return

    try {
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
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))

      setNotifications(updatedNotifications)
      applyFilters(updatedNotifications, filter, showRead)
    } catch (error) {
      console.error('標記全部已讀失敗:', error)
    }
  }

  // 處理過濾器變化
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = event.target.value
    setFilter(newFilter)
    applyFilters(notifications, newFilter, showRead)
  }

  // 處理顯示已讀變化
  const handleShowReadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newShowRead = event.target.checked
    setShowRead(newShowRead)
    applyFilters(notifications, filter, newShowRead)
  }

  // 格式化時間
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

  // 獲取通知類型的中文名稱
  const getNotificationTypeName = (type: string): string => {
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

  // 在組件掛載時獲取通知
  useEffect(() => {
    if (admin?.id) {
      fetchNotifications()
    }
  }, [admin?.id])

  return (
    <AdminPageLayout
      title="通知管理"
      breadcrumb={[
        { label: '儀表板', href: '/admin' },
        { label: '通知管理', active: true },
      ]}
    >
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Filter size={18} className="me-2" />
            <span>過濾條件</span>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              <RefreshCw size={16} className="me-1" />
              刷新
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              <CheckSquare size={16} className="me-1" />
              全部標為已讀
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4 d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="d-flex align-items-center me-3">
              <Form.Label className="me-2 mb-0">通知類型:</Form.Label>
              <Form.Select
                size="sm"
                value={filter}
                onChange={handleFilterChange}
                style={{ width: '120px' }}
              >
                <option value="all">全部</option>
                <option value="shop">商城</option>
                <option value="pet">寵物</option>
                <option value="donation">捐款</option>
                <option value="forum">論壇</option>
                <option value="member">會員</option>
                <option value="system">系統</option>
              </Form.Select>
            </div>
            <Form.Check
              type="switch"
              id="show-read"
              label="顯示已讀通知"
              checked={showRead}
              onChange={handleShowReadChange}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">載入通知中...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">沒有符合條件的通知</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table responsive hover className={styles.notificationsTable}>
                <thead>
                  <tr>
                    <th className={styles.typeColumn}>類型</th>
                    <th className={styles.contentColumn}>內容</th>
                    <th className={styles.timeColumn}>時間</th>
                    <th className={styles.statusColumn}>狀態</th>
                    <th className={styles.actionColumn}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id}>
                      <td className={styles.typeColumn}>
                        <div className="d-flex align-items-center">
                          <Image
                            src={
                              notification.image ||
                              notificationIcons[notification.type] ||
                              notificationIcons.default
                            }
                            alt=""
                            width={32}
                            height={32}
                            className="rounded me-2"
                          />
                          <span>
                            {getNotificationTypeName(notification.type)}
                          </span>
                        </div>
                      </td>
                      <td className={styles.contentColumn}>
                        <div className={styles.notificationTitle}>
                          {notification.title}
                        </div>
                        <div className={styles.notificationMessage}>
                          {notification.message}
                        </div>
                      </td>
                      <td className={styles.timeColumn}>
                        <div className="d-flex align-items-center text-muted small">
                          <Clock size={14} className="me-1" />
                          {formatTime(notification.createdAt)}
                        </div>
                      </td>
                      <td className={styles.statusColumn}>
                        <Badge
                          bg={notification.isRead ? 'secondary' : 'primary'}
                        >
                          {notification.isRead ? '已讀' : '未讀'}
                        </Badge>
                      </td>
                      <td className={styles.actionColumn}>
                        {notification.link ? (
                          <Link
                            href={notification.link}
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() =>
                              !notification.isRead &&
                              handleMarkAsRead(notification.id)
                            }
                          >
                            查看
                          </Link>
                        ) : (
                          <span className="text-muted">無連結</span>
                        )}
                        {!notification.isRead && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            標為已讀
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </AdminPageLayout>
  )
}

// 使用 withAuth HOC 包裝組件，需要特定權限
export default withAuth(AdminNotificationsPage)

'use client';

import { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './NotificationBell.module.css';

type NotificationType = 'comment' | 'like' | 'follow' | 'system' | 'pet';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  image?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 模擬從API獲取通知
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'comment',
        title: '新留言通知',
        message: '有人在您的貼文「尋找愛貓新家」留言',
        link: '/forum/post/1',
        image: '/images/default-avatar.png',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'pet',
        title: '寵物領養通知',
        message: '您關注的寵物「小花」已被領養',
        link: '/pets/2',
        image: '/images/pets/cat1.jpg',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'system',
        title: '系統通知',
        message: '您的帳號已通過驗證',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const handleRead = async (id: number) => {
    try {
      // TODO: 實際API呼叫
      // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('標記通知已讀失敗:', error);
    }
  };

  const handleReadAll = async () => {
    try {
      // TODO: 實際API呼叫
      // await fetch('/api/notifications/read-all', { method: 'POST' });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('標記全部已讀失敗:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className={styles.bellButton}>
        <Bell size={20} className={styles.bellIcon} />
        {unreadCount > 0 && (
          <Badge bg="danger" className={styles.badge}>
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className={styles.menu}>
        <div className={styles.header}>
          <span className={styles.title}>通知中心</span>
          {unreadCount > 0 && (
            <button 
              className={styles.readAllButton}
              onClick={handleReadAll}
            >
              全部標為已讀
            </button>
          )}
        </div>

        <div className={styles.notificationList}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              目前沒有通知
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item
                key={notification.id}
                as="div"
                className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                onClick={() => handleRead(notification.id)}
              >
                <div className={styles.content}>
                  {notification.image && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={notification.image}
                        alt=""
                        width={40}
                        height={40}
                        className={styles.image}
                      />
                    </div>
                  )}
                  <div className={styles.text}>
                    <div className={styles.itemTitle}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.time}>{formatTime(notification.createdAt)}</div>
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        <Link href="/notifications" className={styles.viewAll}>
          查看所有通知
        </Link>
      </Dropdown.Menu>
    </Dropdown>
  );
}

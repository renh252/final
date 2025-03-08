'use client'

import { Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap'
import {
  Bell,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import styles from './header.module.css'

export default function AdminHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [unreadNotifications] = useState(3) // 這裡可以接後端 API

  // 模擬通知數據
  const notifications = [
    {
      id: 1,
      title: '新訂單通知',
      content: '有新的訂單等待處理',
      time: '5 分鐘前',
      type: 'order',
      isRead: false,
    },
    {
      id: 2,
      title: '系統更新通知',
      content: '系統將在今晚進行維護更新',
      time: '1 小時前',
      type: 'system',
      isRead: false,
    },
    {
      id: 3,
      title: '新用戶註冊',
      content: '新會員註冊通知',
      time: '2 小時前',
      type: 'user',
      isRead: false,
    },
  ]

  // 模擬管理員資料
  const adminUser = {
    name: '管理員',
    email: 'admin@example.com',
    avatar: '/images/avatar.jpg', // 預設頭像
  }

  return (
    <Navbar className={`${styles.adminHeader} bg-white shadow-sm`}>
      <div className="d-flex justify-content-between align-items-center w-100 px-3">
        {/* 左側：前台連結 */}
        <Nav>
          <Link href="/" className="nav-link d-flex align-items-center gap-1">
            <Home size={18} />
            <span>前台首頁</span>
          </Link>
        </Nav>

        {/* 右側：功能選單 */}
        <Nav className="align-items-center gap-3">
          {/* 深色模式切換 */}
          <Nav.Item>
            <button
              className="btn btn-link nav-link p-0"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </Nav.Item>

          {/* 通知中心 */}
          <NavDropdown
            title={
              <div className="position-relative d-inline-block">
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <Badge 
                    bg="danger" 
                    className={`${styles.notificationBadge} rounded-circle`}
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
            }
            id="notification-dropdown"
            align="end"
          >
            <div className={styles.notificationMenu}>
              <div className="px-3 py-2 border-bottom">
                <h6 className="mb-0">通知中心</h6>
              </div>
              {notifications.map((notification) => (
                <NavDropdown.Item
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{notification.title}</div>
                      <div className="small text-muted">{notification.content}</div>
                      <div className="small text-muted">{notification.time}</div>
                    </div>
                    {!notification.isRead && (
                      <Badge bg="primary" className="ms-2">新</Badge>
                    )}
                  </div>
                </NavDropdown.Item>
              ))}
              <NavDropdown.Item className="text-center border-top">
                查看所有通知
              </NavDropdown.Item>
            </div>
          </NavDropdown>

          {/* 管理員選單 */}
          <NavDropdown
            title={
              <div className="d-flex align-items-center gap-2">
                <div className={styles.adminAvatar}>
                  <User size={18} />
                </div>
                <span className="d-none d-md-inline">{adminUser.name}</span>
              </div>
            }
            id="admin-dropdown"
            align="end"
          >
            <div className={styles.adminMenu}>
              <div className="px-3 py-2 border-bottom">
                <div className="fw-semibold">{adminUser.name}</div>
                <div className="small text-muted">{adminUser.email}</div>
              </div>
              <NavDropdown.Item href="/admin/settings/profile" className="d-flex align-items-center gap-2">
                <User size={16} />
                <span>個人資料</span>
              </NavDropdown.Item>
              <NavDropdown.Item href="/admin/settings" className="d-flex align-items-center gap-2">
                <Settings size={16} />
                <span>系統設定</span>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/admin/logout" className="d-flex align-items-center gap-2 text-danger">
                <LogOut size={16} />
                <span>登出</span>
              </NavDropdown.Item>
            </div>
          </NavDropdown>
        </Nav>
      </div>
    </Navbar>
  )
} 
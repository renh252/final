'use client'

import { User, Menu } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../ThemeContext'
import { useAdmin } from '../AdminContext'
import { Spinner } from 'react-bootstrap'
import AdminNotificationBell from './AdminNotificationBell'

// 提供一個簡單的結構，保持與實際組件相同的 DOM 結構
const HeaderSkeleton = () => (
  <header className="admin-header d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center">
      <div className="btn btn-link text-dark me-3"></div>
      <div className="mb-0 d-none d-sm-block"></div>
    </div>
    <div className="d-flex align-items-center"></div>
  </header>
)

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const { isDarkMode } = useTheme()
  const { admin, logout, isLoading } = useAdmin()

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  // 處理登出
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await logout()
  }

  // 如果不是客戶端，返回有相同結構的骨架
  if (!mounted) {
    return <HeaderSkeleton />
  }

  // 渲染頭部內容
  return (
    <header className="admin-header d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <button
          className={`btn btn-link ${
            isDarkMode ? 'text-light' : 'text-dark'
          } me-3`}
          onClick={toggleSidebar}
          type="button"
          aria-label="切換側邊欄"
        >
          <Menu size={24} />
        </button>
        <h5 className="mb-0 d-none d-sm-block">毛孩之家後台管理</h5>
      </div>

      <div className="d-flex align-items-center">
        <div className="me-3">
          <ThemeToggle />
        </div>

        <AdminNotificationBell />

        <div className="dropdown">
          <button
            className={`btn btn-link dropdown-toggle d-flex align-items-center ${
              isDarkMode ? 'text-light' : 'text-dark'
            }`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <User size={20} className="me-2" />
            )}
            <span className="d-none d-md-inline">
              {admin ? admin.account : '管理員'}
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <Link className="dropdown-item" href="/admin/settings/profile">
                個人資料
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/admin/settings">
                系統設定
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a
                className="dropdown-item text-danger"
                href="#"
                onClick={handleLogout}
              >
                登出
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

'use client'

import React, { useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './admin.css'
import Script from 'next/script'
import { ThemeProvider } from './ThemeContext'
import { ToastProvider } from '@/app/admin/_components/Toast'
import { ConfirmProvider } from '@/app/admin/_components/ConfirmDialog'
import Sidebar from '@/app/admin/_components/Sidebar'
import Header from '@/app/admin/_components/Header'
import Footer from '@/app/admin/_components/Footer'
import { useState, useEffect } from 'react'
import { AdminProvider } from './AdminContext'
import { usePathname } from 'next/navigation'

// 不需要權限檢查的路徑列表
const PUBLIC_PATHS = ['/admin/login']

// 特別的路徑，不需要統一布局處理（例如：登入頁、404頁等）
const EXCLUDE_LAYOUT_PATHS = ['/admin/login']

// 後台布局
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState('')
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // 使用 ref 來跟踪最新的 sidebarCollapsed 狀態
  const sidebarCollapsedRef = useRef(sidebarCollapsed)

  // 當 sidebarCollapsed 狀態變化時，更新 ref
  useEffect(() => {
    sidebarCollapsedRef.current = sidebarCollapsed
  }, [sidebarCollapsed])

  // 在客戶端環境中更新路徑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  // 檢查當前是否為公開頁面
  const isPublicPath = PUBLIC_PATHS.some((path) => currentPath === path)

  // 檢查是否需要特殊處理的頁面（不包含標準布局）
  const isExcludedPath = EXCLUDE_LAYOUT_PATHS.some(
    (path) => currentPath === path
  )

  // 確保組件只在客戶端渲染
  useEffect(() => {
    setMounted(true)

    // 標記為客戶端環境
    document.body.classList.add('admin-body')

    // 延遲關閉載入狀態，確保UI完全渲染
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => {
      clearTimeout(timer)
      document.body.classList.remove('admin-body')
    }
  }, [])

  // 檢測移動設備並處理響應式
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // 在移動設備上默認收起側邊欄 - 僅在初始化時執行
      if (mobile && !sidebarCollapsedRef.current) {
        setSidebarCollapsed(true)
        // 不需要更新 ref，因為 setSidebarCollapsed 會觸發上面的 useEffect
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, []) // 移除 sidebarCollapsed 依賴，避免多次觸發

  // 切換側邊欄
  const toggleSidebar = () => {
    // 在移動設備上，我們需要特別處理側邊欄的展開/收起
    if (isMobile) {
      // 在移動設備上，我們直接切換側邊欄的展開/收起狀態
      setSidebarCollapsed(!sidebarCollapsed)

      // 如果側邊欄正在展開，我們需要防止頁面滾動
      if (sidebarCollapsed) {
        document.body.style.overflow = 'hidden'
      } else {
        // 恢復頁面滾動
        document.body.style.overflow = ''
      }
    } else {
      // 在桌面設備上，保持原有的行為
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // 使用特定行業頁面設置，如果論壇管理未使用AdminPageLayout就自動添加
  // 例如，對於論壇管理等頁面，我們要確保它們的容器邊界保持緊湊
  const wrappedContent = isExcludedPath ? (
    children
  ) : (
    <div className="admin-layout-container">{children}</div>
  )

  return (
    <AdminProvider>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            {/* 全局載入狀態 */}
            {isLoading && (
              <div className="loading-placeholder">
                <div className="loading-spinner"></div>
              </div>
            )}

            {/* Bootstrap JS */}
            <Script
              src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
              strategy="afterInteractive"
            />

            {/* 如果是登入頁面，直接顯示內容，不顯示後台界面 */}
            {isPublicPath ? (
              <div className="public-admin-page">{children}</div>
            ) : (
              <div className="admin-wrapper">
                {/* 頭部 */}
                <div className="admin-header-wrapper">
                  <Header toggleSidebar={toggleSidebar} />
                </div>

                {/* 主容器 - 使用 100% 高度 */}
                <div className="admin-container">
                  {/* 側邊欄 */}
                  <div
                    className={`admin-sidebar ${
                      sidebarCollapsed ? 'collapsed' : ''
                    } ${isMobile && !sidebarCollapsed ? 'open' : ''}`}
                  >
                    <Sidebar
                      collapsed={sidebarCollapsed}
                      onToggle={toggleSidebar}
                    />
                  </div>

                  {/* 主內容 */}
                  <div className="admin-content">
                    {/* 移動設備上的遮罩層 */}
                    <div
                      className={`mobile-overlay ${
                        isMobile && !sidebarCollapsed ? 'active' : ''
                      }`}
                      onClick={() => setSidebarCollapsed(true)}
                    />

                    {/* 內容包裝器 - 確保適當的滾動行為 */}
                    <div className="content-wrapper">
                      {/* 主要內容 */}
                      <div className="content-area">{wrappedContent}</div>

                      {/* 頁腳 - 總是顯示在內容後面 */}
                      <div className="admin-footer-wrapper">
                        <Footer />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </AdminProvider>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'
// 直接導入組件，而不是動態加載
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import { usePathname } from 'next/navigation'
import { ThemeProvider, useTheme } from './ThemeContext'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'

// 加載器元件 - 專門用於內容區域
const ContentLoader = () => {
  const { isDarkMode } = useTheme()

  return (
    <div
      className="content-loading-placeholder"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode
          ? 'rgba(33, 37, 41, 0.7)'
          : 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="loading-spinner-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div className="loading-spinner"></div>
        <div style={{ color: isDarkMode ? '#fff' : '#333', fontSize: '14px' }}>
          載入中...
        </div>
      </div>
    </div>
  )
}

// 初始頁面加載器 - 用於整個頁面首次加載
const InitialLoader = () => (
  <div className="loading-placeholder">
    <div className="loading-spinner"></div>
  </div>
)

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)

  // 處理初始載入狀態
  useEffect(() => {
    document.body.classList.add('admin-body')

    // 極短的延遲後完成初始載入，確保 header 和側邊欄快速顯示
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.body.classList.remove('admin-body')
    }
  }, [])

  // 監測路徑變化，顯示內容載入狀態
  useEffect(() => {
    if (pathname !== prevPathname) {
      // 路徑變化時顯示載入動畫
      setIsContentLoading(true)
      setPrevPathname(pathname)

      // 短暫延遲後隱藏載入動畫
      const timer = setTimeout(() => {
        setIsContentLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [pathname, prevPathname])

  // 響應式處理
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // 在移動設備上默認收起側邊欄
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true)
      }
    }

    // 初始化和窗口大小變化時檢測
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed])

  // 切換側邊欄函數
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  // 如果是初始加載，顯示簡單的加載器
  if (isInitialLoading) {
    return (
      <ThemeProvider>
        <InitialLoader />
      </ThemeProvider>
    )
  }

  // 主佈局渲染
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          {/* Bootstrap JS */}
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
            strategy="afterInteractive"
          />

          <div className="admin-wrapper">
            {/* 頭部 - 直接渲染，確保立即顯示 */}
            <div className="admin-header-wrapper">
              <Header toggleSidebar={toggleSidebar} />
            </div>

            <div className="admin-container">
              {/* 側邊欄 */}
              <div
                className={`admin-sidebar ${
                  sidebarCollapsed ? 'collapsed' : ''
                } ${isMobile && !sidebarCollapsed ? 'open' : ''}`}
              >
                <Sidebar collapsed={sidebarCollapsed} />
              </div>

              {/* 移動設備遮罩層 */}
              {isMobile && !sidebarCollapsed && (
                <div
                  className="mobile-overlay"
                  onClick={toggleSidebar}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1040,
                  }}
                />
              )}

              {/* 內容區域 - 只在內容區域顯示載入動畫 */}
              <div className="admin-content" style={{ position: 'relative' }}>
                {isContentLoading && <ContentLoader />}
                <div key={pathname}>{children}</div>
              </div>
            </div>

            {/* 頁腳 - 直接渲染 */}
            <div className="admin-footer-wrapper">
              <Footer />
            </div>
          </div>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

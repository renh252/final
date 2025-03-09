'use client'

import React from 'react'
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

// 後台布局
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // 檢查當前是否為公開頁面
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path)

  // 處理載入狀態和客戶端初始化
  useEffect(() => {
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

      // 在移動設備上默認收起側邊欄
      if (mobile && !sidebarCollapsed) setSidebarCollapsed(true)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed])

  // 切換側邊欄
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

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

                <div className="admin-container">
                  {/* 側邊欄 */}
                  <div
                    className={`admin-sidebar ${
                      sidebarCollapsed ? 'collapsed' : ''
                    } ${isMobile && !sidebarCollapsed ? 'open' : ''}`}
                  >
                    <Sidebar collapsed={sidebarCollapsed} />
                  </div>

                  {/* 主內容 */}
                  <div className="admin-content">
                    {/* 移動設備上的遮罩層 */}
                    {isMobile && !sidebarCollapsed && (
                      <div
                        className="mobile-overlay"
                        onClick={() => setSidebarCollapsed(true)}
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

                    {/* 主要內容 */}
                    {children}
                  </div>
                </div>

                {/* 頁腳 */}
                <div className="admin-footer-wrapper">
                  <Footer />
                </div>
              </div>
            )}
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </AdminProvider>
  )
}

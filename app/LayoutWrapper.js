'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Menubar from './_components/menubar'
import Footer from './_components/footer'
import Banner from './_components/banner'
import { Container } from 'react-bootstrap'
import RouteGuard from './_components/RouteGuard'
import { requiresAuth } from './config/routes'
import { useAuth } from './context/AuthContext'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdminRoute = pathname?.startsWith('/admin')
  const { user, loading, isAuthenticated } = useAuth()
  const [authorized, setAuthorized] = useState(false)

  // 使用useEffect來動態調整body樣式，只在前台路由才執行
  useEffect(() => {
    if (isAdminRoute) {
      // 後台路由 - 移除前台樣式影響
      document.documentElement.style.paddingTop = '0'
      document.body.style.paddingTop = '0'
    } else {
      // 前台路由 - 恢復原有樣式
      document.documentElement.style.paddingTop = '28px'
      document.body.style.paddingTop = '28px'
    }

    // 清理函數
    return () => {
      document.documentElement.style.paddingTop = ''
      document.body.style.paddingTop = ''
    }
  }, [isAdminRoute])

  // 內建中間件機制：檢查路由權限
  useEffect(() => {
    if (!loading) {
      // 檢查當前路徑是否需要身份驗證
      const needsAuth = requiresAuth(pathname)

      if (needsAuth && !user) {
        // 需要登入但未登入，重定向到登入頁面
        setAuthorized(false)
        router.push('/member/MemberLogin/login')
      } else {
        // 不需要登入或已登入，允許訪問
        setAuthorized(true)
      }
    }
  }, [pathname, user, loading, router])

  // 如果正在加載用戶數據，顯示加載中
  if (loading) {
    return <div>載入中...</div>
  }

  // 如果未授權，不顯示任何內容 (已在上面的 useEffect 中處理重定向)
  if (!authorized) {
    return null
  }

  // 如果是後台路由，直接返回（不需要額外的 RouteGuard）
  if (isAdminRoute) {
    return children
  }

  // 如果是前台路由，渲染完整佈局（不需要額外的 RouteGuard）
  return (
    <>
      <Menubar />
      <Banner />
      <Container fluid="lg" className="flex-grow-1 px-3 py-4">
        {children}
      </Container>
      <Footer />
    </>
  )
}

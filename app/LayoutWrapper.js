'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Menubar from './_components/menubar'
import Footer from './_components/footer'
import Banner from './_components/banner'
import { Container } from 'react-bootstrap'
import RouteGuard from './_components/RouteGuard'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

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

  // 如果是後台路由，直接返回（帶有路由保護）
  if (isAdminRoute) {
    // 後台路由也需要權限保護
    return <RouteGuard>{children}</RouteGuard>
  }

  // 如果是前台路由，渲染完整佈局（帶有路由保護）
  return (
    <RouteGuard>
      <Menubar />
      <Banner />
      <Container fluid="lg" className="flex-grow-1 px-3 py-4">
        {children}
      </Container>
      <Footer />
    </RouteGuard>
  )
}

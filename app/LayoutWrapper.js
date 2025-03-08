'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Menubar from './_components/menubar'
import Footer from './_components/footer'
import Banner from './_components/banner'
import { Container } from 'react-bootstrap'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // 使用useEffect來動態調整body樣式
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

  // 如果是後台路由，只渲染子元素
  if (isAdminRoute) {
    return <>{children}</>
  }

  // 如果是前台路由，渲染完整佈局
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

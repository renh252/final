'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import Menubar from './_components/menubar'
import Footer from './_components/footer'
import Banner from './_components/banner'
import FloatingAction from './_components/FloatingAction'
import { Container } from 'react-bootstrap'
import { requiresAuth } from './config/routes'
import { useAuth } from './context/AuthContext'
import { TitleProvider } from './context/TitleContext'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isAdminRoute = pathname?.startsWith('/admin')
  const { user, loading } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('正在驗證，請稍候...')

  // 封裝跳轉到登入頁面的方法，使用 router.push 但確保穩定性
  const redirectToLogin = useCallback(() => {
    const loginPath = '/member/MemberLogin/login'

    // 保存當前完整路徑，包含搜尋參數，以便登入後可以返回
    if (pathname) {
      // 構建完整 URL，包含搜尋參數
      const fullPath = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname

      // 儲存完整路徑到 sessionStorage
      sessionStorage.setItem('redirectAfterLogin', fullPath)
    }

    // 更新加載訊息
    setLoadingMessage('正在跳轉至登入頁面...')

    // 使用 Next.js router，但確保路由跳轉穩定性
    router.push(loginPath)
  }, [pathname, searchParams, router])

  // 使用useEffect來動態調整body樣式，只在前台路由才執行
  useEffect(() => {
    if (isAdminRoute) {
      // 後台路由 - 移除前台樣式影響
      document.documentElement.style.paddingTop = '0'
      document.body.style.paddingTop = '0'
    } else {
      // 前台路由 - 不再需要padding-top
      document.documentElement.style.paddingTop = '0'
      document.body.style.paddingTop = '0'
    }

    // 清理函數
    return () => {
      document.documentElement.style.paddingTop = ''
      document.body.style.paddingTop = ''
    }
  }, [isAdminRoute])

  // 內建中間件機制：檢查路由權限
  useEffect(() => {
    // 確保登入狀態已加載完成
    if (loading) {
      setLoadingMessage('載入用戶資訊...')
      return
    }

    setIsChecking(true)
    setLoadingMessage('檢查頁面權限...')

    // 處理空路徑情況
    if (!pathname) {
      setIsChecking(false)
      return
    }

    // 務必移除查詢參數，確保路徑檢查正確
    const pathWithoutQuery = pathname.split('?')[0]

    try {
      // 檢查當前路徑是否需要身份驗證 (通過 config/routes.js)
      const needsAuth = requiresAuth(pathWithoutQuery)

      if (needsAuth && !user) {
        // 需要登入但未登入，重定向到登入頁面
        setAuthorized(false)
        setLoadingMessage('需要登入，準備轉跳...')

        // 延遲極短時間進行重定向，避免組件渲染閃動
        requestAnimationFrame(() => {
          redirectToLogin()
        })
      } else {
        // 不需要登入或已登入，允許訪問
        setAuthorized(true)
      }
    } catch (error) {
      console.error('權限檢查出錯:', error)
      // 發生錯誤時的安全策略：拒絕訪問並重定向
      setAuthorized(false)
      setLoadingMessage('權限檢查發生錯誤，轉跳至登入頁面...')
      redirectToLogin()
    }

    setIsChecking(false)
  }, [pathname, user, loading, redirectToLogin])

  // 渲染內容區域，根據授權狀態決定顯示內容或加載提示
  const renderContent = () => {
    // 如果正在加載用戶數據或檢查權限中，顯示加載提示
    if (loading || (isChecking && !authorized)) {
      return <div className="auth-loading" data-text={loadingMessage}></div>
    }

    // 如果未授權但已檢查完畢，顯示簡潔提示（實際上會自動跳轉，這只是防止閃爍）
    if (!authorized && !isChecking) {
      return <div className="auth-loading" data-text={loadingMessage}></div>
    }

    // 正常顯示頁面內容
    return children
  }

  // 如果是後台路由，直接返回
  if (isAdminRoute) {
    return <TitleProvider>{children}</TitleProvider>
  }

  // 前台路由，使用標準佈局，但只在內容區域應用加載/權限效果
  return (
    <TitleProvider>
      <Menubar />
      <Banner />
      {pathname === '/' || pathname === '/home' ? (
        // 根路由不要套用 container，直接顯示內容
        <>{renderContent()}</>
      ) : (
        // 其他頁面(包括/home)維持 container 包裹
        <Container fluid="lg" className="flex-grow-1 px-3 py-4">
          {renderContent()}
        </Container>
      )}

      <Footer />
      <FloatingAction />
    </TitleProvider>
  )
}

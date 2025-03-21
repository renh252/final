'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { requiresAuth } from '@/app/config/routes'

// 路由保護組件
export default function RouteGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // 檢查認證狀態
    const checkAuth = () => {
      // 使用路由配置文件中的函數檢查是否需要認證
      const needsAuth = requiresAuth(pathname)

      if (needsAuth && !user) {
        setAuthorized(false)
        router.push('/member/MemberLogin/login')
      } else {
        setAuthorized(true)
      }
    }

    if (!loading) {
      checkAuth()
    }
  }, [pathname, user, loading, router])

  // 當頁面處於加載狀態或未授權時，可以顯示加載畫面
  if (loading) {
    return <div>載入中...</div>
  }

  // 如果已授權，則顯示子組件
  return authorized ? children : null
}

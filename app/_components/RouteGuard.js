'use client'

import React from 'react'
import { useAuth } from '@/app/context/AuthContext'

// 簡化版路由保護組件，僅用於處理加載狀態
export default function RouteGuard({ children }) {
  const { loading } = useAuth()

  // 當頁面處於加載狀態時，顯示加載畫面
  if (loading) {
    return <div>載入中...</div>
  }

  // 授權邏輯已移至 LayoutWrapper，這裡只處理子組件渲染
  return children
}

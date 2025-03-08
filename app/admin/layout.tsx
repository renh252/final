import React from 'react'
import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import './admin.css'

// 設定 metadata
export const metadata: Metadata = {
  title: '後台管理系統',
  description: '毛孩之家後台管理系統',
}

// 設定動態渲染
export const dynamic = 'force-dynamic'

// 後台布局
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout" suppressHydrationWarning>
      {children}
    </div>
  )
}

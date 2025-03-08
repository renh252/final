'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  ShoppingBag,
  PawPrint,
  MessageSquare,
  DollarSign,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../ThemeContext'

// 提供一個簡單的結構，保持與實際組件相同的 DOM 結構
const SidebarSkeleton = () => (
  <div className="p-3">
    <div className="sidebar-header mb-4"></div>
    <nav>
      <ul className="nav flex-column gap-1 list-unstyled"></ul>
    </nav>
  </div>
)

export default function Sidebar({ collapsed = false }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { isDarkMode } = useTheme()

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  // 獲取圖標顏色
  const getIconColor = () =>
    isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#212529'

  // 如果不是客戶端，返回有相同結構的骨架
  if (!mounted) {
    return <SidebarSkeleton />
  }

  // 菜單項定義
  const menuItems = [
    {
      icon: <Home size={20} color={getIconColor()} />,
      label: '儀表板',
      path: '/admin',
    },
    {
      icon: <Users size={20} color={getIconColor()} />,
      label: '會員管理',
      path: '/admin/members',
    },
    {
      icon: <ShoppingBag size={20} color={getIconColor()} />,
      label: '商城管理',
      path: '/admin/shop',
    },
    {
      icon: <PawPrint size={20} color={getIconColor()} />,
      label: '寵物管理',
      path: '/admin/pets',
    },
    {
      icon: <MessageSquare size={20} color={getIconColor()} />,
      label: '論壇管理',
      path: '/admin/forum',
    },
    {
      icon: <DollarSign size={20} color={getIconColor()} />,
      label: '金流管理',
      path: '/admin/finance',
    },
    {
      icon: <Settings size={20} color={getIconColor()} />,
      label: '系統設定',
      path: '/admin/settings',
    },
  ]

  // 渲染側邊欄內容
  return (
    <div className="p-3">
      <div className="sidebar-header mb-4">
        {!collapsed && (
          <h5 className={`m-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            毛孩之家管理系統
          </h5>
        )}
        {collapsed && (
          <div className="text-center">
            <Home size={24} color={isDarkMode ? 'white' : '#212529'} />
          </div>
        )}
      </div>

      <nav>
        <ul className="nav flex-column gap-1 list-unstyled">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`sidebar-nav-link ${
                  pathname === item.path ? 'active' : ''
                }`}
                title={collapsed ? item.label : ''}
              >
                <span className={collapsed ? 'mx-auto' : 'me-3'}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

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
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/app/admin/ThemeContext'

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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )
  const pathname = usePathname()
  const { isDarkMode } = useTheme()

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)

    // 展開當前路徑的菜單
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      setExpandedMenus((prev) => ({
        ...prev,
        [segments[1]]: true,
      }))
    }
  }, [pathname])

  // 獲取圖標顏色
  const getIconColor = () =>
    isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#212529'

  // 切換子菜單展開狀態
  const toggleSubmenu = (key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

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
      subItems: [
        { label: '論壇概覽', path: '/admin/forum' },
        { label: '文章管理', path: '/admin/forum/articles' },
        { label: '檢舉管理', path: '/admin/forum/reports' },
      ],
    },
    {
      icon: <DollarSign size={20} color={getIconColor()} />,
      label: '金流管理',
      path: '/admin/finance',
      subItems: [
        { label: '財務概覽', path: '/admin/finance/dashboard' },
        { label: '交易記錄', path: '/admin/finance/transactions' },
        { label: '捐款記錄', path: '/admin/finance/transactions/donations' },
        { label: '支付管理', path: '/admin/finance/payments' },
      ],
    },
    {
      icon: <Settings size={20} color={getIconColor()} />,
      label: '系統設定',
      path: '/admin/settings',
      subItems: [
        { label: '一般設定', path: '/admin/settings' },
        { label: '角色管理', path: '/admin/settings/roles' },
        { label: '系統日誌', path: '/admin/settings/logs' },
      ],
    },
  ]

  // 檢查路徑是否活動
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

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
            <li key={item.path} className="mb-1">
              {item.subItems ? (
                <>
                  <button
                    className={`sidebar-nav-link w-100 text-start border-0 ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <span className={collapsed ? 'mx-auto' : 'me-3'}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-grow-1">{item.label}</span>
                        {expandedMenus[item.label] ? (
                          <ChevronDown size={16} color={getIconColor()} />
                        ) : (
                          <ChevronRight size={16} color={getIconColor()} />
                        )}
                      </>
                    )}
                  </button>
                  {!collapsed && expandedMenus[item.label] && (
                    <ul className="nav flex-column list-unstyled ps-4 mt-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            className={`sidebar-nav-link py-1 ${
                              isActive(subItem.path) ? 'active' : ''
                            }`}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={`sidebar-nav-link ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className={collapsed ? 'mx-auto' : 'me-3'}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

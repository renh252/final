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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useAdmin } from '@/app/admin/AdminContext'

// 提供一個簡單的結構，保持與實際組件相同的 DOM 結構
const SidebarSkeleton = () => (
  <div className="p-3">
    <div className="sidebar-header mb-4"></div>
    <nav>
      <ul className="nav flex-column gap-1 list-unstyled"></ul>
    </nav>
  </div>
)

interface MenuItem {
  icon: React.ReactNode
  label: string
  path: string
  requiredPrivilege?: string | string[]
  subItems?: {
    label: string
    path: string
    requiredPrivilege?: string | string[]
  }[]
}

export default function Sidebar({ collapsed = false }) {
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )
  const pathname = usePathname()
  const { isDarkMode } = useTheme()
  const { admin, hasPermission } = useAdmin()

  // 獲取圖標顏色
  const getIconColor = () =>
    isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#212529'

  // 菜單項定義
  const menuItems: MenuItem[] = [
    {
      icon: <Home size={20} color={getIconColor()} />,
      label: '儀表板',
      path: '/admin',
    },
    {
      icon: <Users size={20} color={getIconColor()} />,
      label: '會員管理',
      path: '/admin/members',
      requiredPrivilege: 'member',
    },
    {
      icon: <ShoppingBag size={20} color={getIconColor()} />,
      label: '商城管理',
      path: '/admin/shop',
      requiredPrivilege: 'shop',
    },
    {
      icon: <PawPrint size={20} color={getIconColor()} />,
      label: '寵物管理',
      path: '/admin/pets',
      requiredPrivilege: 'pet',
    },
    {
      icon: <MessageSquare size={20} color={getIconColor()} />,
      label: '論壇管理',
      path: '/admin/forum',
      requiredPrivilege: 'post',
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
      requiredPrivilege: 'donation',
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
      requiredPrivilege: '111', // 只有超級管理員可以訪問
      subItems: [
        { label: '一般設定', path: '/admin/settings' },
        { label: '角色管理', path: '/admin/settings/roles' },
        { label: '系統日誌', path: '/admin/settings/logs' },
      ],
    },
  ]

  // 根據權限過濾菜單項
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.requiredPrivilege) return true // 沒有權限要求，所有人可見
    return hasPermission(item.requiredPrivilege)
  })

  // 切換子菜單展開狀態
  const toggleSubmenu = (key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)

    // 展開當前路徑的菜單
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      // 查找當前路徑匹配的菜單項
      menuItems.forEach((item) => {
        if (item.subItems && item.path.includes(`/${segments[1]}`)) {
          setExpandedMenus((prev) => ({
            ...prev,
            [item.label]: true,
          }))
        }
      })
    }
  }, [pathname])

  // 檢查路徑是否活動
  const isActive = (path: string) => {
    // 精確匹配優先
    if (pathname === path) {
      return true
    }

    // 儀表板只在精確匹配時高亮
    if (path === '/admin' && pathname !== '/admin') {
      return false
    }

    // 對於子頁面，只有當前路徑是直接子頁面時才高亮
    // 例如：/admin/finance/transactions/donations 只會高亮 donations，而不會高亮 transactions
    const pathParts = path.split('/')
    const currentParts = pathname.split('/')

    // 檢查是否為直接父路徑（差一級）
    if (pathParts.length === currentParts.length - 1) {
      return currentParts.slice(0, pathParts.length).join('/') === path
    }

    // 對於其他情況，檢查是否為父路徑
    return pathname.startsWith(`${path}/`)
  }

  // 如果不是客戶端，返回有相同結構的骨架
  if (!mounted) {
    return <SidebarSkeleton />
  }

  // 渲染側邊欄內容
  return (
    <div className="p-3">
      <nav>
        <ul className="nav flex-column gap-1 list-unstyled">
          {filteredMenuItems.map((item) => (
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
                        <span
                          className={`sidebar-chevron ${
                            expandedMenus[item.label] ? 'expanded' : ''
                          }`}
                        >
                          {expandedMenus[item.label] ? (
                            <ChevronDown
                              size={16}
                              color={
                                isActive(item.path) ? 'white' : getIconColor()
                              }
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                              color={
                                isActive(item.path) ? 'white' : getIconColor()
                              }
                            />
                          )}
                        </span>
                      </>
                    )}
                  </button>
                  {!collapsed && expandedMenus[item.label] && (
                    <ul className="nav flex-column list-unstyled ps-4 mt-1 sidebar-submenu">
                      {item.subItems
                        .filter((subItem) => {
                          if (!subItem.requiredPrivilege) return true
                          return hasPermission(subItem.requiredPrivilege)
                        })
                        .map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              href={subItem.path}
                              className={`sidebar-nav-link py-1 ${
                                pathname === subItem.path ? 'active' : ''
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

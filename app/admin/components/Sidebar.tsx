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
import { useEffect, useState, useCallback } from 'react'
import { useTheme } from '@/app/admin/ThemeContext'

// 側邊欄骨架，用於首次渲染前顯示
const SidebarSkeleton = () => (
  <div className="p-3">
    <div className="sidebar-header mb-4"></div>
    <nav>
      <ul className="nav flex-column gap-1 list-unstyled"></ul>
    </nav>
  </div>
)

// 簡化的子選單項組件
const SubMenuItem = ({
  path,
  label,
  isActive,
}: {
  path: string
  label: string
  isActive: boolean
}) => (
  <Link
    href={path}
    className={`sidebar-nav-link py-1 ${isActive ? 'active' : ''}`}
    prefetch={true}
    scroll={false}
  >
    <span>{label}</span>
  </Link>
)

// 菜單數據定義，提取為常量
const getMenuItems = (iconColor: string) => [
  {
    key: 'dashboard',
    icon: <Home size={20} color={iconColor} />,
    label: '儀表板',
    path: '/admin',
  },
  {
    key: 'members',
    icon: <Users size={20} color={iconColor} />,
    label: '會員管理',
    path: '/admin/members',
  },
  {
    key: 'shop',
    icon: <ShoppingBag size={20} color={iconColor} />,
    label: '商城管理',
    path: '/admin/shop',
    subItems: [
      { key: 'products', label: '商品列表', path: '/admin/shop/products' },
      { key: 'orders', label: '訂單管理', path: '/admin/shop/orders' },
    ],
  },
  {
    key: 'pets',
    icon: <PawPrint size={20} color={iconColor} />,
    label: '寵物管理',
    path: '/admin/pets',
  },
  {
    key: 'forum',
    icon: <MessageSquare size={20} color={iconColor} />,
    label: '論壇管理',
    path: '/admin/forum',
    subItems: [
      { key: 'overview', label: '論壇概覽', path: '/admin/forum' },
      { key: 'articles', label: '文章管理', path: '/admin/forum/articles' },
      { key: 'reports', label: '檢舉管理', path: '/admin/forum/reports' },
    ],
  },
  {
    key: 'finance',
    icon: <DollarSign size={20} color={iconColor} />,
    label: '金流管理',
    path: '/admin/finance',
    subItems: [
      { key: 'dashboard', label: '財務概覽', path: '/admin/finance/dashboard' },
      {
        key: 'transactions',
        label: '交易記錄',
        path: '/admin/finance/transactions',
      },
      {
        key: 'donations',
        label: '捐款記錄',
        path: '/admin/finance/transactions/donations',
      },
      { key: 'payments', label: '支付管理', path: '/admin/finance/payments' },
    ],
  },
  {
    key: 'settings',
    icon: <Settings size={20} color={iconColor} />,
    label: '系統設定',
    path: '/admin/settings',
    subItems: [
      { key: 'general', label: '一般設定', path: '/admin/settings' },
      { key: 'roles', label: '角色管理', path: '/admin/settings/roles' },
      { key: 'logs', label: '系統日誌', path: '/admin/settings/logs' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
}

// 簡化的側邊欄組件
export default function Sidebar({ collapsed = false }: SidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )
  const pathname = usePathname()
  const { isDarkMode } = useTheme()

  // 確保只在客戶端渲染並初始展開對應選單
  useEffect(() => {
    setMounted(true)

    // 初始展開當前所在的菜單
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      setExpandedMenus((prev) => ({
        ...prev,
        [segments[1]]: true,
      }))
    }
  }, [])

  // 檢查路徑是否活動
  const isActive = useCallback(
    (path: string) => {
      if (path === '/admin' && pathname === '/admin') return true
      if (path !== '/admin' && pathname.startsWith(path)) return true
      return false
    },
    [pathname]
  )

  // 切換子菜單展開狀態
  const toggleSubmenu = useCallback((key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  // 如果未掛載完成，返回骨架
  if (!mounted) {
    return <SidebarSkeleton />
  }

  // 獲取圖標顏色
  const iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#212529'

  // 取得菜單項
  const menuItems = getMenuItems(iconColor)

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
          {menuItems.map((item) => {
            const active = isActive(item.path)
            const expanded = expandedMenus[item.key]

            return (
              <li key={item.key} className="mb-1">
                {item.subItems ? (
                  <>
                    <button
                      className={`sidebar-nav-link w-100 text-start border-0 ${
                        active ? 'active' : ''
                      }`}
                      onClick={() => toggleSubmenu(item.key)}
                    >
                      <span className={collapsed ? 'mx-auto' : 'me-3'}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-grow-1">{item.label}</span>
                          {expanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </>
                      )}
                    </button>

                    {item.subItems && !collapsed && expanded && (
                      <ul className="nav flex-column list-unstyled ps-4 mt-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.key}>
                            <SubMenuItem
                              path={subItem.path}
                              label={subItem.label}
                              isActive={isActive(subItem.path)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`sidebar-nav-link ${active ? 'active' : ''}`}
                    title={collapsed ? item.label : ''}
                    prefetch={true}
                    scroll={false}
                  >
                    <span className={collapsed ? 'mx-auto' : 'me-3'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

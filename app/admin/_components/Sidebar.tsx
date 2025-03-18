'use client'

import React from 'react'
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
  Shield,
} from 'lucide-react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useAdmin } from '@/app/admin/AdminContext'
import { getManagerPermissions } from '@/app/admin/_lib/permissions'
import PermissionDebug, {
  setDebugInstance,
  openPermissionDebug,
} from './PermissionDebug'

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

// 避免反覆重載權限的標誌
let permissionCheckPending = false

// 追蹤已處理的權限格式
const handledPermFormats = new Set<string>()

export default function Sidebar({ collapsed = false, onToggle }) {
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )
  const [currentPath, setCurrentPath] = useState<string>('')
  const [debugMode, setDebugMode] = useState(false)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const pathname = usePathname()
  const { isDarkMode } = useTheme()
  const {
    admin,
    isLoading,
    isAuthChecking,
    cachedPermissions,
    hasPermission,
    preloadPermissions,
  } = useAdmin()

  // 監控管理員和權限緩存狀態
  useEffect(() => {
    if (mounted && admin && !permissionCheckPending) {
      permissionCheckPending = true
      // 避免在渲染週期中直接調用狀態更新函數
      setTimeout(() => {
        // 檢查非標準權限格式，但只處理一次
        if (
          admin.manager_privileges &&
          !handledPermFormats.has(admin.manager_privileges) &&
          admin.manager_privileges !== '111' &&
          !admin.manager_privileges.includes(':')
        ) {
          handledPermFormats.add(admin.manager_privileges)

          // 清除無效的緩存並重新載入
          localStorage.removeItem('admin_permissions')
          preloadPermissions()
        }
        permissionCheckPending = false
      }, 0)
    }
  }, [admin, mounted, preloadPermissions])

  // 確保初次加載時權限正確處理
  useEffect(() => {
    if (mounted && admin) {
      // 如果管理員已加載但權限緩存為空，則嘗試預載入權限
      if (cachedPermissions.length === 0 && !permissionCheckPending) {
        permissionCheckPending = true
        setTimeout(() => {
          // 強制重新載入權限
          preloadPermissions()
          permissionCheckPending = false
        }, 0)
      }
    }
  }, [admin, cachedPermissions, mounted, preloadPermissions])

  // 組件掛載完成
  useEffect(() => {
    setMounted(true)
  }, [])

  // 設置診斷工具實例
  useEffect(() => {
    setDebugInstance({
      open: () => setIsDebugOpen(true),
      close: () => setIsDebugOpen(false),
    })
  }, [])

  // 獲取圖標顏色
  const getIconColor = useCallback(
    () => (isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#212529'),
    [isDarkMode]
  )

  // 菜單項定義 - 僅使用新格式權限
  const menuItems = useMemo(() => {
    return [
      {
        icon: <Home size={20} color={getIconColor()} />,
        label: '儀表板',
        path: '/admin',
      },
      {
        icon: <Users size={20} color={getIconColor()} />,
        label: '會員管理',
        path: '/admin/members',
        requiredPrivilege: 'members:read',
      },
      {
        icon: <ShoppingBag size={20} color={getIconColor()} />,
        label: '商城管理',
        path: '/admin/shop',
        requiredPrivilege: 'shop:read',
        subItems: [
          { label: '商城概覽', path: '/admin/shop' },
          {
            label: '商品管理',
            path: '/admin/shop/products',
            requiredPrivilege: 'shop:products:read',
          },
          {
            label: '訂單管理',
            path: '/admin/shop/orders',
            requiredPrivilege: 'shop:orders:read',
          },
          {
            label: '商品分類',
            path: '/admin/shop/categories',
            requiredPrivilege: 'shop:categories:read',
          },
          {
            label: '優惠券管理',
            path: '/admin/shop/coupons',
            requiredPrivilege: 'shop:coupons:read',
          },
        ],
      },
      {
        icon: <PawPrint size={20} color={getIconColor()} />,
        label: '寵物管理',
        path: '/admin/pets',
        requiredPrivilege: 'pets:read',
        subItems: [
          { label: '寵物列表', path: '/admin/pets' },
          {
            label: '預約管理',
            path: '/admin/pets/appointments',
            requiredPrivilege: 'pets:appointments:read',
          },
        ],
      },
      {
        icon: <MessageSquare size={20} color={getIconColor()} />,
        label: '論壇管理',
        path: '/admin/forum',
        requiredPrivilege: 'forum:read',
        subItems: [
          { label: '論壇概覽', path: '/admin/forum' },
          {
            label: '文章管理',
            path: '/admin/forum/articles',
            requiredPrivilege: 'forum:articles:read',
          },
          {
            label: '檢舉管理',
            path: '/admin/forum/reports',
            requiredPrivilege: 'forum:reports:read',
          },
        ],
      },
      {
        icon: <DollarSign size={20} color={getIconColor()} />,
        label: '金流管理',
        path: '/admin/finance',
        requiredPrivilege: 'finance:read',
        subItems: [
          { label: '金流概覽', path: '/admin/finance' },
          {
            label: '財務儀表板',
            path: '/admin/finance/dashboard',
            requiredPrivilege: 'finance:read',
          },
          {
            label: '交易管理',
            path: '/admin/finance/transactions',
            requiredPrivilege: 'finance:transactions:read',
          },
          {
            label: '捐款記錄',
            path: '/admin/finance/transactions/donations',
            requiredPrivilege: 'finance:transactions:read',
          },
          {
            label: '支付設定',
            path: '/admin/finance/payments',
            requiredPrivilege: 'finance:payments:read',
          },
        ],
      },
      {
        icon: <Settings size={20} color={getIconColor()} />,
        label: '系統設定',
        path: '/admin/settings',
        requiredPrivilege: ['111', 'settings:read'],
        subItems: [
          { label: '一般設定', path: '/admin/settings' },
          {
            label: '角色管理',
            path: '/admin/settings/roles',
            requiredPrivilege: 'settings:roles:read',
          },
          {
            label: '系統日誌',
            path: '/admin/settings/logs',
            requiredPrivilege: 'settings:logs:read',
          },
        ],
      },
      // 權限診斷菜單項 - 僅在偵錯模式時顯示
      ...(debugMode
        ? [
            {
              icon: <Shield size={20} color={getIconColor()} />,
              label: '權限診斷',
              path: '/admin/permissions-debug',
            },
          ]
        : []),
    ]
  }, [getIconColor, debugMode])

  // 根據權限過濾菜單項
  const filteredMenuItems = useMemo(() => {
    if (!mounted || !admin) {
      return menuItems.filter((item) => !item.requiredPrivilege)
    }

    return menuItems.filter((item) => {
      // 沒有權限要求，所有人可見
      if (!item.requiredPrivilege) {
        return true
      }

      // 權限診斷功能始終可見
      if (item.label === '權限診斷') {
        return true
      }

      try {
        // 檢查是否為超級管理員 - 超級管理員可以看到所有菜單
        if (admin.manager_privileges === '111') {
          return true
        }

        // 檢查權限並返回結果
        return hasPermission(item.requiredPrivilege)
      } catch (error) {
        console.error(`檢查菜單項 "${item.label}" 權限時出錯:`, error)
        return false
      }
    })
  }, [menuItems, mounted, admin, hasPermission])

  // 切換偵錯模式
  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
  }

  // 切換子菜單展開狀態
  const toggleSubmenu = (key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // 處理鏈接點擊事件
  const handleLinkClick = (e) => {
    // 如果側邊欄已收起，則展開側邊欄
    if (collapsed) {
      e.preventDefault() // 阻止默認導航行為
      onToggle() // 調用父組件傳入的切換函數

      // 在移動設備上，我們需要延遲導航，以便用戶能夠看到展開的側邊欄
      // 使用setTimeout延遲導航，給側邊欄足夠的時間展開
      const href = e.currentTarget.getAttribute('href')
      if (href) {
        setTimeout(() => {
          // 使用window.location.href而不是router.push，確保頁面完全重新加載
          // 這樣可以避免React的狀態管理導致側邊欄閃現後消失
          window.location.href = href
        }, 300) // 300毫秒的延遲，與側邊欄的過渡動畫時間相匹配
      }

      return false
    }
  }

  // 在客戶端環境中更新路徑
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  // 在客戶端環境中展開當前路徑的菜單
  useEffect(() => {
    if (!mounted) return

    const segments = pathname?.split('/').filter(Boolean) || []
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
  }, [pathname, mounted, menuItems])

  // 雙擊事件處理
  const handleVersionDoubleClick = useCallback(() => {
    setIsDebugOpen(true)
  }, [])

  // 如果尚未掛載，返回骨架屏
  if (!mounted) {
    return <SidebarSkeleton />
  }

  // 檢查當前路徑是否匹配
  const isActive = (path: string) => {
    if (!currentPath) return false

    if (path === '/admin' && currentPath === '/admin') {
      return true
    }

    if (path !== '/admin' && currentPath.startsWith(path)) {
      return true
    }

    return false
  }

  // 獲取主題相應的樣式
  const getThemeClass = () => {
    return isDarkMode ? 'sidebar-dark' : 'sidebar-light'
  }

  // 打印權限調試信息
  const logPermissionDebugInfo = () => {
    if (debugMode && mounted) {
      console.log('當前權限狀態：', {
        adminInfo: admin
          ? {
              id: admin.id,
              account: admin.manager_account,
              privileges: admin.manager_privileges,
            }
          : '未載入',
        權限緩存數量: cachedPermissions.length,
        可見菜單項數量: filteredMenuItems.length,
        菜單項狀態: menuItems.map((item) => ({
          label: item.label,
          hasAccess:
            !item.requiredPrivilege || hasPermission(item.requiredPrivilege),
        })),
      })
    }
  }

  // 在渲染時輸出日誌
  console.log('側邊欄渲染:', {
    adminLoaded: !!admin,
    filteredMenuCount: filteredMenuItems.length,
    isDarkMode,
  })

  // 調用權限調試信息日誌
  logPermissionDebugInfo()

  // 輸出菜單項子項時的過濾邏輯
  const filterSubItems = (subItems, parentLabel) => {
    return subItems.filter((subItem) => {
      if (!subItem.requiredPrivilege) return true

      // 檢查權限
      const hasAccess = hasPermission(subItem.requiredPrivilege)

      if (debugMode) {
        console.log(
          `子菜單項 "${subItem.label}" 權限檢查:`,
          subItem.requiredPrivilege,
          hasAccess ? '有權限' : '無權限'
        )
      }

      return hasAccess
    })
  }

  // 渲染側邊欄內容
  return (
    <>
      <div
        className={`sidebar ${getThemeClass()} ${collapsed ? 'collapsed' : ''}`}
        style={{
          backgroundColor: isDarkMode ? '#212529' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#212529',
        }}
      >
        {/* Sidebar 內容區域 - 使用 flex-grow-1 確保填充可用空間 */}
        <div className="p-3 flex-grow-1 d-flex flex-column">
          {/* 調試信息 - 僅在調試模式下顯示 */}
          {debugMode && (
            <div className="mb-3 p-2 border border-warning rounded bg-warning bg-opacity-10 small">
              <h6 className="text-warning mb-2">權限診斷面板</h6>
              <strong>管理員: </strong>
              {admin ? admin.manager_account : '未載入'}
              <br />
              <strong>管理員ID: </strong>
              {admin ? admin.id : '未載入'}
              <br />
              <strong>權限字串: </strong>
              <code className="text-break">
                {admin?.manager_privileges || '無'}
              </code>
              <br />
              <strong>超級管理員?: </strong>
              {admin?.manager_privileges === '111' ? '是' : '否'}
              <br />
              <strong>緩存權限: </strong>
              {cachedPermissions.length}個
              <br />
              <div className="mt-3 mb-1">
                <strong>數據庫欄位對應檢查:</strong>
                <ul className="list-unstyled ms-2 small">
                  <li>
                    <code>id</code>: {admin?.id ?? '缺失'}
                  </li>
                  <li>
                    <code>manager_account</code>:{' '}
                    {admin?.manager_account ?? '缺失'}
                  </li>
                  <li>
                    <code>manager_privileges</code>:{' '}
                    {admin?.manager_privileges ?? '缺失'}
                  </li>
                </ul>
              </div>
              <div className="mt-2 mb-2">
                <button
                  className="btn btn-sm btn-warning mb-2 w-100"
                  onClick={() => {
                    // 獲取解析後的權限
                    const parsedPermissions = admin
                      ? getManagerPermissions(admin.manager_privileges)
                      : []

                    console.log('權限診斷詳情:', {
                      admin,
                      originalPrivileges: admin?.manager_privileges,
                      cachedPermissions,
                      parsedPermissions,
                      hasAdminPrivileges: admin?.manager_privileges === '111',
                      // 檢查權限是否正確映射
                      testPermissions: {
                        'members:read': hasPermission('members:read'),
                        'shop:read': hasPermission('shop:read'),
                        'pets:read': hasPermission('pets:read'),
                        'forum:read': hasPermission('forum:read'),
                        'finance:read': hasPermission('finance:read'),
                        'settings:read': hasPermission('settings:read'),
                      },
                    })
                  }}
                >
                  輸出完整權限詳情
                </button>
                <button
                  className="btn btn-sm btn-outline-warning mb-2 w-100"
                  onClick={() => {
                    // 清除本地儲存的數據
                    localStorage.removeItem('admin_permissions')
                    // 強制刷新頁面，重新載入所有數據
                    window.location.reload()
                  }}
                >
                  重新載入權限
                </button>
                <button
                  className="btn btn-sm btn-outline-warning w-100"
                  onClick={toggleDebugMode}
                >
                  關閉偵錯模式
                </button>
              </div>
              {cachedPermissions.length > 0 && (
                <div className="mt-2">
                  <strong>前5個權限: </strong>
                  <ul className="list-unstyled ms-2 small">
                    {cachedPermissions.slice(0, 5).map((perm, index) => (
                      <li key={index}>
                        <code>{perm}</code> -{' '}
                        {hasPermission(perm) ? '✅' : '❌'}
                      </li>
                    ))}
                  </ul>
                  {cachedPermissions.length > 5 && (
                    <div className="text-muted">
                      ...以及 {cachedPermissions.length - 5} 個更多權限
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <nav className="flex-grow-1 d-flex flex-column">
            <ul className="nav flex-column gap-1 list-unstyled flex-grow-1">
              {filteredMenuItems.map((item) => (
                <li key={item.path} className="mb-1">
                  {item.subItems ? (
                    <>
                      <button
                        className={`sidebar-nav-link w-100 text-start border-0 ${
                          isActive(item.path) ? 'active' : ''
                        } ${item.label === '金流管理' ? 'finance-btn' : ''}`}
                        style={{
                          backgroundColor: isActive(item.path)
                            ? isDarkMode
                              ? '#495057'
                              : '#e9ecef'
                            : 'transparent',
                          color: isDarkMode ? '#ffffff' : '#212529',
                        }}
                        onClick={(e) => {
                          if (collapsed) {
                            e.preventDefault() // 阻止默認行為
                            onToggle() // 調用父組件傳入的切換函數

                            // 在移動設備上，我們需要延遲展開子菜單
                            // 給側邊欄足夠的時間展開後再展開子菜單
                            setTimeout(() => {
                              setExpandedMenus((prev) => ({
                                ...prev,
                                [item.label]: true,
                              }))
                            }, 350) // 稍微長於側邊欄的過渡動畫時間
                          } else {
                            toggleSubmenu(item.label)
                          }
                        }}
                        title={item.label}
                        data-menu-item={item.label}
                      >
                        <div className="icon-container sidebar-icon">
                          {item.icon}
                        </div>
                        <span
                          className={`flex-grow-1 ${collapsed ? 'd-none' : ''}`}
                        >
                          {item.label}
                        </span>
                        {!collapsed && (
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
                        )}
                      </button>
                      {!collapsed && (
                        <ul
                          className={`nav flex-column list-unstyled ps-2 mt-1 sidebar-submenu ${
                            expandedMenus[item.label] ? 'expanded' : ''
                          }`}
                          data-parent={item.label}
                        >
                          {filterSubItems(item.subItems, item.label).map(
                            (subItem) => (
                              <li key={subItem.path}>
                                <Link
                                  href={subItem.path}
                                  className={`sidebar-nav-link py-1 ${
                                    pathname === subItem.path ? 'active' : ''
                                  }`}
                                  style={{
                                    color: isDarkMode ? '#ffffff' : '#212529',
                                    backgroundColor:
                                      pathname === subItem.path
                                        ? isDarkMode
                                          ? '#495057'
                                          : '#e9ecef'
                                        : 'transparent',
                                  }}
                                  onClick={handleLinkClick}
                                >
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      {item.label === '權限診斷' ? (
                        <button
                          className={`sidebar-nav-link w-100 text-start border-0 ${
                            isActive(item.path) ? 'active' : ''
                          }`}
                          style={{
                            backgroundColor: isActive(item.path)
                              ? isDarkMode
                                ? '#495057'
                                : '#e9ecef'
                              : 'transparent',
                            color: isDarkMode ? '#ffffff' : '#212529',
                          }}
                          onClick={toggleDebugMode}
                          title="權限診斷"
                        >
                          <div className="icon-container sidebar-icon">
                            {item.icon}
                          </div>
                          <span className={collapsed ? 'd-none' : ''}>
                            {item.label}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.path}
                          className={`sidebar-nav-link ${
                            isActive(item.path) ? 'active' : ''
                          }`}
                          style={{
                            backgroundColor: isActive(item.path)
                              ? isDarkMode
                                ? '#495057'
                                : '#e9ecef'
                              : 'transparent',
                            color: isDarkMode ? '#ffffff' : '#212529',
                          }}
                          title={collapsed ? item.label : ''}
                          onClick={handleLinkClick}
                        >
                          <div className="icon-container sidebar-icon">
                            {item.icon}
                          </div>
                          <span className={collapsed ? 'd-none' : ''}>
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* 版本信息和診斷入口 */}
        <div
          className="sidebar-footer p-3 border-top mt-auto"
          style={{
            borderColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.1)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span
              className="badge rounded-pill bg-secondary bg-opacity-25 fw-normal px-2 py-1"
              style={{
                backgroundColor: isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)',
              }}
              onDoubleClick={handleVersionDoubleClick}
            >
              <span className="me-1">v1.0.0</span>
              <small
                className="fs-10"
                style={{
                  color: isDarkMode
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(0,0,0,0.5)',
                }}
              >
                (雙擊開啟診斷)
              </small>
            </span>

            <button
              className="btn btn-sm btn-link p-0"
              style={{
                color: isDarkMode ? '#ffffff' : '#212529',
              }}
              onClick={() => setIsDebugOpen(!isDebugOpen)}
              title="開啟權限診斷工具"
            >
              <Shield size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 權限診斷工具 */}
      <PermissionDebug />
    </>
  )
}

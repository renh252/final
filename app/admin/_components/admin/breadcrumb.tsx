'use client'

import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import Link from 'next/link'
import styles from './breadcrumb.module.css'

// 路由映射配置
const routeMap = {
  admin: {
    title: '首頁',
    icon: <Home size={16} />,
  },
  members: {
    title: '會員管理',
  },
  shop: {
    title: '商城管理',
    children: {
      products: { title: '商品管理' },
      orders: { title: '訂單管理' },
      categories: { title: '分類管理' },
      coupons: { title: '優惠券管理' },
    },
  },
  pets: {
    title: '寵物管理',
    children: {
      categories: { title: '寵物分類' },
      appointments: { title: '預約管理' },
    },
  },
  forum: {
    title: '論壇管理',
    children: {
      articles: { title: '文章管理' },
      categories: { title: '分類管理' },
      reports: { title: '檢舉管理' },
    },
  },
  finance: {
    title: '金流管理',
    children: {
      dashboard: { title: '金流總覽' },
      transactions: { title: '交易紀錄' },
      payments: { title: '支付管理' },
    },
  },
  settings: {
    title: '系統設定',
    children: {
      profile: { title: '個人資料' },
      roles: { title: '角色權限' },
      system: { title: '系統設定' },
      logs: { title: '系統日誌' },
    },
  },
}

export default function AdminBreadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  const items = []
  let currentPath = ''
  let currentRouteMap: any = routeMap

  // 首頁
  items.push({
    path: '/admin',
    title: routeMap.admin.title,
    icon: routeMap.admin.icon,
    isActive: paths.length === 1,
  })

  // 遍歷路徑生成麵包屑
  for (let i = 1; i < paths.length; i++) {
    const path = paths[i]
    currentPath += `/${path}`

    // 檢查是否為動態路由（例如: [id]）
    if (path.match(/^\[.*\]$/)) {
      items.push({
        path: `/admin${currentPath}`,
        title: '詳細資料',
        isActive: i === paths.length - 1,
      })
      continue
    }

    // 一般路由
    if (currentRouteMap[path]) {
      items.push({
        path: `/admin${currentPath}`,
        title: currentRouteMap[path].title,
        isActive: i === paths.length - 1,
      })
      currentRouteMap = currentRouteMap[path].children || {}
    }
  }

  return (
    <div className={styles.breadcrumbWrapper}>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          {items.map((item) => (
            <li
              key={item.path}
              className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}
            >
              {item.isActive ? (
                <span className="d-flex align-items-center">
                  {item.icon && <span className="me-1">{item.icon}</span>}
                  {item.title}
                </span>
              ) : (
                <Link href={item.path} className="text-decoration-none">
                  <span className="d-flex align-items-center">
                    {item.icon && <span className="me-1">{item.icon}</span>}
                    {item.title}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

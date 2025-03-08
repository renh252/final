'use client'

import { Nav, Accordion } from 'react-bootstrap'
import {
  Users,
  ShoppingBag,
  MessageSquare,
  DollarSign,
  PawPrint,
  Settings,
  Package,
  FileText,
  CreditCard,
  Calendar,
  Tags,
  Gift,
  AlertCircle,
  BarChart3,
  UserCog,
  FileCode2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './sidebar.module.css'

// 側邊欄選單配置
const menuItems = [
  {
    key: 'members',
    title: '會員管理',
    icon: <Users size={18} />,
    link: '/admin/members',
  },
  {
    key: 'shop',
    title: '商城管理',
    icon: <ShoppingBag size={18} />,
    subItems: [
      {
        key: 'products',
        title: '商品管理',
        icon: <Package size={18} />,
        link: '/admin/shop/products',
      },
      {
        key: 'orders',
        title: '訂單管理',
        icon: <FileText size={18} />,
        link: '/admin/shop/orders',
      },
      {
        key: 'categories',
        title: '分類管理',
        icon: <Tags size={18} />,
        link: '/admin/shop/categories',
      },
      {
        key: 'coupons',
        title: '優惠券管理',
        icon: <Gift size={18} />,
        link: '/admin/shop/coupons',
      },
    ],
  },
  {
    key: 'pets',
    title: '寵物管理',
    icon: <PawPrint size={18} />,
    subItems: [
      {
        key: 'pets-list',
        title: '寵物列表',
        icon: <PawPrint size={18} />,
        link: '/admin/pets',
      },
      {
        key: 'pets-categories',
        title: '寵物分類',
        icon: <Tags size={18} />,
        link: '/admin/pets/categories',
      },
      {
        key: 'appointments',
        title: '預約管理',
        icon: <Calendar size={18} />,
        link: '/admin/pets/appointments',
      },
    ],
  },
  {
    key: 'forum',
    title: '論壇管理',
    icon: <MessageSquare size={18} />,
    subItems: [
      {
        key: 'articles',
        title: '文章管理',
        icon: <FileText size={18} />,
        link: '/admin/forum/articles',
      },
      {
        key: 'forum-categories',
        title: '分類管理',
        icon: <Tags size={18} />,
        link: '/admin/forum/categories',
      },
      {
        key: 'reports',
        title: '檢舉管理',
        icon: <AlertCircle size={18} />,
        link: '/admin/forum/reports',
      },
    ],
  },
  {
    key: 'finance',
    title: '金流管理',
    icon: <DollarSign size={18} />,
    subItems: [
      {
        key: 'finance-dashboard',
        title: '金流總覽',
        icon: <BarChart3 size={18} />,
        link: '/admin/finance/dashboard',
      },
      {
        key: 'transactions',
        title: '交易紀錄',
        icon: <FileText size={18} />,
        link: '/admin/finance/transactions',
      },
      {
        key: 'payments',
        title: '支付管理',
        icon: <CreditCard size={18} />,
        link: '/admin/finance/payments',
      },
    ],
  },
  {
    key: 'settings',
    title: '系統設定',
    icon: <Settings size={18} />,
    subItems: [
      {
        key: 'roles',
        title: '角色權限',
        icon: <UserCog size={18} />,
        link: '/admin/settings/roles',
      },
      {
        key: 'system',
        title: '系統設定',
        icon: <Settings size={18} />,
        link: '/admin/settings/system',
      },
      {
        key: 'logs',
        title: '系統日誌',
        icon: <FileCode2 size={18} />,
        link: '/admin/settings/logs',
      },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  // 檢查路徑是否匹配
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  // 檢查子選單是否有活動項目
  const hasActiveChild = (subItems: any[]) => {
    return subItems.some((item) => isActive(item.link))
  }

  return (
    <div className={styles['admin-sidebar-wrapper']}>
      {/* Logo 區域 */}
      <div className="text-center mb-4">
        <Link href="/admin" className="text-decoration-none">
          <h4 className="text-white mb-0">毛孩之家後台</h4>
        </Link>
      </div>

      {/* 導航選單 */}
      <Accordion className="admin-sidebar-nav">
        {menuItems.map((item) => {
          // 單一選單項目
          if (!item.subItems) {
            return (
              <Nav.Item key={item.key}>
                <Link
                  href={item.link}
                  className={`nav-link d-flex align-items-center gap-2 py-2 px-3 ${
                    isActive(item.link)
                      ? 'active bg-primary text-white'
                      : 'text-white-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </Nav.Item>
            )
          }

          // 子選單
          return (
            <Accordion.Item
              key={item.key}
              eventKey={item.key}
              className="bg-transparent border-0"
            >
              <Accordion.Header className="admin-sidebar-accordion-header">
                <div className="d-flex align-items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column">
                  {item.subItems.map((subItem) => (
                    <Nav.Item key={subItem.key}>
                      <Link
                        href={subItem.link}
                        className={`nav-link d-flex align-items-center gap-2 py-2 px-4 ${
                          isActive(subItem.link)
                            ? 'active bg-primary text-white'
                            : 'text-white-50'
                        }`}
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

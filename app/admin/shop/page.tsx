'use client'

import { useState } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap'
import { ShoppingBag, Package, Tag, Ticket, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '../_components/AdminPageLayout'
import { useTheme } from '../ThemeContext'

// 商城管理模塊
const SHOP_MODULES = [
  {
    id: 'products',
    title: '商品管理',
    description: '管理所有商品，包括新增、編輯、刪除商品',
    icon: <Package size={24} />,
    path: '/admin/shop/products',
    count: '商品總數',
    value: '125',
    color: 'primary',
  },
  {
    id: 'orders',
    title: '訂單管理',
    description: '查看和處理客戶訂單，包括訂單狀態更新',
    icon: <ShoppingBag size={24} />,
    path: '/admin/shop/orders',
    count: '待處理訂單',
    value: '18',
    color: 'warning',
  },
  {
    id: 'categories',
    title: '商品分類管理',
    description: '管理商品分類，建立分類層級結構',
    icon: <Tag size={24} />,
    path: '/admin/shop/categories',
    count: '分類總數',
    value: '12',
    color: 'info',
  },
  {
    id: 'coupons',
    title: '優惠券管理',
    description: '創建和管理優惠券，設定折扣規則',
    icon: <Ticket size={24} />,
    path: '/admin/shop/coupons',
    count: '有效優惠券',
    value: '8',
    color: 'success',
  },
]

// 商城統計數據
const SHOP_STATS = [
  {
    title: '本月銷售額',
    value: 'NT$ 125,890',
    change: '+12.5%',
    changeType: 'increase',
  },
  {
    title: '本月訂單數',
    value: '256',
    change: '+8.3%',
    changeType: 'increase',
  },
  {
    title: '平均訂單金額',
    value: 'NT$ 492',
    change: '+3.7%',
    changeType: 'increase',
  },
  {
    title: '商品總數',
    value: '125',
    change: '+5',
    changeType: 'increase',
  },
]

export default function ShopDashboardPage() {
  const router = useRouter()
  const { isDarkMode } = useTheme()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <AdminPageLayout
      title="商城管理"
      description="管理商品、訂單、分類和優惠券"
      breadcrumbs={[
        { label: '管理區', href: '/admin' },
        { label: '商城管理', href: '/admin/shop' },
      ]}
    >
      <AdminSection title="商城概覽" icon={<ShoppingBag />}>
        <Row className="mb-4">
          {SHOP_STATS.map((stat, index) => (
            <Col key={index} md={3} sm={6} className="mb-3">
              <Card
                className={`h-100 ${
                  isDarkMode ? 'bg-dark text-white' : 'bg-white'
                }`}
              >
                <Card.Body>
                  <h6
                    className={`${
                      isDarkMode ? 'text-light opacity-75' : 'text-muted'
                    }`}
                  >
                    {stat.title}
                  </h6>
                  <h3>{stat.value}</h3>
                  <div
                    className={`small ${
                      stat.changeType === 'increase'
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {stat.change} 相比上月
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </AdminSection>

      <AdminSection title="商城模塊" icon={<FileText />}>
        <Row>
          {SHOP_MODULES.map((module) => (
            <Col key={module.id} lg={6} className="mb-4">
              <Card
                className={`h-100 ${
                  isDarkMode ? 'bg-dark text-white' : 'bg-white'
                }`}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className={`rounded-circle p-2 me-3 bg-${module.color} bg-opacity-10`}
                    >
                      {module.icon}
                    </div>
                    <h5 className="mb-0">{module.title}</h5>
                  </div>
                  <p
                    className={`${
                      isDarkMode ? 'text-light opacity-75' : 'text-muted'
                    }`}
                  >
                    {module.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small
                        className={`${
                          isDarkMode ? 'text-light opacity-75' : 'text-muted'
                        }`}
                      >
                        {module.count}
                      </small>
                      <h6 className="mb-0">{module.value}</h6>
                    </div>
                    <Button
                      variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                      onClick={() => navigateTo(module.path)}
                    >
                      進入管理
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </AdminSection>
    </AdminPageLayout>
  )
}

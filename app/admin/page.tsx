'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import {
  Users,
  ShoppingBag,
  DollarSign,
  PawPrint,
  MessageSquare,
  TrendingUp,
  X,
} from 'lucide-react'
import { useAdmin } from './AdminContext'
import { useRouter } from 'next/navigation'
import { LineChart, PieChart } from './_components/Charts'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from './_components/AdminPageLayout'

export default function AdminPage() {
  const { admin, checkAuth, isLoading } = useAdmin()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // 驗證管理員是否已登入
  useEffect(() => {
    const verifyAuth = async () => {
      if (!admin) {
        const isAuthenticated = await checkAuth()

        if (!isAuthenticated) {
          router.push('/admin/login')
        }
      }
    }

    verifyAuth()
    setIsClient(true)

    // 檢查 localStorage 中是否已關閉歡迎信息
    const welcomeClosed = localStorage.getItem('welcomeClosed') === 'true'
    setShowWelcome(!welcomeClosed)
  }, [checkAuth, router, admin])

  // 處理關閉歡迎信息
  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('welcomeClosed', 'true')
  }

  // 如果還在載入或不在客戶端，顯示載入中
  if (isLoading || !isClient) {
    return (
      <div className="admin-home d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  // 統計卡片資料
  const stats = [
    {
      title: '今日會員',
      count: 12,
      increase: '+8%',
      color: 'primary',
      icon: <Users size={24} />,
    },
    {
      title: '新訂單',
      count: 35,
      increase: '+12%',
      color: 'success',
      icon: <ShoppingBag size={24} />,
    },
    {
      title: '今日收入',
      count: 'NT$28,950',
      increase: '+5%',
      color: 'warning',
      icon: <DollarSign size={24} />,
    },
    {
      title: '待領養寵物',
      count: 45,
      increase: '-2%',
      color: 'danger',
      icon: <PawPrint size={24} />,
    },
    {
      title: '新論壇文章',
      count: 18,
      increase: '+15%',
      color: 'info',
      icon: <MessageSquare size={24} />,
    },
    {
      title: '網站瀏覽量',
      count: '2,854',
      increase: '+24%',
      color: 'secondary',
      icon: <TrendingUp size={24} />,
    },
  ]

  // 格式化統計數據以符合 AdminPageLayout 的需求
  const dashboardStats = stats.map((stat) => ({
    title: stat.title,
    count: (
      <div className="dashboard-stat-wrapper">
        <div className="dashboard-stat-value">{stat.count}</div>
        <div
          className={`dashboard-stat-badge ${
            stat.increase.startsWith('+') ? 'text-bg-success' : 'text-bg-danger'
          }`}
        >
          {stat.increase}
        </div>
      </div>
    ),
    color: stat.color,
    icon: stat.icon,
  }))

  return (
    <AdminPageLayout title="管理後台" stats={dashboardStats}>
      <div className="admin-page-wrapper">
        {showWelcome && admin && (
          <div className="alert alert-info mb-4">
            <p className="mb-0">
              歡迎，{admin.account}！您的權限：{admin.privileges}
            </p>
            <button
              type="button"
              className="btn-close"
              aria-label="關閉"
              onClick={handleCloseWelcome}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <AdminSection title="數據分析">
          <Row className="g-4">
            <Col md={8}>
              <AdminCard title="本週訪問統計">
                <LineChart />
              </AdminCard>
            </Col>
            <Col md={4}>
              <AdminCard title="訪問來源">
                <PieChart />
              </AdminCard>
            </Col>
          </Row>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

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
} from 'lucide-react'
import { useAdmin } from './AdminContext'
import { useRouter } from 'next/navigation'
import { LineChart, PieChart } from './_components/Charts'

export default function AdminPage() {
  const { admin, checkAuth, isLoading } = useAdmin()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // 驗證管理員是否已登入
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth()

      if (!isAuthenticated) {
        router.push('/admin/login')
      }
    }

    verifyAuth()
    setIsClient(true)
  }, [checkAuth, router])

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

  return (
    <div className="admin-home p-4">
      <h2 className="mb-4">管理後台</h2>

      {admin && (
        <div className="alert alert-info mb-4">
          <p className="mb-0">
            歡迎，{admin.account}！您的權限：{admin.privileges}
          </p>
        </div>
      )}

      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} md={6} lg={4}>
            <Card className="h-100 dashboard-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="text-muted mb-1">{stat.title}</h5>
                    <h3 className="mb-0">{stat.count}</h3>
                    <span
                      className={`badge text-bg-${
                        stat.increase.startsWith('+') ? 'success' : 'danger'
                      } mt-2`}
                    >
                      {stat.increase}
                    </span>
                  </div>
                  <div className={`dashboard-icon bg-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Header>本週訪問統計</Card.Header>
            <Card.Body>
              <LineChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>訪問來源</Card.Header>
            <Card.Body>
              <PieChart />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

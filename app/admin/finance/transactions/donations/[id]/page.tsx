'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  ListGroup,
  Table,
  Form,
} from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Heart,
  Activity,
  Truck,
  PawPrint,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import { fetchApi } from '@/app/admin/_lib/api'

// 定義捐款詳情介面
interface DonationDetail {
  id: number
  donation_type: string
  pet_id: number | null
  amount: number
  donation_mode: string
  payment_method: string
  transaction_status: string
  create_datetime: string
  user_id: number | null
  donor_name: string
  donor_phone: string
  donor_email: string
  trade_no: string
  retry_trade_no: string | null
  pet_name?: string
  user_name?: string
  user_email?: string
  is_receipt_needed?: number
  is_anonymous?: number
  regular_payment_date?: string | null
}

export default function DonationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [donation, setDonation] = useState<DonationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 格式化貨幣
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定'
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // 載入捐款詳情
  useEffect(() => {
    const loadDonationDetail = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        console.log(`正在載入捐款詳情，ID: ${id}`)
        const result = await fetchApi(`/api/admin/finance/donations/${id}`)
        
        if (result.success && result.data) {
          console.log('成功獲取捐款詳情:', result.data)
          setDonation(result.data)
        } else {
          console.error('獲取捐款詳情失敗:', result)
          setError(result.message || '無法載入捐款詳情')
        }
      } catch (error) {
        console.error('載入捐款詳情失敗:', error)
        setError('載入捐款詳情時發生錯誤')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDonationDetail()
  }, [id])

  // 獲取狀態標籤
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '已付款':
        return <Badge bg="success">已付款</Badge>
      case '未付款':
        return <Badge bg="warning">未付款</Badge>
      case '付款失敗':
        return <Badge bg="danger">付款失敗</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  // 獲取捐款類型標籤
  const getDonationTypeBadge = (mode: string) => {
    switch (mode) {
      case '一次性捐款':
        return <Badge bg="primary">單次捐款</Badge>
      case '定期定額':
        return <Badge bg="info">定期捐款</Badge>
      default:
        return <Badge bg="secondary">{mode}</Badge>
    }
  }

  // 頁面載入中
  if (isLoading) {
    return (
      <AdminPageLayout title="捐款詳情">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
          <span className="ms-3">載入捐款詳情中...</span>
        </div>
      </AdminPageLayout>
    )
  }

  // 顯示錯誤
  if (error) {
    return (
      <AdminPageLayout title="捐款詳情">
        <Card className={`admin-card ${isDarkMode ? 'bg-dark text-light' : ''}`}>
          <Card.Body className="text-center py-5">
            <div className="mb-3 text-danger">
              <Activity size={48} />
            </div>
            <h4>無法載入捐款詳情</h4>
            <p className="mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} className="me-2" />
              返回捐款列表
            </Button>
          </Card.Body>
        </Card>
      </AdminPageLayout>
    )
  }

  // 沒有捐款資料
  if (!donation) {
    return (
      <AdminPageLayout title="捐款詳情">
        <Card className={`admin-card ${isDarkMode ? 'bg-dark text-light' : ''}`}>
          <Card.Body className="text-center py-5">
            <div className="mb-3 text-warning">
              <Activity size={48} />
            </div>
            <h4>找不到捐款資料</h4>
            <p className="mb-4">找不到對應的捐款記錄</p>
            <Button 
              variant="primary" 
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} className="me-2" />
              返回捐款列表
            </Button>
          </Card.Body>
        </Card>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout
      title={`捐款詳情 #${donation.id}`}
      actions={
        <Button variant="outline-primary" onClick={() => router.back()}>
          <ArrowLeft size={16} className="me-2" />
          返回列表
        </Button>
      }
    >
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <Link href="/admin/finance" className="text-decoration-none me-2">
            財務管理
          </Link>
          <span className="text-muted mx-1">/</span>
          <Link href="/admin/finance/transactions/donations" className="text-decoration-none me-2">
            捐款記錄
          </Link>
          <span className="text-muted mx-1">/</span>
          <span className="text-muted">捐款 #{donation.id}</span>
        </div>
        <small className="text-muted">交易編號: {donation.trade_no}</small>
      </div>
      <Row className="g-4">
        <Col md={8}>
          <AdminCard title="基本資訊">
            <ListGroup variant={isDarkMode ? 'dark' : 'flush'}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <DollarSign size={20} className="me-2 text-success" />
                  <span>捐款金額</span>
                </div>
                <strong>{formatCurrency(donation.amount)}</strong>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Calendar size={20} className="me-2 text-primary" />
                  <span>捐款日期</span>
                </div>
                <span>{formatDate(donation.create_datetime)}</span>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Heart size={20} className="me-2 text-danger" />
                  <span>捐款類型</span>
                </div>
                <div>
                  {getDonationTypeBadge(donation.donation_mode)}
                  {donation.donation_mode === '定期定額' && donation.regular_payment_date && (
                    <small className="ms-2 text-muted">
                      每月 {new Date(donation.regular_payment_date).getDate()} 日扣款
                    </small>
                  )}
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Truck size={20} className="me-2 text-info" />
                  <span>捐款用途</span>
                </div>
                <div>
                  {donation.donation_type}
                  {donation.pet_id && donation.pet_name && (
                    <div className="mt-1">
                      <small>
                        <PawPrint size={14} className="me-1" />
                        <Link href={`/admin/pets/${donation.pet_id}`}>
                          {donation.pet_name}
                        </Link>
                      </small>
                    </div>
                  )}
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <CreditCard size={20} className="me-2 text-warning" />
                  <span>付款方式</span>
                </div>
                <span>{donation.payment_method}</span>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Activity size={20} className="me-2 text-primary" />
                  <span>交易狀態</span>
                </div>
                {getStatusBadge(donation.transaction_status)}
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FileText size={20} className="me-2 text-secondary" />
                  <span>是否需要收據</span>
                </div>
                <span>
                  {donation.is_receipt_needed ? (
                    <Badge bg="success">需要</Badge>
                  ) : (
                    <Badge bg="secondary">不需要</Badge>
                  )}
                </span>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <User size={20} className="me-2 text-muted" />
                  <span>匿名捐款</span>
                </div>
                <span>
                  {donation.is_anonymous ? (
                    <Badge bg="info">是</Badge>
                  ) : (
                    <Badge bg="secondary">否</Badge>
                  )}
                </span>
              </ListGroup.Item>
              
              {donation.retry_trade_no && (
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Activity size={20} className="me-2 text-danger" />
                    <span>重試交易號</span>
                  </div>
                  <span className="text-danger">{donation.retry_trade_no}</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </AdminCard>
        </Col>
        
        <Col md={4}>
          <AdminCard title="捐款人資訊">
            <ListGroup variant={isDarkMode ? 'dark' : 'flush'}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <User size={20} className="me-2 text-primary" />
                  <span>姓名</span>
                </div>
                <span>{donation.donor_name}</span>
              </ListGroup.Item>
              
              {donation.user_id && (
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <User size={20} className="me-2 text-success" />
                    <span>會員</span>
                  </div>
                  <Link href={`/admin/members/${donation.user_id}`}>
                    {donation.user_name || `會員 #${donation.user_id}`}
                  </Link>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Mail size={20} className="me-2 text-info" />
                  <span>電子郵件</span>
                </div>
                <span>{donation.donor_email}</span>
              </ListGroup.Item>
              
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Phone size={20} className="me-2 text-warning" />
                  <span>電話</span>
                </div>
                <span>{donation.donor_phone}</span>
              </ListGroup.Item>
            </ListGroup>
          </AdminCard>
          
          <div className="mt-4">
            <Button variant="outline-primary" className="w-100 mb-2">
              <Mail size={16} className="me-2" />
              寄送感謝郵件
            </Button>
            
            {donation.transaction_status === '未付款' && (
              <Button variant="outline-danger" className="w-100">
                <Activity size={16} className="me-2" />
                標記為已付款
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </AdminPageLayout>
  )
} 
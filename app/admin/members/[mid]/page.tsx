'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Tab, Nav, Form } from 'react-bootstrap'
import { ArrowLeft, Save, UserX } from 'lucide-react'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '../../ThemeContext'
import Link from 'next/link'

// 模擬會員數據
const MOCK_MEMBER = {
  id: 1,
  name: '王小明',
  email: 'wang@example.com',
  phone: '0912-345-678',
  status: 'active',
  registeredAt: '2023-01-15',
  lastLogin: '2023-03-10',
  address: '台北市信義區忠孝東路五段123號',
  avatar: 'https://via.placeholder.com/150',
  orders: [
    { id: 101, date: '2023-02-15', total: 1200, status: '已完成' },
    { id: 102, date: '2023-03-05', total: 850, status: '已完成' },
  ],
  pets: [
    { id: 201, name: '小花', species: '貓', variety: '米克斯' },
    { id: 202, name: '大黑', species: '狗', variety: '拉布拉多' },
  ],
  donations: [
    { id: 301, date: '2023-01-20', amount: 500 },
    { id: 302, date: '2023-02-25', amount: 1000 },
  ],
  posts: [
    { id: 401, title: '我家的貓咪真可愛', date: '2023-02-10' },
    { id: 402, title: '狗狗健康飲食指南', date: '2023-03-01' },
  ],
}

export default function MemberDetailPage({
  params,
}: {
  params: { mid: string }
}) {
  const [member, setMember] = useState(MOCK_MEMBER)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(MOCK_MEMBER)
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 模擬從API獲取會員數據
  useEffect(() => {
    // 這裡可以根據params.mid從API獲取會員數據
    console.log(`獲取會員ID: ${params.mid}的數據`)
  }, [params.mid])

  // 處理表單變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      setMember(formData)
      setIsEditing(false)
      showToast('success', '更新成功', '會員資料已成功更新')
    }, 500)
  }

  // 處理會員停權
  const handleBanMember = () => {
    confirm({
      title: '停權會員',
      message: `確定要停權會員 ${member.name} 嗎？停權後該會員將無法登入系統。`,
      type: 'danger',
      confirmText: '停權',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          setMember((prev) => ({ ...prev, status: 'banned' }))
          showToast('success', '操作成功', `會員 ${member.name} 已被停權`)
        }, 500)
      },
    })
  }

  return (
    <div className="member-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/admin/members" className="btn btn-link p-0 me-3">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="mb-0">會員詳情</h2>
        </div>
        <div>
          {isEditing ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="d-flex align-items-center"
            >
              <Save size={18} className="me-2" /> 儲存變更
            </Button>
          ) : (
            <>
              <Button
                variant="outline-primary"
                onClick={() => setIsEditing(true)}
                className="me-2"
              >
                編輯資料
              </Button>
              <Button
                variant="outline-danger"
                onClick={handleBanMember}
                className="d-flex align-items-center"
              >
                <UserX size={18} className="me-2" /> 停權會員
              </Button>
            </>
          )}
        </div>
      </div>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <div className="text-center mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="rounded-circle mb-3"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                  }}
                />
                <h4>{member.name}</h4>
                <span
                  className={`badge ${
                    member.status === 'active' ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  {member.status === 'active' ? '正常' : '已停權'}
                </span>
              </div>

              {isEditing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>姓名</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>電子郵件</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>電話</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>地址</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              ) : (
                <div>
                  <p>
                    <strong>電子郵件：</strong> {member.email}
                  </p>
                  <p>
                    <strong>電話：</strong> {member.phone}
                  </p>
                  <p>
                    <strong>地址：</strong> {member.address}
                  </p>
                  <p>
                    <strong>註冊日期：</strong>{' '}
                    {new Date(member.registeredAt).toLocaleDateString('zh-TW')}
                  </p>
                  <p>
                    <strong>最後登入：</strong>{' '}
                    {new Date(member.lastLogin).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <Tab.Container defaultActiveKey="orders">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="orders">訂單記錄</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="pets">寵物資料</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="donations">捐款記錄</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="posts">發文記錄</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="orders">
                    <h5 className="mb-3">訂單記錄</h5>
                    {member.orders.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>訂單編號</th>
                            <th>日期</th>
                            <th>金額</th>
                            <th>狀態</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.orders.map((order) => (
                            <tr key={order.id}>
                              <td>{order.id}</td>
                              <td>{order.date}</td>
                              <td>${order.total}</td>
                              <td>{order.status}</td>
                              <td>
                                <Link
                                  href={`/admin/shop/orders/${order.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  查看
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted">無訂單記錄</p>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="pets">
                    <h5 className="mb-3">寵物資料</h5>
                    {member.pets.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>名稱</th>
                            <th>類型</th>
                            <th>品種</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.pets.map((pet) => (
                            <tr key={pet.id}>
                              <td>{pet.id}</td>
                              <td>{pet.name}</td>
                              <td>{pet.species}</td>
                              <td>{pet.variety}</td>
                              <td>
                                <Link
                                  href={`/admin/pets/${pet.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  查看
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted">無寵物資料</p>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="donations">
                    <h5 className="mb-3">捐款記錄</h5>
                    {member.donations.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>日期</th>
                            <th>金額</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.donations.map((donation) => (
                            <tr key={donation.id}>
                              <td>{donation.id}</td>
                              <td>{donation.date}</td>
                              <td>${donation.amount}</td>
                              <td>
                                <Link
                                  href={`/admin/finance/transactions/donations/${donation.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  查看
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted">無捐款記錄</p>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="posts">
                    <h5 className="mb-3">發文記錄</h5>
                    {member.posts.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>標題</th>
                            <th>日期</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.posts.map((post) => (
                            <tr key={post.id}>
                              <td>{post.id}</td>
                              <td>{post.title}</td>
                              <td>{post.date}</td>
                              <td>
                                <Link
                                  href={`/admin/forum/articles/${post.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  查看
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted">無發文記錄</p>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

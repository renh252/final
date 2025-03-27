'use client'

import { useState } from 'react'
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'
import { LuMail, LuPhone, LuMapPin, LuMessageSquare } from 'react-icons/lu'
import { useAuth } from '@/app/context/AuthContext'

export default function ContactPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // 這裡可以添加實際的API調用來發送聯繫信息
      // 暫時模擬API調用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitStatus({
        type: 'success',
        message: '您的訊息已成功送出，我們會盡快回覆您。',
      })

      // 清空表單
      if (!user) {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          subject: '',
          message: '',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'danger',
        message: '發送失敗，請稍後再試或直接撥打我們的聯絡電話。',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">聯絡我們</h1>
          <p className="text-center mb-5">
            若您有任何關於寵物領養、捐贈或合作的問題，歡迎透過以下方式聯繫我們。
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="rounded-circle bg-light p-3 mb-3">
                <LuMail size={28} className="text-primary" />
              </div>
              <Card.Title>電子郵件</Card.Title>
              <Card.Text>
                <a
                  href="mailto:contact@petadoption.com"
                  className="text-decoration-none"
                >
                  contact@petadoption.com
                </a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4 mb-md-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="rounded-circle bg-light p-3 mb-3">
                <LuPhone size={28} className="text-primary" />
              </div>
              <Card.Title>電話</Card.Title>
              <Card.Text>
                <a href="tel:+886212345678" className="text-decoration-none">
                  02-1234-5678
                </a>
                <br />
                週一至週五 9:00-18:00
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="rounded-circle bg-light p-3 mb-3">
                <LuMapPin size={28} className="text-primary" />
              </div>
              <Card.Title>地址</Card.Title>
              <Card.Text>
                台北市大安區復興南路一段390號
                <br />
                寵物之家協會
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={6} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-light p-2 me-3">
                  <LuMessageSquare size={24} className="text-primary" />
                </div>
                <h3 className="mb-0">寫信給我們</h3>
              </div>

              {submitStatus && (
                <Alert variant={submitStatus.type} className="mb-4">
                  {submitStatus.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>姓名</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="請輸入您的姓名"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>電子郵件</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="請輸入您的電子郵件"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>主旨</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="請輸入主旨"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>訊息內容</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="請輸入您的訊息"
                    rows={5}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '傳送中...' : '送出訊息'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

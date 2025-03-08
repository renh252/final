'use client'

import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import {
  Users,
  ShoppingBag,
  PawPrint,
  MessageSquare,
  DollarSign,
  Settings,
} from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="admin-dashboard p-4">
      <h2 className="mb-4">後台管理儀表板</h2>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h3 className="h5">會員管理</h3>
              <p>管理系統會員資料</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h3 className="h5">商品管理</h3>
              <p>管理寵物用品商品</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h3 className="h5">寵物管理</h3>
              <p>管理可領養寵物資料</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

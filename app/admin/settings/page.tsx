'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Form, Button, Nav, Tab } from 'react-bootstrap'
import {
  Save,
  Settings,
  Bell,
  Shield,
  Mail,
  Cloud,
  Database,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import { useToast } from '@/app/admin/components/Toast'

// 模擬系統設定數據
const MOCK_SETTINGS = {
  basic: {
    site_name: '寵物認養管理系統',
    site_description: '專業的寵物認養與管理平台',
    contact_email: 'admin@example.com',
    contact_phone: '02-1234-5678',
    address: '台北市信義區信義路五段100號',
  },
  notification: {
    enable_email: true,
    enable_line: true,
    enable_push: false,
    admin_email: 'admin@example.com',
    line_channel_token: '********************************',
    notification_types: {
      new_adoption: true,
      new_donation: true,
      new_order: true,
      low_stock: true,
      system_alert: true,
    },
  },
  security: {
    enable_2fa: true,
    password_expiry_days: 90,
    max_login_attempts: 5,
    session_timeout_minutes: 30,
    allowed_ips: ['*'],
  },
  mail: {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: 'noreply@example.com',
    smtp_password: '********************************',
    from_name: '寵物認養管理系統',
    from_email: 'noreply@example.com',
  },
  storage: {
    provider: 'aws',
    region: 'ap-northeast-1',
    bucket: 'pet-adoption-system',
    access_key: '********************************',
    secret_key: '********************************',
  },
  backup: {
    auto_backup: true,
    backup_frequency: 'daily',
    backup_time: '03:00',
    keep_backups: 30,
    backup_location: 'cloud',
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(MOCK_SETTINGS)
  const [activeTab, setActiveTab] = useState('basic')
  const { isDarkMode } = useTheme()
  const { showToast } = useToast()

  const handleChange = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleNestedChange = (
    section: string,
    parent: string,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value,
        },
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      showToast('success', '設定已更新', '系統設定已成功保存')
    }, 500)
  }

  return (
    <div className="settings-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>系統設定</h2>
      </div>

      <Tab.Container
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'basic')}
      >
        <Row>
          <Col md={3}>
            <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="basic"
                      className="d-flex align-items-center"
                    >
                      <Settings size={18} className="me-2" />
                      基本設定
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="notification"
                      className="d-flex align-items-center"
                    >
                      <Bell size={18} className="me-2" />
                      通知設定
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="security"
                      className="d-flex align-items-center"
                    >
                      <Shield size={18} className="me-2" />
                      安全設定
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="mail"
                      className="d-flex align-items-center"
                    >
                      <Mail size={18} className="me-2" />
                      郵件設定
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="storage"
                      className="d-flex align-items-center"
                    >
                      <Cloud size={18} className="me-2" />
                      儲存設定
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="backup"
                      className="d-flex align-items-center"
                    >
                      <Database size={18} className="me-2" />
                      備份設定
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="basic">
                    <h5 className="mb-4">基本設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>網站名稱</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.basic.site_name}
                              onChange={(e) =>
                                handleChange(
                                  'basic',
                                  'site_name',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>聯絡信箱</Form.Label>
                            <Form.Control
                              type="email"
                              value={settings.basic.contact_email}
                              onChange={(e) =>
                                handleChange(
                                  'basic',
                                  'contact_email',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>聯絡電話</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.basic.contact_phone}
                              onChange={(e) =>
                                handleChange(
                                  'basic',
                                  'contact_phone',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>網站描述</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={settings.basic.site_description}
                              onChange={(e) =>
                                handleChange(
                                  'basic',
                                  'site_description',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>地址</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.basic.address}
                              onChange={(e) =>
                                handleChange('basic', 'address', e.target.value)
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="notification">
                    <h5 className="mb-4">通知設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="enable_email"
                              label="啟用電子郵件通知"
                              checked={settings.notification.enable_email}
                              onChange={(e) =>
                                handleChange(
                                  'notification',
                                  'enable_email',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="enable_line"
                              label="啟用LINE通知"
                              checked={settings.notification.enable_line}
                              onChange={(e) =>
                                handleChange(
                                  'notification',
                                  'enable_line',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="enable_push"
                              label="啟用推播通知"
                              checked={settings.notification.enable_push}
                              onChange={(e) =>
                                handleChange(
                                  'notification',
                                  'enable_push',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>管理員信箱</Form.Label>
                            <Form.Control
                              type="email"
                              value={settings.notification.admin_email}
                              onChange={(e) =>
                                handleChange(
                                  'notification',
                                  'admin_email',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>LINE Channel Token</Form.Label>
                            <Form.Control
                              type="password"
                              value={settings.notification.line_channel_token}
                              onChange={(e) =>
                                handleChange(
                                  'notification',
                                  'line_channel_token',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <h6 className="mb-3">通知類型</h6>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="notify_new_adoption"
                              label="新認養申請"
                              checked={
                                settings.notification.notification_types
                                  .new_adoption
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  'notification',
                                  'notification_types',
                                  'new_adoption',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="notify_new_donation"
                              label="新捐款"
                              checked={
                                settings.notification.notification_types
                                  .new_donation
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  'notification',
                                  'notification_types',
                                  'new_donation',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="notify_new_order"
                              label="新訂單"
                              checked={
                                settings.notification.notification_types
                                  .new_order
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  'notification',
                                  'notification_types',
                                  'new_order',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="notify_low_stock"
                              label="庫存不足"
                              checked={
                                settings.notification.notification_types
                                  .low_stock
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  'notification',
                                  'notification_types',
                                  'low_stock',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="notify_system_alert"
                              label="系統警告"
                              checked={
                                settings.notification.notification_types
                                  .system_alert
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  'notification',
                                  'notification_types',
                                  'system_alert',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="security">
                    <h5 className="mb-4">安全設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="enable_2fa"
                              label="啟用雙重認證"
                              checked={settings.security.enable_2fa}
                              onChange={(e) =>
                                handleChange(
                                  'security',
                                  'enable_2fa',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>密碼有效期限（天）</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.security.password_expiry_days}
                              onChange={(e) =>
                                handleChange(
                                  'security',
                                  'password_expiry_days',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>最大登入嘗試次數</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.security.max_login_attempts}
                              onChange={(e) =>
                                handleChange(
                                  'security',
                                  'max_login_attempts',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>工作階段逾時（分鐘）</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.security.session_timeout_minutes}
                              onChange={(e) =>
                                handleChange(
                                  'security',
                                  'session_timeout_minutes',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>允許的IP地址（以逗號分隔）</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.security.allowed_ips.join(', ')}
                              onChange={(e) =>
                                handleChange(
                                  'security',
                                  'allowed_ips',
                                  e.target.value
                                    .split(',')
                                    .map((ip) => ip.trim())
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="mail">
                    <h5 className="mb-4">郵件設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP主機</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.mail.smtp_host}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'smtp_host',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP端口</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.mail.smtp_port}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'smtp_port',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP用戶名</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.mail.smtp_user}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'smtp_user',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP密碼</Form.Label>
                            <Form.Control
                              type="password"
                              value={settings.mail.smtp_password}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'smtp_password',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>寄件者名稱</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.mail.from_name}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'from_name',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>寄件者信箱</Form.Label>
                            <Form.Control
                              type="email"
                              value={settings.mail.from_email}
                              onChange={(e) =>
                                handleChange(
                                  'mail',
                                  'from_email',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="storage">
                    <h5 className="mb-4">儲存設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>儲存提供商</Form.Label>
                            <Form.Select
                              value={settings.storage.provider}
                              onChange={(e) =>
                                handleChange(
                                  'storage',
                                  'provider',
                                  e.target.value
                                )
                              }
                            >
                              <option value="local">本地儲存</option>
                              <option value="aws">AWS S3</option>
                              <option value="gcp">Google Cloud Storage</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>地區</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.storage.region}
                              onChange={(e) =>
                                handleChange(
                                  'storage',
                                  'region',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>儲存桶名稱</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.storage.bucket}
                              onChange={(e) =>
                                handleChange(
                                  'storage',
                                  'bucket',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Access Key</Form.Label>
                            <Form.Control
                              type="password"
                              value={settings.storage.access_key}
                              onChange={(e) =>
                                handleChange(
                                  'storage',
                                  'access_key',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Secret Key</Form.Label>
                            <Form.Control
                              type="password"
                              value={settings.storage.secret_key}
                              onChange={(e) =>
                                handleChange(
                                  'storage',
                                  'secret_key',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="backup">
                    <h5 className="mb-4">備份設定</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="auto_backup"
                              label="啟用自動備份"
                              checked={settings.backup.auto_backup}
                              onChange={(e) =>
                                handleChange(
                                  'backup',
                                  'auto_backup',
                                  e.target.checked
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>備份頻率</Form.Label>
                            <Form.Select
                              value={settings.backup.backup_frequency}
                              onChange={(e) =>
                                handleChange(
                                  'backup',
                                  'backup_frequency',
                                  e.target.value
                                )
                              }
                            >
                              <option value="hourly">每小時</option>
                              <option value="daily">每天</option>
                              <option value="weekly">每週</option>
                              <option value="monthly">每月</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>備份時間</Form.Label>
                            <Form.Control
                              type="time"
                              value={settings.backup.backup_time}
                              onChange={(e) =>
                                handleChange(
                                  'backup',
                                  'backup_time',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>保留備份數量</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.backup.keep_backups}
                              onChange={(e) =>
                                handleChange(
                                  'backup',
                                  'keep_backups',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>備份位置</Form.Label>
                            <Form.Select
                              value={settings.backup.backup_location}
                              onChange={(e) =>
                                handleChange(
                                  'backup',
                                  'backup_location',
                                  e.target.value
                                )
                              }
                            >
                              <option value="local">本地</option>
                              <option value="cloud">雲端</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary">
                          <Save size={18} className="me-2" />
                          保存設定
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  )
}

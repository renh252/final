'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Tab, Nav, Form, Badge } from 'react-bootstrap'
import { ArrowLeft, Save, Trash, Heart } from 'lucide-react'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import { useTheme } from '../../ThemeContext'
import Link from 'next/link'

// 模擬寵物數據
const MOCK_PET = {
  id: 1,
  name: 'Pet1',
  gender: '母',
  species: '狗',
  variety: '貴賓',
  birthday: '2024-01-31',
  weight: 31.84,
  chip_number: '8958766700',
  fixed: 1,
  story: 'This is the story of Pet1. It is a very lovely pet.',
  store_id: 1,
  created_at: '2025-01-14',
  is_adopted: 0,
  main_photo: 'https://via.placeholder.com/300',
  store_name: 'Pet Store 1',
  photos: [
    'https://via.placeholder.com/300',
    'https://via.placeholder.com/300',
    'https://via.placeholder.com/300',
  ],
  traits: [
    { id: 1, name: '親人', category: '性格' },
    { id: 2, name: '活潑', category: '性格' },
    { id: 3, name: '已接種疫苗', category: '健康' },
  ],
  appointments: [
    {
      id: 101,
      date: '2025-02-15',
      time: '14:00',
      status: '已確認',
      user_name: '王小明',
    },
    {
      id: 102,
      date: '2025-02-20',
      time: '10:30',
      status: '待確認',
      user_name: '李小花',
    },
  ],
}

// 寵物店鋪選項
const STORE_OPTIONS = [
  { value: 1, label: 'Pet Store 1' },
  { value: 2, label: 'Pet Store 2' },
  { value: 3, label: 'Pet Store 3' },
  { value: 4, label: 'Pet Store 4' },
  { value: 5, label: 'Pet Store 5' },
  { value: 6, label: 'Pet Store 6' },
  { value: 7, label: 'Pet Store 7' },
  { value: 8, label: 'Pet Store 8' },
  { value: 9, label: 'Pet Store 9' },
  { value: 10, label: 'Pet Store 10' },
]

// 性別選項
const GENDER_OPTIONS = [
  { value: '公', label: '公' },
  { value: '母', label: '母' },
]

// 是否絕育選項
const FIXED_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
]

// 是否已領養選項
const ADOPTED_OPTIONS = [
  { value: 0, label: '可領養' },
  { value: 1, label: '已領養' },
]

export default function PetDetailPage({ params }: { params: { pid: string } }) {
  const [pet, setPet] = useState(MOCK_PET)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(MOCK_PET)
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 模擬從API獲取寵物數據
  useEffect(() => {
    // 這裡可以根據params.pid從API獲取寵物數據
    console.log(`獲取寵物ID: ${params.pid}的數據`)
  }, [params.pid])

  // 處理表單變更
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target
    let newValue: any = value

    // 處理特殊類型
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }))
  }

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模擬API請求
    setTimeout(() => {
      // 找到對應的店鋪名稱
      const store = STORE_OPTIONS.find(
        (s) => s.value === Number(formData.store_id)
      )
      const storeName = store ? store.label : ''

      setPet({
        ...formData,
        store_name: storeName,
      })
      setIsEditing(false)
      showToast('success', '更新成功', '寵物資料已成功更新')
    }, 500)
  }

  // 處理刪除寵物
  const handleDeletePet = () => {
    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物 ${pet.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          showToast('success', '刪除成功', `寵物 ${pet.name} 已成功刪除`)
          // 這裡可以導航回寵物列表頁面
        }, 500)
      },
    })
  }

  // 計算寵物年齡
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  return (
    <div className="pet-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/admin/pets" className="btn btn-link p-0 me-3">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="mb-0">寵物詳情</h2>
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
                onClick={handleDeletePet}
                className="d-flex align-items-center"
              >
                <Trash size={18} className="me-2" /> 刪除寵物
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
                  src={pet.main_photo}
                  alt={pet.name}
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '250px', objectFit: 'cover' }}
                />
                <h4>{pet.name}</h4>
                <div className="d-flex justify-content-center gap-2 mb-2">
                  <Badge bg="info">{pet.species}</Badge>
                  <Badge bg="secondary">{pet.variety}</Badge>
                  <Badge bg={pet.is_adopted === 0 ? 'success' : 'primary'}>
                    {pet.is_adopted === 0 ? '可領養' : '已領養'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-center flex-wrap gap-1 mt-2">
                  {pet.traits.map((trait) => (
                    <Badge
                      key={trait.id}
                      bg="light"
                      text="dark"
                      className="me-1 mb-1"
                    >
                      {trait.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {isEditing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>名稱</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>類型</Form.Label>
                    <Form.Control
                      type="text"
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>品種</Form.Label>
                    <Form.Control
                      type="text"
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>性別</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>出生日期</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>體重(kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.01"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>晶片號碼</Form.Label>
                    <Form.Control
                      type="text"
                      name="chip_number"
                      value={formData.chip_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>是否絕育</Form.Label>
                    <Form.Select
                      name="fixed"
                      value={formData.fixed}
                      onChange={handleChange}
                    >
                      {FIXED_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>是否已領養</Form.Label>
                    <Form.Select
                      name="is_adopted"
                      value={formData.is_adopted}
                      onChange={handleChange}
                    >
                      {ADOPTED_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>所屬店鋪</Form.Label>
                    <Form.Select
                      name="store_id"
                      value={formData.store_id}
                      onChange={handleChange}
                    >
                      {STORE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>寵物故事</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="story"
                      value={formData.story}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              ) : (
                <div>
                  <p>
                    <strong>性別：</strong> {pet.gender}
                  </p>
                  <p>
                    <strong>年齡：</strong> {calculateAge(pet.birthday)} 歲
                  </p>
                  <p>
                    <strong>體重：</strong> {pet.weight} kg
                  </p>
                  <p>
                    <strong>晶片號碼：</strong> {pet.chip_number}
                  </p>
                  <p>
                    <strong>是否絕育：</strong> {pet.fixed === 1 ? '是' : '否'}
                  </p>
                  <p>
                    <strong>所屬店鋪：</strong> {pet.store_name}
                  </p>
                  <p>
                    <strong>建立日期：</strong>{' '}
                    {new Date(pet.created_at).toLocaleDateString('zh-TW')}
                  </p>
                  <div className="mt-3">
                    <h6>寵物故事</h6>
                    <p>{pet.story}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <Tab.Container defaultActiveKey="photos">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="photos">相片集</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appointments">預約記錄</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="traits">特徵標籤</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="photos">
                    <h5 className="mb-3">相片集</h5>
                    <Row>
                      {pet.photos.map((photo, index) => (
                        <Col key={index} md={4} className="mb-3">
                          <Card>
                            <Card.Img variant="top" src={photo} />
                            <Card.Body className="p-2">
                              <div className="d-flex justify-content-between">
                                <Button variant="outline-primary" size="sm">
                                  設為主圖
                                </Button>
                                <Button variant="outline-danger" size="sm">
                                  刪除
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                      <Col md={4} className="mb-3">
                        <Card
                          className="h-100 d-flex justify-content-center align-items-center"
                          style={{ minHeight: '200px' }}
                        >
                          <Button variant="outline-primary">+ 新增相片</Button>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="appointments">
                    <h5 className="mb-3">預約記錄</h5>
                    {pet.appointments.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>日期</th>
                            <th>時間</th>
                            <th>預約者</th>
                            <th>狀態</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pet.appointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td>{appointment.id}</td>
                              <td>{appointment.date}</td>
                              <td>{appointment.time}</td>
                              <td>{appointment.user_name}</td>
                              <td>
                                <Badge
                                  bg={
                                    appointment.status === '已確認'
                                      ? 'success'
                                      : 'warning'
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="outline-primary" size="sm">
                                  查看
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted">無預約記錄</p>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="traits">
                    <h5 className="mb-3">特徵標籤</h5>
                    <Row>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>性格特徵</Card.Header>
                          <Card.Body>
                            <div className="d-flex flex-wrap gap-2">
                              {pet.traits
                                .filter((trait) => trait.category === '性格')
                                .map((trait) => (
                                  <Badge
                                    key={trait.id}
                                    bg="primary"
                                    className="p-2"
                                  >
                                    {trait.name}{' '}
                                    <span
                                      className="ms-1"
                                      style={{ cursor: 'pointer' }}
                                    >
                                      &times;
                                    </span>
                                  </Badge>
                                ))}
                              <Button variant="outline-primary" size="sm">
                                + 新增
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>健康狀況</Card.Header>
                          <Card.Body>
                            <div className="d-flex flex-wrap gap-2">
                              {pet.traits
                                .filter((trait) => trait.category === '健康')
                                .map((trait) => (
                                  <Badge
                                    key={trait.id}
                                    bg="success"
                                    className="p-2"
                                  >
                                    {trait.name}{' '}
                                    <span
                                      className="ms-1"
                                      style={{ cursor: 'pointer' }}
                                    >
                                      &times;
                                    </span>
                                  </Badge>
                                ))}
                              <Button variant="outline-primary" size="sm">
                                + 新增
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
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

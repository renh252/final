'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Tab,
  Nav,
  Form,
  Badge,
  InputGroup,
} from 'react-bootstrap'
import { ArrowLeft, Save, Trash, Tag, BarChart2 } from 'lucide-react'
import { useToast } from '@/app/admin/components/Toast'
import { useConfirm } from '@/app/admin/components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import Link from 'next/link'

// 模擬商品數據
const MOCK_PRODUCT = {
  id: 1,
  name: '優質貓糧',
  category: 'food',
  price: 599,
  stock: 100,
  status: 'active',
  image: 'https://via.placeholder.com/300',
  createdAt: '2023-01-15',
  description:
    '高品質貓糧，適合各年齡段的貓咪食用。富含優質蛋白質和必要的營養素，有助於貓咪的健康成長。',
  images: [
    'https://via.placeholder.com/300',
    'https://via.placeholder.com/300',
    'https://via.placeholder.com/300',
  ],
  variants: [
    { id: 1, name: '小包裝', price: 599, stock: 50 },
    { id: 2, name: '中包裝', price: 999, stock: 30 },
    { id: 3, name: '大包裝', price: 1599, stock: 20 },
  ],
  reviews: [
    {
      id: 1,
      user_name: '王小明',
      rating: 5,
      comment: '我家的貓咪很喜歡這款貓糧！',
      date: '2023-02-10',
    },
    {
      id: 2,
      user_name: '李小花',
      rating: 4,
      comment: '品質不錯，但價格稍高。',
      date: '2023-03-05',
    },
  ],
  sales: [
    { month: '1月', amount: 20 },
    { month: '2月', amount: 35 },
    { month: '3月', amount: 28 },
    { month: '4月', amount: 42 },
    { month: '5月', amount: 50 },
    { month: '6月', amount: 45 },
  ],
}

// 商品分類選項
const CATEGORY_OPTIONS = [
  { value: 'food', label: '飼料與食品' },
  { value: 'toy', label: '玩具' },
  { value: 'accessory', label: '配件' },
  { value: 'grooming', label: '美容與清潔' },
  { value: 'health', label: '保健品' },
]

// 商品狀態選項
const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '下架中' },
]

export default function ProductDetailPage({
  params,
}: {
  params: { pid: string }
}) {
  const [product, setProduct] = useState(MOCK_PRODUCT)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(MOCK_PRODUCT)
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()

  // 模擬從API獲取商品數據
  useEffect(() => {
    // 這裡可以根據params.pid從API獲取商品數據
    console.log(`獲取商品ID: ${params.pid}的數據`)
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
      setProduct(formData)
      setIsEditing(false)
      showToast('success', '更新成功', '商品資料已成功更新')
    }, 500)
  }

  // 處理刪除商品
  const handleDeleteProduct = () => {
    confirm({
      title: '刪除商品',
      message: `確定要刪除商品 ${product.name} 嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: () => {
        // 模擬API請求
        setTimeout(() => {
          showToast('success', '刪除成功', `商品 ${product.name} 已成功刪除`)
          // 這裡可以導航回商品列表頁面
        }, 500)
      },
    })
  }

  // 處理變體編輯
  const handleVariantChange = (id: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]:
                field === 'price' || field === 'stock' ? Number(value) : value,
            }
          : variant
      ),
    }))
  }

  // 處理添加變體
  const handleAddVariant = () => {
    const newVariant = {
      id: Math.max(...formData.variants.map((v) => v.id)) + 1,
      name: '',
      price: 0,
      stock: 0,
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }))
  }

  // 處理刪除變體
  const handleDeleteVariant = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== id),
    }))
  }

  return (
    <div className="product-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/admin/shop/products" className="btn btn-link p-0 me-3">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="mb-0">商品詳情</h2>
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
                onClick={handleDeleteProduct}
                className="d-flex align-items-center"
              >
                <Trash size={18} className="me-2" /> 刪除商品
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
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '250px', objectFit: 'cover' }}
                />
                <h4>{product.name}</h4>
                <div className="d-flex justify-content-center gap-2 mb-2">
                  <Badge bg="info">
                    {CATEGORY_OPTIONS.find((c) => c.value === product.category)
                      ?.label || product.category}
                  </Badge>
                  <Badge
                    bg={product.status === 'active' ? 'success' : 'secondary'}
                  >
                    {product.status === 'active' ? '上架中' : '下架中'}
                  </Badge>
                </div>
                <div className="mt-2">
                  <h5 className="text-primary">${product.price}</h5>
                  <p className="mb-0">庫存: {product.stock} 件</p>
                </div>
              </div>

              {isEditing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>商品名稱</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>分類</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>價格</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>庫存</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>狀態</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>商品描述</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              ) : (
                <div>
                  <div className="mt-3">
                    <h6>商品描述</h6>
                    <p>{product.description}</p>
                  </div>
                  <p>
                    <strong>建立日期：</strong>{' '}
                    {new Date(product.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <Tab.Container defaultActiveKey="variants">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="variants">商品規格</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="images">商品圖片</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reviews">商品評價</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="sales">銷售統計</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="variants">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">商品規格</h5>
                      {isEditing && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleAddVariant}
                          className="d-flex align-items-center"
                        >
                          <Tag size={16} className="me-1" /> 新增規格
                        </Button>
                      )}
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>規格名稱</th>
                          <th>價格</th>
                          <th>庫存</th>
                          {isEditing && <th>操作</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(isEditing ? formData.variants : product.variants).map(
                          (variant) => (
                            <tr key={variant.id}>
                              <td>
                                {isEditing ? (
                                  <Form.Control
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant.id,
                                        'name',
                                        e.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  variant.name
                                )}
                              </td>
                              <td>
                                {isEditing ? (
                                  <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control
                                      type="number"
                                      value={variant.price}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          variant.id,
                                          'price',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </InputGroup>
                                ) : (
                                  `$${variant.price}`
                                )}
                              </td>
                              <td>
                                {isEditing ? (
                                  <Form.Control
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant.id,
                                        'stock',
                                        e.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  variant.stock
                                )}
                              </td>
                              {isEditing && (
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteVariant(variant.id)
                                    }
                                  >
                                    刪除
                                  </Button>
                                </td>
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </Tab.Pane>

                  <Tab.Pane eventKey="images">
                    <h5 className="mb-3">商品圖片</h5>
                    <Row>
                      {product.images.map((image, index) => (
                        <Col key={index} md={4} className="mb-3">
                          <Card>
                            <Card.Img variant="top" src={image} />
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
                          <Button variant="outline-primary">+ 新增圖片</Button>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="reviews">
                    <h5 className="mb-3">商品評價</h5>
                    {product.reviews.length > 0 ? (
                      <div>
                        {product.reviews.map((review) => (
                          <Card key={review.id} className="mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6>{review.user_name}</h6>
                                  <div className="mb-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span
                                        key={i}
                                        className={
                                          i < review.rating
                                            ? 'text-warning'
                                            : 'text-muted'
                                        }
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {review.date}
                                </small>
                              </div>
                              <p className="mb-0">{review.comment}</p>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">無商品評價</p>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="sales">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">銷售統計</h5>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                        >
                          匯出報表
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <BarChart2 size={16} className="me-1" /> 詳細分析
                        </Button>
                      </div>
                    </div>

                    <div
                      className="sales-chart p-3 bg-light rounded"
                      style={{ height: '300px' }}
                    >
                      <div className="d-flex justify-content-between h-100">
                        {product.sales.map((item, index) => (
                          <div
                            key={index}
                            className="d-flex flex-column justify-content-end align-items-center"
                            style={{ width: `${100 / product.sales.length}%` }}
                          >
                            <div
                              className="bg-primary rounded-top"
                              style={{
                                width: '30px',
                                height: `${
                                  (item.amount /
                                    Math.max(
                                      ...product.sales.map((s) => s.amount)
                                    )) *
                                  80
                                }%`,
                              }}
                            ></div>
                            <div className="mt-2 text-center">
                              <small>{item.month}</small>
                              <div>
                                <strong>{item.amount}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6>銷售摘要</h6>
                      <Row>
                        <Col md={3} className="mb-3">
                          <Card className="text-center p-3">
                            <h3>
                              {product.sales.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )}
                            </h3>
                            <div>總銷量</div>
                          </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                          <Card className="text-center p-3">
                            <h3>
                              $
                              {product.sales.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              ) * product.price}
                            </h3>
                            <div>總銷售額</div>
                          </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                          <Card className="text-center p-3">
                            <h3>
                              {Math.max(...product.sales.map((s) => s.amount))}
                            </h3>
                            <div>最高月銷量</div>
                          </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                          <Card className="text-center p-3">
                            <h3>
                              {Math.round(
                                product.sales.reduce(
                                  (sum, item) => sum + item.amount,
                                  0
                                ) / product.sales.length
                              )}
                            </h3>
                            <div>平均月銷量</div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
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

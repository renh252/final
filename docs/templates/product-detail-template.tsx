'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Table,
  Tabs,
  Tab,
  Badge,
  InputGroup,
  Spinner,
} from 'react-bootstrap'
import {
  Package,
  DollarSign,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Trash2,
  Plus,
  Tag,
  Box,
  BarChart,
  Settings,
} from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import Cookies from 'js-cookie'

// 產品狀態定義
const PRODUCT_STATUS = {
  ACTIVE: { value: '上架中', color: 'success' },
  DRAFT: { value: '草稿', color: 'secondary' },
  OUT_OF_STOCK: { value: '缺貨中', color: 'danger' },
  DISCONTINUED: { value: '已下架', color: 'warning' },
}

// 產品分類
const PRODUCT_CATEGORIES = [
  { id: 1, name: '狗狗飼料' },
  { id: 2, name: '貓咪飼料' },
  { id: 3, name: '寵物玩具' },
  { id: 4, name: '寵物保健' },
  { id: 5, name: '寵物清潔' },
]

export default function ProductDetailTemplate() {
  const { pid } = useParams() as { pid: string }
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [variants, setVariants] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])

  // 獲取產品詳情
  useEffect(() => {
    fetchProductDetails()
  }, [pid])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get('admin_token')
      if (!token) {
        setError('未登入或登入狀態已過期')
        setLoading(false)
        return
      }

      // 模擬 API 請求
      setTimeout(() => {
        // 模擬產品資料
        const mockProduct = {
          product_id: pid,
          product_code: `P${pid.padStart(6, '0')}`,
          name: '寵物潔牙骨 - 狗狗專用',
          description: '優質潔牙骨，幫助狗狗清潔牙齒，預防牙結石...',
          category_id: 3,
          status: 'ACTIVE',
          base_price: 299,
          sale_price: 250,
          stock: 150,
          min_stock: 30,
          created_at: '2024-03-15 10:30:00',
          updated_at: '2024-03-20 15:45:00',
          seo: {
            meta_title: '寵物潔牙骨 | 狗狗牙齒保健首選',
            meta_description: '專業設計的狗狗潔牙骨，有效清潔牙齒...',
            keywords: '狗狗潔牙骨,寵物牙齒保健,狗狗零食',
          },
          specifications: [
            { key: '重量', value: '100g' },
            { key: '適用寵物', value: '狗狗' },
            { key: '適用年齡', value: '6個月以上' },
            { key: '產地', value: '台灣' },
          ],
        }

        // 模擬產品變體
        const mockVariants = [
          {
            id: 1,
            name: '小型犬專用',
            sku: 'DB-S-001',
            price: 250,
            stock: 50,
            weight: '100g',
          },
          {
            id: 2,
            name: '中型犬專用',
            sku: 'DB-M-001',
            price: 299,
            stock: 60,
            weight: '200g',
          },
          {
            id: 3,
            name: '大型犬專用',
            sku: 'DB-L-001',
            price: 399,
            stock: 40,
            weight: '300g',
          },
        ]

        // 模擬產品圖片
        const mockImages = [
          {
            id: 1,
            url: 'https://via.placeholder.com/500',
            is_primary: true,
            sort_order: 1,
          },
          {
            id: 2,
            url: 'https://via.placeholder.com/500',
            is_primary: false,
            sort_order: 2,
          },
          {
            id: 3,
            url: 'https://via.placeholder.com/500',
            is_primary: false,
            sort_order: 3,
          },
        ]

        setProduct(mockProduct)
        setVariants(mockVariants)
        setImages(mockImages)
        setLoading(false)
      }, 800)
    } catch (err) {
      console.error('獲取產品詳情失敗:', err)
      setError('獲取產品詳情失敗，請稍後再試')
      setLoading(false)
    }
  }

  // 儲存產品資訊
  const handleSave = async () => {
    try {
      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: '確認儲存',
          message: '確定要儲存產品資訊的修改嗎？',
          confirmText: '確認儲存',
          cancelText: '取消',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      setLoading(true)
      // 這裡應該呼叫真實的 API 儲存產品資訊
      setTimeout(() => {
        setLoading(false)
        showToast('success', '操作成功', '產品資訊已更新')
      }, 800)
    } catch (err) {
      console.error('儲存產品資訊失敗:', err)
      showToast('error', '操作失敗', '儲存產品資訊失敗，請稍後再試')
      setLoading(false)
    }
  }

  // 刪除產品
  const handleDelete = async () => {
    try {
      const confirmResult = await new Promise<boolean>((resolve) => {
        confirm({
          title: '確認刪除',
          message: '確定要刪除此產品嗎？此操作無法復原。',
          confirmText: '確認刪除',
          cancelText: '取消',
          type: 'danger',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })

      if (!confirmResult) return

      setLoading(true)
      // 這裡應該呼叫真實的 API 刪除產品
      setTimeout(() => {
        router.push('/admin/shop/products')
        showToast('success', '操作成功', '產品已刪除')
      }, 800)
    } catch (err) {
      console.error('刪除產品失敗:', err)
      showToast('error', '操作失敗', '刪除產品失敗，請稍後再試')
      setLoading(false)
    }
  }

  // 返回產品列表
  const handleBackToList = () => {
    router.push('/admin/shop/products')
  }

  // 渲染加載中狀態
  if (loading && !product) {
    return (
      <AdminPageLayout title="產品詳情">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">載入產品資料中...</p>
        </div>
      </AdminPageLayout>
    )
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <AdminPageLayout title="產品詳情">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBackToList}>
          <ArrowLeft size={16} className="me-1" /> 返回產品列表
        </Button>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout title={`產品詳情: ${product?.name}`}>
      {/* 頂部操作按鈕 */}
      <AdminSection>
        <div className="d-flex justify-content-between mb-3">
          <Button variant="light" onClick={handleBackToList}>
            <ArrowLeft size={16} className="me-1" /> 返回產品列表
          </Button>
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={16} className="me-1" /> 刪除產品
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save size={16} className="me-1" /> 儲存變更
            </Button>
          </div>
        </div>
      </AdminSection>

      {/* 產品資訊卡片 */}
      <AdminSection>
        <Tabs
          id="product-tabs"
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          {/* 基本資訊頁籤 */}
          <Tab eventKey="basic" title="基本資訊">
            <Row>
              <Col md={8}>
                <AdminCard>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>產品名稱</Form.Label>
                      <Form.Control
                        type="text"
                        value={product?.name}
                        onChange={(e) =>
                          setProduct({ ...product, name: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>產品描述</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={product?.description}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            description: e.target.value,
                          })
                        }
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>產品分類</Form.Label>
                          <Form.Select
                            value={product?.category_id}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                category_id: Number(e.target.value),
                              })
                            }
                          >
                            {PRODUCT_CATEGORIES.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>產品狀態</Form.Label>
                          <Form.Select
                            value={product?.status}
                            onChange={(e) =>
                              setProduct({ ...product, status: e.target.value })
                            }
                          >
                            {Object.entries(PRODUCT_STATUS).map(
                              ([key, value]) => (
                                <option key={key} value={key}>
                                  {value.value}
                                </option>
                              )
                            )}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>原價</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>NT$</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={product?.base_price}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  base_price: Number(e.target.value),
                                })
                              }
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>售價</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>NT$</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={product?.sale_price}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  sale_price: Number(e.target.value),
                                })
                              }
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>庫存數量</Form.Label>
                          <Form.Control
                            type="number"
                            value={product?.stock}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                stock: Number(e.target.value),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>最低庫存警告</Form.Label>
                          <Form.Control
                            type="number"
                            value={product?.min_stock}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                min_stock: Number(e.target.value),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </AdminCard>
              </Col>

              <Col md={4}>
                {/* 產品圖片 */}
                <AdminCard>
                  <h5 className="mb-3">產品圖片</h5>
                  <div className="product-images">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="position-relative mb-2"
                        style={{
                          backgroundImage: `url(${image.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          width: '100%',
                          height: '150px',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="position-absolute top-0 end-0 p-2">
                          <Button
                            variant="danger"
                            size="sm"
                            className="rounded-circle"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        {image.is_primary && (
                          <Badge
                            bg="primary"
                            className="position-absolute bottom-0 start-0 m-2"
                          >
                            主圖
                          </Badge>
                        )}
                      </div>
                    ))}
                    <Button variant="outline-primary" className="w-100">
                      <ImageIcon size={16} className="me-1" /> 新增圖片
                    </Button>
                  </div>
                </AdminCard>

                {/* 產品規格 */}
                <AdminCard className="mt-3">
                  <h5 className="mb-3">產品規格</h5>
                  {product?.specifications.map((spec: any, index: number) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        value={spec.key}
                        className="me-2"
                        placeholder="規格名稱"
                      />
                      <Form.Control
                        type="text"
                        value={spec.value}
                        placeholder="規格值"
                      />
                      <Button variant="link" className="text-danger">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline-secondary" size="sm">
                    <Plus size={16} className="me-1" /> 新增規格
                  </Button>
                </AdminCard>
              </Col>
            </Row>
          </Tab>

          {/* 商品變體頁籤 */}
          <Tab eventKey="variants" title="商品變體">
            <AdminCard>
              <div className="d-flex justify-content-between mb-3">
                <h5 className="mb-0">變體管理</h5>
                <Button variant="primary" size="sm">
                  <Plus size={16} className="me-1" /> 新增變體
                </Button>
              </div>

              <Table responsive>
                <thead>
                  <tr>
                    <th>變體名稱</th>
                    <th>SKU</th>
                    <th>價格</th>
                    <th>庫存</th>
                    <th>重量</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id}>
                      <td>{variant.name}</td>
                      <td>{variant.sku}</td>
                      <td>NT$ {variant.price}</td>
                      <td>{variant.stock}</td>
                      <td>{variant.weight}</td>
                      <td>
                        <Button variant="link" className="text-danger p-0">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </AdminCard>
          </Tab>

          {/* SEO 設定頁籤 */}
          <Tab eventKey="seo" title="SEO 設定">
            <AdminCard>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Meta 標題</Form.Label>
                  <Form.Control
                    type="text"
                    value={product?.seo.meta_title}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        seo: { ...product.seo, meta_title: e.target.value },
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta 描述</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={product?.seo.meta_description}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        seo: {
                          ...product.seo,
                          meta_description: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>關鍵字</Form.Label>
                  <Form.Control
                    type="text"
                    value={product?.seo.keywords}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        seo: { ...product.seo, keywords: e.target.value },
                      })
                    }
                    placeholder="以逗號分隔多個關鍵字"
                  />
                </Form.Group>
              </Form>
            </AdminCard>
          </Tab>

          {/* 銷售數據頁籤 */}
          <Tab eventKey="stats" title="銷售數據">
            <AdminCard>
              <div className="text-center py-5">
                <BarChart size={48} className="text-muted mb-3" />
                <p className="text-muted">銷售數據功能開發中...</p>
              </div>
            </AdminCard>
          </Tab>
        </Tabs>
      </AdminSection>
    </AdminPageLayout>
  )
}

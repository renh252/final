'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Tab,
  Nav,
  Form,
  Badge,
  Alert,
} from 'react-bootstrap'
import { ArrowLeft, Save, Trash, Heart } from 'lucide-react'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '../../ThemeContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function PetDetailPage({ params }: { params: { pid: string } }) {
  const [pet, setPet] = useState(null)
  const [photos, setPhotos] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempt, setFetchAttempt] = useState(0)
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const router = useRouter()

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 從API獲取寵物數據
  const fetchPet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/pets/${params.pid}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `伺服器回應錯誤: ${response.status}`)
      }

      const data = await response.json()
      setPet(data.pet || null)
      setPhotos(data.photos || [])
      setFormData(data.pet || null)
    } catch (error) {
      console.error(`獲取寵物 ID: ${params.pid} 時發生錯誤:`, error)
      setError(
        error instanceof Error ? error.message : '獲取資料失敗，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }, [params.pid])

  useEffect(() => {
    // 只有在嘗試次數小於 3 次時才獲取資料
    if (fetchAttempt < 3) {
      const token = getToken()
      // 如果已經有寵物數據且不是重試，則不再獲取
      if (token && (!pet || fetchAttempt > 0)) {
        fetchPet().catch(() => {
          // 增加嘗試次數
          setFetchAttempt((prev) => prev + 1)
        })
      } else if (pet) {
        // 如果已經有數據，設置 loading 為 false
        setLoading(false)
      }
    }
  }, [fetchAttempt, fetchPet, pet])

  // 重試獲取資料
  const handleRetry = () => {
    setFetchAttempt(0) // 重置嘗試次數
  }

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/pets/${params.pid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `伺服器回應錯誤: ${response.status}`)
      }

      // 更新寵物資料
      setPet(formData)
      setIsEditing(false)
      showToast('success', '更新成功', '寵物資料已成功更新')
    } catch (error) {
      console.error('更新寵物資料時發生錯誤:', error)
      showToast(
        'error',
        '更新失敗',
        error instanceof Error ? error.message : '無法更新寵物資料，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }

  // 處理刪除寵物
  const handleDeletePet = () => {
    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物「${pet?.name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/admin/pets/${params.pid}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
              errorData.error || `伺服器回應錯誤: ${response.status}`
            )
          }

          showToast('success', '刪除成功', `寵物 ${pet?.name} 已成功刪除`)
          router.push('/admin/pets')
        } catch (error) {
          console.error('刪除寵物時發生錯誤:', error)
          showToast(
            'error',
            '刪除失敗',
            error instanceof Error ? error.message : '無法刪除寵物，請稍後再試'
          )
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // 處理照片上傳
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 這裡應該實現照片上傳邏輯
    // 由於這需要文件上傳服務，這裡只是示例
    showToast('info', '功能開發中', '照片上傳功能正在開發中')
  }

  // 處理照片刪除
  const handleDeletePhoto = async (photoId: number) => {
    confirm({
      title: '刪除照片',
      message: '確定要刪除此照片嗎？此操作無法撤銷。',
      onConfirm: async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/admin/pets/photos/${photoId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
              errorData.error || `伺服器回應錯誤: ${response.status}`
            )
          }

          // 更新照片列表
          setPhotos(photos.filter((photo) => photo.id !== photoId))
          showToast('success', '刪除成功', '照片已成功刪除')
        } catch (error) {
          console.error('刪除照片時發生錯誤:', error)
          showToast(
            'error',
            '刪除失敗',
            error instanceof Error ? error.message : '無法刪除照片，請稍後再試'
          )
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // 設置主照片
  const handleSetMainPhoto = async (photoId: number, photoUrl: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/pets/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_main: 1 }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `伺服器回應錯誤: ${response.status}`)
      }

      // 更新照片列表
      setPhotos(
        photos.map((photo) => ({
          ...photo,
          is_main: photo.id === photoId ? 1 : 0,
        }))
      )

      // 更新寵物主照片
      setPet((prev) => ({
        ...prev,
        main_photo: photoUrl,
      }))

      if (formData) {
        setFormData((prev) => ({
          ...prev,
          main_photo: photoUrl,
        }))
      }

      showToast('success', '設置成功', '主照片已成功設置')
    } catch (error) {
      console.error('設置主照片時發生錯誤:', error)
      showToast(
        'error',
        '設置失敗',
        error instanceof Error ? error.message : '無法設置主照片，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
        <p className="mt-2">載入寵物資料中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-5">
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>獲取資料失敗</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-between">
            <Link href="/admin/pets" className="btn btn-outline-secondary">
              <ArrowLeft size={18} className="me-2" /> 返回列表
            </Link>
            <Button variant="outline-danger" onClick={handleRetry}>
              重試
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="text-center py-5">
        <h3>找不到此寵物</h3>
        <Link href="/admin/pets" className="btn btn-primary mt-3">
          返回寵物列表
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link href="/admin/pets" className="btn btn-outline-secondary">
          <ArrowLeft size={18} className="me-2" /> 返回列表
        </Link>
        <div>
          {isEditing ? (
            <>
              <Button
                variant="success"
                onClick={handleSubmit}
                className="d-flex align-items-center me-2"
              >
                <Save size={18} className="me-2" /> 儲存變更
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(pet)
                }}
              >
                取消
              </Button>
            </>
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
                  src={pet.main_photo || '/images/default_no_pet.jpg'}
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
                    <Form.Label>性別</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="公">公</option>
                      <option value="母">母</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>種類</Form.Label>
                    <Form.Select
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                    >
                      <option value="狗">狗</option>
                      <option value="貓">貓</option>
                      <option value="其他">其他</option>
                    </Form.Select>
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
                    <Form.Label>出生日期</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>體重 (kg)</Form.Label>
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
                      <option value={1}>是</option>
                      <option value={0}>否</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>領養狀態</Form.Label>
                    <Form.Select
                      name="is_adopted"
                      value={formData.is_adopted}
                      onChange={handleChange}
                    >
                      <option value={0}>可領養</option>
                      <option value={1}>已領養</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>主要照片URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="main_photo"
                      value={formData.main_photo}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              ) : (
                <div className="pet-info">
                  <p>
                    <strong>ID:</strong> {pet.id}
                  </p>
                  <p>
                    <strong>性別:</strong> {pet.gender}
                  </p>
                  <p>
                    <strong>種類:</strong> {pet.species}
                  </p>
                  <p>
                    <strong>品種:</strong> {pet.variety}
                  </p>
                  <p>
                    <strong>出生日期:</strong> {pet.birthday}
                  </p>
                  <p>
                    <strong>體重:</strong> {pet.weight} kg
                  </p>
                  <p>
                    <strong>晶片號碼:</strong> {pet.chip_number || '無'}
                  </p>
                  <p>
                    <strong>是否絕育:</strong> {pet.fixed ? '是' : '否'}
                  </p>
                  <p>
                    <strong>所屬店鋪:</strong> {pet.store_name || '無'}
                  </p>
                  <p>
                    <strong>新增日期:</strong> {pet.created_at}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Tab.Container id="pet-tabs" defaultActiveKey="story">
            <Card className={isDarkMode ? 'bg-dark text-light' : ''}>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="story">寵物故事</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="photos">照片管理</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="story">
                    {isEditing ? (
                      <Form.Group>
                        <Form.Label>寵物故事</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={10}
                          name="story"
                          value={formData.story || ''}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    ) : (
                      <div>
                        <h5>關於 {pet.name}</h5>
                        <p>{pet.story || '尚無寵物故事'}</p>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="photos">
                    <div className="mb-3">
                      <h5>照片管理</h5>
                      <p>管理寵物的照片集，設置主照片或刪除不需要的照片。</p>
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        <div className="form-text">
                          上傳新照片 (支援 JPG, PNG 格式)
                        </div>
                      </div>
                    </div>

                    <Row>
                      {photos.length > 0 ? (
                        photos.map((photo) => (
                          <Col key={photo.id} md={4} className="mb-3">
                            <Card>
                              <Card.Img
                                variant="top"
                                src={photo.photo_url}
                                alt={photo.title || '寵物照片'}
                              />
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                  {photo.is_main ? (
                                    <Badge bg="success">主照片</Badge>
                                  ) : (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() =>
                                        handleSetMainPhoto(
                                          photo.id,
                                          photo.photo_url
                                        )
                                      }
                                    >
                                      設為主照片
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                  >
                                    刪除
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col>
                          <div className="text-center py-4">
                            <p>尚無照片</p>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </div>
  )
}

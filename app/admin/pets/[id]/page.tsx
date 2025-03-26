'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import Cookies from 'js-cookie'
import Link from 'next/link'

// 添加必要的類型定義
interface Pet {
  id: number
  name: string
  gender: string
  species: string
  variety: string
  birthday: string
  weight: number
  chip_number: string | null
  fixed: boolean
  story: string | null
  store_id: number | null
  created_at: string
  is_adopted: boolean
  main_photo: string | null
  photos?: Photo[]
}

interface Photo {
  id: number
  pet_id: number
  photo_url: string
  is_main: boolean
  sort_order: number
  title: string | null
  description: string | null
  created_at: string
}

export default function PetDetailPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Pet> | null>(null)
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 獲取 token
  const getToken = () => {
    return Cookies.get('admin_token') || ''
  }

  // 從API獲取寵物數據
  const fetchPet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/pets/${params.id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      if (!response.ok) {
        throw new Error('獲取寵物資料失敗')
      }

      const data = await response.json()

      // 處理 API 返回的嵌套結構和日期格式
      const petData = {
        ...data.pet,
        fixed: data.pet.fixed === 1 || data.pet.fixed === true,
        is_adopted: data.pet.is_adopted === 1 || data.pet.is_adopted === true,
        // 處理日期格式 (YYYY-MM-DD)
        birthday: data.pet.birthday ? data.pet.birthday.split('T')[0] : '',
        photos: data.photos
          ? data.photos.map((p) => ({
              ...p,
              is_main: p.is_main === 1 || p.is_main === true,
            }))
          : [],
      }

      setPet(petData)
      setFormData(petData)
      setError(null)
    } catch (error) {
      console.error(`獲取寵物 ID: ${params.id} 時發生錯誤:`, error)
      setError(
        error instanceof Error ? error.message : '獲取資料失敗，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // 初始載入
  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData) return

    try {
      setLoading(true)

      // 準備提交資料，確保類型正確
      const submitData = {
        ...formData,
        weight: formData.weight ? Number(formData.weight) : null,
        fixed: formData.fixed ? 1 : 0,
        is_adopted: formData.is_adopted ? 1 : 0,
      }

      const response = await fetch(`/api/admin/pets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error('更新寵物資料失敗')
      }

      await fetchPet()
      showToast('success', '更新成功', '寵物資料已更新')
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
    if (!pet) return

    confirm({
      title: '刪除寵物',
      message: `確定要刪除寵物「${pet.name}」嗎？此操作無法撤銷。`,
      onConfirm: async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/admin/pets/${params.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          })

          if (!response.ok) {
            throw new Error('刪除寵物失敗')
          }

          showToast('success', '刪除成功', '寵物已刪除')
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
    if (!files || files.length === 0 || !pet) return

    try {
      setLoading(true)
      const formData = new FormData()

      // 支援多張照片上傳
      Array.from(files).forEach((file) => {
        formData.append('photos', file)
      })

      const token = getToken()
      if (!token) {
        throw new Error('您尚未登入或登入已過期，請重新登入')
      }

      const response = await fetch(`/api/admin/pets/${params.id}/photos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      // 處理錯誤回應
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        if (errorData && errorData.error) {
          throw new Error(errorData.error)
        }
        throw new Error(`上傳照片失敗 (狀態碼: ${response.status})`)
      }

      const data = await response.json()

      // 顯示成功訊息，包含上傳數量
      showToast('success', '上傳成功', `成功上傳 ${data.count} 張照片`)

      // 重新獲取寵物資料，包含最新照片
      await fetchPet()

      // 清除檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('上傳照片時發生錯誤:', error)
      showToast(
        'error',
        '上傳失敗',
        error instanceof Error ? error.message : '無法上傳照片，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }

  // 處理照片刪除
  const handleDeletePhoto = (photoId: number) => {
    confirm({
      title: '刪除照片',
      message: '確定要刪除此照片嗎？此操作無法撤銷。',
      onConfirm: async () => {
        try {
          setLoading(true)

          // 檢查 token
          const token = getToken()
          if (!token) {
            throw new Error('您尚未登入或登入已過期，請重新登入')
          }

          const response = await fetch(
            `/api/admin/pets/${params.id}/photos?photoId=${photoId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          // 處理錯誤回應
          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            if (errorData && errorData.error) {
              throw new Error(errorData.error)
            }
            throw new Error(`刪除照片失敗 (狀態碼: ${response.status})`)
          }

          await fetchPet()
          showToast('success', '刪除成功', '照片已刪除')
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
  const handleSetMainPhoto = async (photoId: number) => {
    if (!pet) return

    try {
      setLoading(true)

      // 檢查 token
      const token = getToken()
      if (!token) {
        throw new Error('您尚未登入或登入已過期，請重新登入')
      }

      const response = await fetch(
        `/api/admin/pets/${params.id}/photos?photoId=${photoId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // 處理錯誤回應
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        if (errorData && errorData.error) {
          throw new Error(errorData.error)
        }
        throw new Error(`設置主照片失敗 (狀態碼: ${response.status})`)
      }

      await fetchPet()
      showToast('success', '設置成功', '主照片已更新')
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

  // 處理表單欄位變更
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [name]:
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }
    })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">發生錯誤</h4>
        <p>{error}</p>
      </div>
    )
  }

  if (!pet || !formData) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        找不到寵物資料
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">寵物詳情</h2>
        <div>
          <button
            className="btn btn-outline-danger me-2"
            onClick={handleDeletePet}
            disabled={loading}
          >
            刪除寵物
          </button>
          <Link href="/admin/pets" className="btn btn-outline-secondary">
            返回列表
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <form onSubmit={handleSubmit}>
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">基本資料</h5>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  儲存變更
                </button>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">
                      名稱
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">
                      性別
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">選擇性別</option>
                      <option value="公">公</option>
                      <option value="母">母</option>
                      <option value="未知">未知</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="species" className="form-label">
                      物種
                    </label>
                    <select
                      className="form-select"
                      id="species"
                      name="species"
                      value={formData.species || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">選擇物種</option>
                      <option value="狗">狗</option>
                      <option value="貓">貓</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="variety" className="form-label">
                      品種
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="variety"
                      name="variety"
                      value={formData.variety || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="birthday" className="form-label">
                      出生日期
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="weight" className="form-label">
                      重量 (公斤)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-control"
                      id="weight"
                      name="weight"
                      value={formData.weight || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="chip_number" className="form-label">
                      晶片編號
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="chip_number"
                      name="chip_number"
                      value={formData.chip_number || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="fixed"
                        name="fixed"
                        checked={!!formData.fixed}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="fixed">
                        已結紮
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_adopted"
                        name="is_adopted"
                        checked={!!formData.is_adopted}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_adopted">
                        已被領養
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="story" className="form-label">
                    故事描述
                  </label>
                  <textarea
                    className="form-control"
                    id="story"
                    name="story"
                    rows={5}
                    value={formData.story || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">照片管理</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="photo" className="form-label">
                  上傳新照片
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  ref={fileInputRef}
                  disabled={loading}
                  multiple
                />
                <div className="form-text">
                  最大檔案大小: 5MB，可選擇多張照片
                </div>
              </div>

              <div className="photo-gallery mt-4">
                {pet.photos && pet.photos.length > 0 ? (
                  <div className="row row-cols-2 g-2">
                    {pet.photos.map((photo) => (
                      <div key={photo.id} className="col">
                        <div
                          className={`card h-100 ${
                            photo.is_main ? 'border-primary' : ''
                          }`}
                        >
                          <div className="position-relative">
                            <img
                              src={photo.photo_url}
                              className="card-img-top"
                              alt={pet.name}
                              style={{ height: '150px', objectFit: 'cover' }}
                            />
                            {photo.is_main && (
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-primary">主照片</span>
                              </div>
                            )}
                          </div>
                          <div className="card-body p-2">
                            <div className="btn-group w-100">
                              {!photo.is_main && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleSetMainPhoto(photo.id)}
                                    disabled={loading}
                                  >
                                    設為主照片
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    disabled={loading}
                                  >
                                    刪除
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">尚未上傳任何照片</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

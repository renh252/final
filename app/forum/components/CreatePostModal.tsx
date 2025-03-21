import React, { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { Category } from '../hooks/useForumData'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface CreatePostModalProps {
  show: boolean
  onHide: () => void
  categories: Category[]
}

export default function CreatePostModal({
  show,
  onHide,
  categories,
}: CreatePostModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const response = await axios.post('/api/forum/posts', {
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        tags,
      })

      if (response.data.status === 'success') {
        onHide()
        router.refresh() // 重新整理頁面以顯示新文章
        setFormData({ title: '', content: '', categoryId: '', tags: '' })
      } else {
        setError(response.data.message || '發布失敗，請稍後再試')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '發布失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>發表新文章</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>標題</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>分類</Form.Label>
            <Form.Select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              required
              disabled={isSubmitting}
            >
              <option value="">請選擇分類</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>標籤（用逗號分隔）</Form.Label>
            <Form.Control
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="例如：寵物健康,飼養心得"
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>內容</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
              disabled={isSubmitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            取消
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '發布中...' : '發布'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

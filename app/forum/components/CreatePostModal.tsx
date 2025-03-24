'use client';

import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '../styles/custom-theme.css';

interface CreatePostModalProps {
  show: boolean;
  onHide: () => void;
  onPostCreated?: () => void;
  categories: { id: number; name: string }[];
}

export default function CreatePostModal({ show, onHide, onPostCreated, categories }: CreatePostModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
        if (onPostCreated) {
          onPostCreated()
        } else {
          onHide()
        }
        router.refresh() 
        setFormData({ title: '', content: '', categoryId: '', tags: '' })
      } else {
        setError(response.data.message || '發布失敗，請稍後再試')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '發布失敗，請稍後再試')
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#D9B77F', borderBottom: '1px solid #C79650' }}>
        <Modal.Title>發布新討論</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>標題</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="輸入標題"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>分類</Form.Label>
            <Form.Select 
              name="categoryId" 
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">選擇分類</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>內容</Form.Label>
            <Form.Control
              as="textarea"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              placeholder="輸入討論內容"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>標籤</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="使用逗號分隔多個標籤，例如：貓咪,飲食,健康"
            />
            <Form.Text className="text-muted">
              使用逗號分隔多個標籤
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f8f5f0', borderTop: '1px solid #D9B77F' }}>
        <Button variant="secondary" onClick={onHide} style={{ backgroundColor: '#7A5A4A', borderColor: '#593E2F' }}>
          取消
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '發布中...' : '發布'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

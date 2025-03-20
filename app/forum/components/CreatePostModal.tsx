import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Category } from '../hooks/useForumData';

interface CreatePostModalProps {
  show: boolean;
  onHide: () => void;
  categories: Category[];
}

export default function CreatePostModal({ show, onHide, categories }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categorySlug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 實作發文邏輯
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>發表新文章</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>標題</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>分類</Form.Label>
            <Form.Select
              value={formData.categorySlug}
              onChange={(e) => setFormData(prev => ({ ...prev, categorySlug: e.target.value }))}
              required
            >
              <option value="">請選擇分類</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>內容</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          取消
        </Button>
        <Button variant="primary" type="submit">
          發布
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
  show: boolean;
  onHide: () => void;
  categories: Array<{ id: number; name: string }>;
}

export default function CreatePostModal({ show, onHide, categories }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    images: [] as File[],
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        onHide();
        // 重置表單
        setFormData({
          title: '',
          content: '',
          category: '',
          images: [],
        });
        setPreviewUrls([]);
      } else {
        throw new Error('發文失敗');
      }
    } catch (error) {
      console.error('發文錯誤:', error);
      alert('發文失敗，請稍後再試');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>發表新文章</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>文章分類</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              aria-label="選擇文章分類"
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
            <Form.Label>標題</Form.Label>
            <Form.Control
              type="text"
              placeholder="請輸入標題"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>內容</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="請輸入文章內容"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>上傳圖片</Form.Label>
            <div className="d-flex align-items-center mb-2">
              <Button
                variant="outline-secondary"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImageIcon size={20} className="me-2" />
                選擇圖片
              </Button>
              <Form.Text className="text-muted ms-2">
                最多可上傳 5 張圖片
              </Form.Text>
            </div>
            <Form.Control
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              className="d-none"
              onChange={handleImageChange}
              disabled={formData.images.length >= 5}
            />
            
            {previewUrls.length > 0 && (
              <Row className="g-2 mt-2">
                {previewUrls.map((url, index) => (
                  <Col key={index} xs={6} md={4}>
                    <div className={styles.imagePreview}>
                      <div className={styles.imagePreviewContainer}>
                        <Image
                          src={url}
                          alt={`預覽圖 ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="rounded"
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className={styles.removeButton}
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              取消
            </Button>
            <Button variant="primary" type="submit">
              發布文章
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

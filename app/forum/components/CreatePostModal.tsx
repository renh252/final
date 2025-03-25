'use client';

import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Alert, Image as BootstrapImage } from 'react-bootstrap';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支援的檔案類型，僅支援 JPG, PNG, GIF 和 WebP');
      return;
    }

    // 檢查檔案大小 (限制為 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('檔案大小不能超過 5MB');
      return;
    }

    // 設置預覽
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
    setError('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        return response.data.fileUrl;
      } else {
        setError(response.data.message || '上傳圖片失敗');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '上傳圖片時發生錯誤');
      console.error('上傳圖片時出錯:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 先上傳圖片（如果有）
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl && imageFile) {
          setIsSubmitting(false);
          return; // 如果上傳失敗且有選擇圖片，則停止提交
        }
      }

      // 處理標籤 - 分割、修剪和過濾空標籤
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      // 發送請求到 API，包含圖片URL
      const response = await axios.post('/api/forum/posts', {
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        tags,
        imageUrl, // 新增圖片URL
      });

      // 處理響應
      if (response.data.status === 'success') {
        // 成功發布
        if (onPostCreated) {
          onPostCreated();
        } else {
          onHide();
        }
        router.refresh(); // 刷新頁面數據
        // 重置表單
        setFormData({ title: '', content: '', categoryId: '', tags: '' });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // API 返回錯誤
        setError(response.data.message || '發布失敗，請稍後再試');
      }
    } catch (err: any) {
      // 請求異常
      setError(err.response?.data?.message || '發布失敗，請稍後再試');
      console.error('發布文章時出錯:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg" className="forum-layout">
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

          {/* 新增圖片上傳區域 */}
          <Form.Group className="mb-3">
            <Form.Label>上傳圖片 (選填)</Form.Label>
            <div className="d-flex align-items-center mb-2">
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                ref={fileInputRef}
                disabled={isSubmitting || isUploading}
              />
              {imagePreview && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="ms-2"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting || isUploading}
                >
                  移除
                </Button>
              )}
            </div>
            <Form.Text className="text-muted">
              支援 JPG, PNG, GIF 和 WebP 格式，最大 5MB
            </Form.Text>

            {/* 圖片預覽 */}
            {imagePreview && (
              <div className="mt-3 position-relative">
                <BootstrapImage 
                  src={imagePreview} 
                  alt="預覽圖片" 
                  style={{ maxHeight: '200px', maxWidth: '100%' }} 
                  thumbnail 
                />
                {isUploading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="text-white">{uploadProgress}%</div>
                  </div>
                )}
              </div>
            )}
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
              標籤將幫助其他用戶更容易找到您的討論
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="secondary" 
              onClick={onHide} 
              className="me-2"
              disabled={isSubmitting || isUploading}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              style={{ backgroundColor: '#C79650', borderColor: '#C79650' }}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? '處理中...' : '發布'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

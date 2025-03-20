'use client';

import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface ReportModalProps {
  show: boolean;
  onHide: () => void;
  contentType: 'post' | 'comment';
  contentId: number;
}

const reportReasons = [
  { id: 'spam', label: '垃圾訊息或廣告' },
  { id: 'harassment', label: '騷擾或不當行為' },
  { id: 'violence', label: '暴力或危險內容' },
  { id: 'hate', label: '仇恨言論' },
  { id: 'misinformation', label: '不實資訊' },
  { id: 'copyright', label: '侵犯著作權' },
  { id: 'other', label: '其他原因' }
];

export default function ReportModal({ show, onHide, contentType, contentId }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/forum/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description,
        }),
      });

      if (response.ok) {
        alert('感謝您的回報，我們會盡快處理。');
        onHide();
        // 重置表單
        setReason('');
        setDescription('');
      } else {
        throw new Error('檢舉失敗');
      }
    } catch (error) {
      console.error('檢舉錯誤:', error);
      alert('檢舉失敗，請稍後再試');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>檢舉{contentType === 'post' ? '文章' : '留言'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>檢舉原因</Form.Label>
            <Form.Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              aria-label="選擇檢舉原因"
            >
              <option value="">請選擇檢舉原因</option>
              {reportReasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>詳細說明</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="請描述詳細情況..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              取消
            </Button>
            <Button variant="danger" type="submit">
              送出檢舉
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

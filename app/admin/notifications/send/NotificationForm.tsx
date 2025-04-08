'use client'

import React, { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'

export default function NotificationForm() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [notifyType, setNotifyType] = useState('announcement')
  const [adminOnly, setAdminOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/notifications/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          link,
          notifyType,
          adminOnly,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '發送通知失敗')
      }

      setSuccess(true)
      setTitle('')
      setMessage('')
      setLink('')
      setNotifyType('announcement')
      setAdminOnly(false)
    } catch (err: any) {
      setError(err.message || '發送通知時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">通知發送成功！</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>通知類型</Form.Label>
          <Form.Select
            value={notifyType}
            onChange={(e) => setNotifyType(e.target.value)}
            required
          >
            <option value="announcement">重要公告</option>
            <option value="maintenance">系統維護</option>
            <option value="update">功能更新</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>標題</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="請輸入通知標題"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>內容</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={500}
            placeholder="請輸入通知內容"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>相關連結（選填）</Form.Label>
          <Form.Control
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="僅發送給管理員"
            checked={adminOnly}
            onChange={(e) => setAdminOnly(e.target.checked)}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-100"
        >
          {loading ? '發送中...' : '發送通知'}
        </Button>
      </Form>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button, Card, Table, Form } from '@/app/_components/ui'
import { fetchApi } from '@/app/admin/_lib/api'

interface LogEntry {
  id: number
  admin_id: number
  admin_name: string
  action: string
  details: string
  ip_address: string
  created_at: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetchApi(
        `/api/admin/settings/logs?filter=${filter}`
      )
      setLogs(response.logs)
      setError(null)
    } catch (error) {
      setError('獲取日誌失敗')
      console.error('獲取日誌錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  // 根據操作類型返回對應的 Badge 樣式
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-success'
      case 'LOGOUT':
        return 'bg-secondary'
      case 'CREATE':
        return 'bg-primary'
      case 'UPDATE':
        return 'bg-info'
      case 'DELETE':
        return 'bg-danger'
      default:
        return 'bg-dark'
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">系統日誌</h5>
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">全部記錄</option>
            <option value="login">登入登出記錄</option>
            <option value="system">系統操作記錄</option>
            <option value="data">資料操作記錄</option>
          </Form.Select>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">載入中...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>時間</th>
                <th>管理員</th>
                <th>操作</th>
                <th>IP位址</th>
                <th>詳細資訊</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td>{log.admin_name}</td>
                  <td>
                    <span className={`badge ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.ip_address}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card.Body>
    </Card>
  )
}

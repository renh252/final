'use client'

import { useState } from 'react'
import { Button } from '@/app/_components/ui'
import { fetchApi } from '@/app/admin/_lib/api'
import { Card, Form } from 'react-bootstrap'

export default function DatabaseTestPage() {
  const [queryResult, setQueryResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [sql, setSql] = useState<string>('')

  const runTest = async (testType: string) => {
    try {
      setError('')
      let response

      switch (testType) {
        case 'connection':
          response = await fetchApi('/api/admin/test/connection')
          break
        case 'query':
          if (!sql.trim()) {
            setError('請輸入 SQL 查詢語句')
            return
          }
          response = await fetchApi('/api/admin/test/query', {
            method: 'POST',
            body: { sql },
          })
          break
        default:
          setError('未知的測試類型')
          return
      }

      setQueryResult(JSON.stringify(response, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : '測試執行失敗')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">資料庫功能測試頁面</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <Card.Header>連接測試</Card.Header>
          <Card.Body>
            <Button variant="primary" onClick={() => runTest('connection')}>
              測試資料庫連接
            </Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>查詢測試</Card.Header>
          <Card.Body className="space-y-4">
            <Form.Control
              as="textarea"
              placeholder="輸入 SQL 查詢語句"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
            />
            <Button variant="primary" onClick={() => runTest('query')}>
              執行查詢
            </Button>
          </Card.Body>
        </Card>
      </div>

      {error && (
        <Card border="danger">
          <Card.Header className="text-danger">錯誤</Card.Header>
          <Card.Body>
            <pre className="text-danger">{error}</pre>
          </Card.Body>
        </Card>
      )}

      {queryResult && (
        <Card>
          <Card.Header>測試結果</Card.Header>
          <Card.Body>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {queryResult}
            </pre>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

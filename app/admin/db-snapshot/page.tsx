'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import Cookies from 'js-cookie'

interface DbSummary {
  database: string
  totalTables: number
  totalIndexes: number
  totalForeignKeys: number
  tablesWithoutPK: string[] | null
  tables: TableSummary[]
}

interface TableSummary {
  name: string
  columns: number
  indexes: number
  foreignKeys: number
  hasPrimaryKey: boolean
}

export default function DbSnapshotPage() {
  const [dbSummary, setDbSummary] = useState<DbSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 獲取 token
  const getToken = () => Cookies.get('admin_token') || ''

  // 獲取資料庫摘要
  const fetchDbSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error('未登入，請先登入')
      }

      const response = await fetch('/api/admin/db-summary', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('未登入或登入已過期，請重新登入')
        } else if (response.status === 403) {
          throw new Error('沒有權限訪問此頁面')
        }
        throw new Error(
          errorData.error || `獲取資料庫摘要失敗 (${response.status})`
        )
      }

      const data = await response.json()
      if (data.success && data.summary) {
        setDbSummary(data.summary)
      } else {
        throw new Error(data.message || '獲取資料庫摘要失敗')
      }
    } catch (err) {
      console.error('獲取資料庫摘要時發生錯誤:', err)
      setError(
        err instanceof Error ? err.message : '無法獲取資料庫摘要，請稍後再試'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDbSummary()
  }, [fetchDbSummary])

  // 複製到剪貼板
  const copyToClipboard = async () => {
    if (!dbSummary) return

    try {
      // 格式化資料庫摘要為適合對話的文本格式
      let summaryText = `# 資料庫結構摘要\n\n`
      summaryText += `資料庫名稱: ${dbSummary.database}\n`
      summaryText += `表格總數: ${dbSummary.totalTables}\n`
      summaryText += `索引總數: ${dbSummary.totalIndexes}\n`
      summaryText += `外鍵總數: ${dbSummary.totalForeignKeys}\n\n`

      if (dbSummary.tablesWithoutPK && dbSummary.tablesWithoutPK.length > 0) {
        summaryText += `⚠️ 警告: ${
          dbSummary.tablesWithoutPK.length
        } 個表格沒有主鍵: ${dbSummary.tablesWithoutPK.join(', ')}\n\n`
      }

      summaryText += `## 表格詳情\n\n`
      summaryText += `| 表格名稱 | 欄位數 | 索引數 | 外鍵數 | 主鍵 |\n`
      summaryText += `| -------- | ------ | ------ | ------ | ---- |\n`

      dbSummary.tables.forEach((table) => {
        summaryText += `| ${table.name} | ${table.columns} | ${
          table.indexes
        } | ${table.foreignKeys} | ${table.hasPrimaryKey ? '✓' : '✗'} |\n`
      })

      summaryText += `\n資料獲取時間: ${new Date().toLocaleString()}`

      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製到剪貼板時發生錯誤:', err)
      alert('複製到剪貼板失敗，請手動複製')
    }
  }

  // 下載JSON
  const downloadJson = () => {
    if (!dbSummary) return

    const dataStr = JSON.stringify(dbSummary, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`

    const exportFileName = `db-structure-${dbSummary.database}-${
      new Date().toISOString().split('T')[0]
    }.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileName)
    linkElement.click()
  }

  return (
    <AdminPageLayout title="資料庫結構快照">
      <AdminSection>
        {error && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>獲取資料庫摘要時發生錯誤</Alert.Heading>
            <p>{error}</p>
            <div className="d-flex justify-content-end">
              <Button
                onClick={fetchDbSummary}
                variant="outline-danger"
                size="sm"
              >
                重試
              </Button>
            </div>
          </Alert>
        )}

        <AdminCard>
          <div className="mb-3">
            <p>
              這個頁面提供了資料庫結構的摘要，方便您在開始新對話時快速了解資料庫結構。
            </p>
            <p>您可以複製摘要或下載 JSON 檔案，然後在對話開始時提供給 AI。</p>
          </div>

          <div className="d-flex gap-2 mb-4">
            <Button
              variant="primary"
              onClick={copyToClipboard}
              disabled={loading || !dbSummary}
            >
              {copied ? '✓ 已複製' : '複製摘要到剪貼板'}
            </Button>
            <Button
              variant="secondary"
              onClick={downloadJson}
              disabled={loading || !dbSummary}
            >
              下載為 JSON
            </Button>
            <Button
              variant="outline-secondary"
              onClick={fetchDbSummary}
              disabled={loading}
            >
              重新載入
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">載入中...</span>
              </Spinner>
              <p className="mt-2">載入資料庫摘要中...</p>
            </div>
          ) : dbSummary ? (
            <div>
              <div className="mb-4">
                <h3>資料庫摘要</h3>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex flex-wrap gap-4">
                      <div>
                        <div className="text-muted small">資料庫名稱</div>
                        <div className="fs-5 fw-bold">{dbSummary.database}</div>
                      </div>
                      <div>
                        <div className="text-muted small">表格總數</div>
                        <div className="fs-5 fw-bold">
                          {dbSummary.totalTables}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">索引總數</div>
                        <div className="fs-5 fw-bold">
                          {dbSummary.totalIndexes}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">外鍵總數</div>
                        <div className="fs-5 fw-bold">
                          {dbSummary.totalForeignKeys}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {dbSummary.tablesWithoutPK &&
                  dbSummary.tablesWithoutPK.length > 0 && (
                    <Alert variant="warning">
                      <Alert.Heading>注意</Alert.Heading>
                      <p>
                        以下 {dbSummary.tablesWithoutPK.length} 個表格沒有主鍵：
                      </p>
                      <p className="mb-0">
                        {dbSummary.tablesWithoutPK.join(', ')}
                      </p>
                    </Alert>
                  )}
              </div>

              <h3>表格詳情</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>表格名稱</th>
                    <th>欄位數</th>
                    <th>索引數</th>
                    <th>外鍵數</th>
                    <th>主鍵</th>
                  </tr>
                </thead>
                <tbody>
                  {dbSummary.tables.map((table) => (
                    <tr key={table.name}>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-${table.name}`}>
                              點擊查看詳細結構
                            </Tooltip>
                          }
                        >
                          <a
                            href={`/admin/db-info#${table.name}`}
                            className="text-decoration-none"
                          >
                            {table.name}
                          </a>
                        </OverlayTrigger>
                      </td>
                      <td>{table.columns}</td>
                      <td>{table.indexes}</td>
                      <td>{table.foreignKeys}</td>
                      <td>
                        {table.hasPrimaryKey ? (
                          <Badge bg="success">✓</Badge>
                        ) : (
                          <Badge bg="danger">✗</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-muted mt-3 text-end">
                資料獲取時間: {new Date().toLocaleString()}
              </div>
            </div>
          ) : (
            <Alert variant="secondary">沒有資料</Alert>
          )}
        </AdminCard>
      </AdminSection>
    </AdminPageLayout>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Table, Form, Button, Pagination } from 'react-bootstrap'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  itemsPerPage?: number
  searchable?: boolean
  searchKeys?: string[]
  onRowClick?: (row: any) => void
  actions?: (row: any) => React.ReactNode
  pageSizeOptions?: number[]
}

const DataTable = ({
  columns,
  data,
  loading = false,
  itemsPerPage = 10,
  searchable = true,
  searchKeys = [],
  onRowClick,
  actions,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps) => {
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState(data)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  // 處理排序
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // 處理搜尋
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data)
      setCurrentPage(1)
      return
    }

    const keys =
      searchKeys.length > 0 ? searchKeys : columns.map((col) => col.key)

    const filtered = data.filter((item) => {
      return keys.some((key) => {
        const value = item[key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data, columns, searchKeys])

  // 當數據或頁面大小變化時，確保當前頁面有效
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredData.length / pageSize))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredData, pageSize, currentPage])

  // 處理排序後的數據
  useEffect(() => {
    if (!sortKey) return

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (aValue === bValue) return 0

      // 處理空值
      if (aValue === null || aValue === undefined)
        return sortDirection === 'asc' ? -1 : 1
      if (bValue === null || bValue === undefined)
        return sortDirection === 'asc' ? 1 : -1

      // 數字比較
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // 字串比較
      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()

      if (sortDirection === 'asc') {
        return aString.localeCompare(bString, 'zh-TW')
      } else {
        return bString.localeCompare(aString, 'zh-TW')
      }
    })

    setFilteredData(sorted)
  }, [sortKey, sortDirection])

  // 計算分頁
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // 處理分頁變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="data-table-container">
      {searchable && (
        <div className="mb-3 d-flex">
          <Form.Group className="flex-grow-1 me-2">
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <Search
                size={18}
                className="search-icon position-absolute"
                style={{
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
          </Form.Group>
          <Button
            variant="outline-secondary"
            className="d-flex align-items-center filter-button"
          >
            <Filter size={18} className="me-1" /> 篩選
          </Button>
        </div>
      )}

      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
            <p className="mt-2">載入資料中...</p>
          </div>
        ) : (
          <Table hover striped className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                    className={column.sortable ? 'sortable-column' : ''}
                  >
                    <div className="d-flex align-items-center">
                      {column.label}
                      {column.sortable && sortKey === column.key && (
                        <span className="ms-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <td key={`${index}-${column.key}`}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] !== undefined &&
                            row[column.key] !== null
                          ? String(row[column.key])
                          : '-'}
                      </td>
                    ))}
                    {actions && (
                      <td onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="text-center py-4"
                  >
                    沒有找到符合的資料
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* 分頁控制 */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center">
          <span className="me-2">
            顯示 {filteredData.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + pageSize, filteredData.length)} 筆，共{' '}
            {filteredData.length} 筆
          </span>
          <Form.Select
            size="sm"
            style={{ width: '80px' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1) // 重置到第一頁
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} 筆
              </option>
            ))}
          </Form.Select>
        </div>
        {totalPages > 1 && (
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              )
            })}

            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </div>
    </div>
  )
}

export default DataTable

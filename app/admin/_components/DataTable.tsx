'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Button,
  Pagination,
  Dropdown,
  Badge,
  Spinner,
} from 'react-bootstrap'
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload,
  CheckSquare,
  Square,
  Trash,
  Edit,
  FileText,
} from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import styles from './DataTable.module.css'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  filterable?: boolean
  filterOptions?: { value: string | number; label: string }[]
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
  selectable?: boolean
  batchActions?: {
    label: string
    icon?: React.ReactNode
    onClick: (selectedRows: any[]) => void
    variant?: string
  }[]
  exportable?: boolean
  onExport?: (format: 'csv' | 'excel' | 'json') => void
  importable?: boolean
  onImport?: (file: File) => void
  advancedFiltering?: boolean
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
  selectable = false,
  batchActions = [],
  exportable = false,
  onExport,
  importable = false,
  onImport,
  advancedFiltering = false,
}: DataTableProps) => {
  const { isDarkMode } = useTheme()
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [pageSize, setPageSize] = useState(itemsPerPage)
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const dataRef = React.useRef(data)

  useEffect(() => {
    if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
      dataRef.current = data
      setSelectedRows([])
      setSelectAll(false)
      processDataFiltering()
    }
  }, [data])

  const processDataFiltering = React.useCallback(() => {
    let result = [...dataRef.current]

    if (searchTerm.trim()) {
      const keys =
        searchKeys.length > 0 ? searchKeys : columns.map((col) => col.key)

      result = result.filter((item) => {
        return keys.some((key) => {
          const value = item[key]
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'all') return true
          return String(item[key]) === String(value)
        })
      })
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]

        if (aValue === bValue) return 0

        if (aValue === null || aValue === undefined)
          return sortDirection === 'asc' ? -1 : 1
        if (bValue === null || bValue === undefined)
          return sortDirection === 'asc' ? 1 : -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return sortDirection === 'asc'
          ? aValue > bValue
            ? 1
            : -1
          : aValue > bValue
          ? -1
          : 1
      })
    }

    setFilteredData(result)
  }, [searchTerm, columns, searchKeys, filters, sortKey, sortDirection])

  useEffect(() => {
    processDataFiltering()
    setCurrentPage(1)
  }, [searchTerm, filters, sortKey, sortDirection])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredData.length / pageSize))
    if (currentPage > maxPage && maxPage > 0 && filteredData.length > 0) {
      setCurrentPage(maxPage)
    }
  }, [filteredData.length, pageSize])

  const paginationData = React.useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, filteredData.length)
    const currentData = filteredData.slice(startIndex, endIndex)

    return {
      totalPages,
      startIndex,
      endIndex,
      currentData,
    }
  }, [filteredData, pageSize, currentPage])

  useEffect(() => {
    if (filteredData.length === 0 && data.length > 0) {
      setFilteredData(data)
    }
  }, [])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows([...paginationData.currentData])
    }
    setSelectAll(!selectAll)
  }

  const handleSelectRow = (row: any) => {
    const isSelected = selectedRows.some((r) => r === row)
    if (isSelected) {
      setSelectedRows(selectedRows.filter((r) => r !== row))
    } else {
      setSelectedRows([...selectedRows, row])
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImport) {
      onImport(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const renderPagination = () => {
    if (paginationData.totalPages <= 1) return null

    const pageItems = []
    const maxPageItems = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPageItems / 2))
    let endPage = Math.min(
      paginationData.totalPages,
      startPage + maxPageItems - 1
    )

    if (endPage - startPage + 1 < maxPageItems) {
      startPage = Math.max(1, endPage - maxPageItems + 1)
    }

    pageItems.push(
      <Pagination.First
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
    )

    pageItems.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    )

    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      )
    }

    pageItems.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === paginationData.totalPages}
      />
    )

    pageItems.push(
      <Pagination.Last
        key="last"
        onClick={() => handlePageChange(paginationData.totalPages)}
        disabled={currentPage === paginationData.totalPages}
      />
    )

    return <Pagination className="mb-0">{pageItems}</Pagination>
  }

  const renderTableHeader = () => (
    <thead>
      <tr>
        {selectable && (
          <th style={{ width: '40px' }}>
            <div
              className="d-flex align-items-center justify-content-center cursor-pointer"
              onClick={handleSelectAll}
            >
              {selectAll ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} />
              )}
            </div>
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={column.sortable ? 'sortable' : ''}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="d-flex align-items-center">
              {column.label}
              {column.sortable && (
                <div className="ms-1 d-flex flex-column">
                  <ChevronUp
                    size={12}
                    className={
                      sortKey === column.key && sortDirection === 'asc'
                        ? 'text-primary'
                        : 'text-muted'
                    }
                  />
                  <ChevronDown
                    size={12}
                    className={
                      sortKey === column.key && sortDirection === 'desc'
                        ? 'text-primary'
                        : 'text-muted'
                    }
                    style={{ marginTop: '-4px' }}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        {actions && <th className="text-end">操作</th>}
      </tr>
      {showFilters && (
        <tr className="filter-row">
          {selectable && <th></th>}
          {columns.map((column) => (
            <th key={`filter-${column.key}`}>
              {column.filterable && column.filterOptions ? (
                <Form.Select
                  size="sm"
                  value={filters[column.key] || ''}
                  onChange={(e) =>
                    handleFilterChange(column.key, e.target.value)
                  }
                >
                  <option value="">全部</option>
                  {column.filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              ) : null}
            </th>
          ))}
          {actions && <th></th>}
        </tr>
      )}
    </thead>
  )

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={
                columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
              }
              className="text-center py-4"
            >
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 mb-0">載入中...</p>
            </td>
          </tr>
        </tbody>
      )
    }

    if (paginationData.currentData.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={
                columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
              }
              className="text-center py-4"
            >
              <p className="mb-0">沒有找到符合條件的數據</p>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody>
        {paginationData.currentData.map((row, index) => (
          <tr
            key={index}
            className={onRowClick ? 'cursor-pointer' : ''}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {selectable && (
              <td
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectRow(row)
                }}
              >
                <div className="d-flex align-items-center justify-content-center">
                  {selectedRows.some((r) => r === row) ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} />
                  )}
                </div>
              </td>
            )}
            {columns.map((column) => (
              <td key={`${index}-${column.key}`}>
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </td>
            ))}
            {actions && (
              <td className="text-end">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="d-flex justify-content-end"
                >
                  {actions(row)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    )
  }

  const renderToolbar = () => (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
      <div className="d-flex flex-wrap align-items-center">
        {searchable && (
          <div className="me-3 mb-2 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <Form.Control
                type="text"
                placeholder="搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  清除
                </Button>
              )}
            </div>
          </div>
        )}

        {advancedFiltering && (
          <Button
            variant={showFilters ? 'primary' : 'outline-secondary'}
            className="me-2 mb-2 mb-md-0 d-flex align-items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="me-1" />
            篩選
            {Object.keys(filters).length > 0 && (
              <Badge bg="danger" className="ms-1">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        )}

        {Object.keys(filters).length > 0 && (
          <Button
            variant="outline-danger"
            className="me-2 mb-2 mb-md-0"
            onClick={clearFilters}
          >
            清除篩選
          </Button>
        )}
      </div>

      <div className="d-flex flex-wrap align-items-center">
        {selectable && selectedRows.length > 0 && (
          <div className="me-3 mb-2 mb-md-0">
            <span className="me-2">已選擇 {selectedRows.length} 項</span>
            {batchActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline-primary'}
                className="me-2"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon && <span className="me-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {exportable && (
          <Dropdown className="me-2 mb-2 mb-md-0">
            <Dropdown.Toggle variant="outline-success" id="dropdown-export">
              <Download size={16} className="me-1" />
              導出
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onExport && onExport('csv')}>
                CSV 格式
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onExport && onExport('excel')}>
                Excel 格式
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onExport && onExport('json')}>
                JSON 格式
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}

        {importable && (
          <>
            <Button
              variant="outline-primary"
              className="me-2 mb-2 mb-md-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="me-1" />
              導入
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileChange}
            />
          </>
        )}

        <div className="d-flex align-items-center">
          <Form.Select
            size="sm"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="me-2"
            style={{ width: 'auto' }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} 筆/頁
              </option>
            ))}
          </Form.Select>
          <span className="text-muted">
            顯示 {paginationData.startIndex + 1}-{paginationData.endIndex}{' '}
            筆，共 {filteredData.length} 筆
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`data-table-container ${
        isDarkMode ? styles['table-dark'] : ''
      }`}
    >
      {renderToolbar()}

      <div className="table-responsive">
        <Table
          hover
          variant={isDarkMode ? 'dark' : 'light'}
          className={isDarkMode ? styles['table-dark'] : ''}
        >
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          {filteredData.length > 0 && (
            <span className={`text-${isDarkMode ? 'light' : 'muted'}`}>
              顯示 {paginationData.startIndex + 1}-{paginationData.endIndex}{' '}
              筆，共 {filteredData.length} 筆
            </span>
          )}
        </div>
        {renderPagination()}
      </div>
    </div>
  )
}

export default DataTable

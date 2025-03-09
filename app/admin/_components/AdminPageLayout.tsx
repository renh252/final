'use client'

import React, { ReactNode } from 'react'
import { Card } from 'react-bootstrap'
import { useTheme } from '../ThemeContext'

interface AdminPageLayoutProps {
  title: string
  children: ReactNode
  stats?: Array<{
    title: string
    count: number | string | ReactNode
    color: string
    icon: ReactNode
  }>
  actions?: ReactNode
}

/**
 * 後台頁面通用布局組件
 * 提供統一的頁面標題、統計卡片和內容區域樣式
 */
export default function AdminPageLayout({
  title,
  children,
  stats,
  actions,
}: AdminPageLayoutProps) {
  const { isDarkMode } = useTheme()

  return (
    <>
      {/* 頁面標題 */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">{title}</h2>
        <div className="page-actions">{actions}</div>
      </div>

      {/* 統計卡片區域 */}
      {stats && stats.length > 0 && (
        <div className="stats-card-grid">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="admin-card dashboard-card"
              bg={isDarkMode ? 'dark' : 'light'}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-content">
                    <h5
                      className={
                        isDarkMode ? 'text-light opacity-75' : 'text-muted mb-1'
                      }
                    >
                      {stat.title}
                    </h5>
                    <div className="dashboard-stat-wrapper">
                      <div className="dashboard-stat-value">{stat.count}</div>
                    </div>
                  </div>
                  <div className={`dashboard-icon bg-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* 頁面內容 */}
      <div className="admin-layout-content">{children}</div>
    </>
  )
}

/**
 * 區塊組件 - 用於分隔頁面內容
 */
export function AdminSection({
  title,
  children,
  actions,
}: {
  title?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="admin-section">
      {(title || actions) && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          {title && <h3 className="admin-section-title m-0">{title}</h3>}
          {actions && <div className="section-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * 卡片組件 - 提供統一的卡片樣式
 */
export function AdminCard({
  title,
  children,
  footer,
  className = '',
}: {
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  const { isDarkMode } = useTheme()

  return (
    <Card
      className={`admin-card ${className}`}
      bg={isDarkMode ? 'dark' : 'light'}
    >
      {title && <Card.Header>{title}</Card.Header>}
      <Card.Body>{children}</Card.Body>
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </Card>
  )
}

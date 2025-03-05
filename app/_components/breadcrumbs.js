'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import './breadcrumbs.css'

export function Breadcrumbs({ title, items }) {
  return (
    <div className="breadcrumbs-container">
      <h1 className="breadcrumbs-title">{title}</h1>

      <nav className="breadcrumbs-nav">
        <Link href="/" className="home-link">
          <Home className="home-icon" />
          <span className="visually-hidden">首頁</span>
        </Link>

        {items.map((item, index) => (
          <div key={item.href} className="breadcrumb-item">
            <ChevronRight className="chevron-icon" />
            <Link
              href={item.href}
              className={`breadcrumb-link ${
                index === items.length - 1 ? 'current' : ''
              }`}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  )
}

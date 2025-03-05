'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumbs({ title, items }) {
  return (
    <div className="w-full flex flex-row items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link
          href="/"
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">首頁</span>
        </Link>

        {items.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <Link
              href={item.href}
              className={`ml-1 hover:text-foreground transition-colors ${
                index === items.length - 1 ? 'text-foreground font-medium' : ''
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

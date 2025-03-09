'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../ThemeContext'

// 提供一個簡單的結構，保持與實際組件相同的 DOM 結構
const FooterSkeleton = () => (
  <footer className="admin-footer">
    <div className="container-fluid">
      <div className="d-flex flex-wrap justify-content-between align-items-center">
        <div className="col-md-6 d-flex align-items-center"></div>
        <div className="col-md-6 d-flex justify-content-end align-items-center"></div>
      </div>
    </div>
  </footer>
)

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const { isDarkMode } = useTheme()

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  // 在服務器端渲染時，返回有相同結構的骨架
  if (!mounted) {
    return <FooterSkeleton />
  }

  const currentYear = new Date().getFullYear()
  const textClass = isDarkMode ? 'text-light opacity-75' : 'text-body-secondary'

  return (
    <footer className="admin-footer">
      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="col-md-6 d-flex align-items-center">
            <span className={`mb-md-0 ${textClass}`}>
              © {currentYear} 毛孩之家. 版權所有.
            </span>
          </div>

          <div className="col-md-6 d-flex justify-content-end align-items-center">
            <span className={`${textClass} me-2`}>由愛製造</span>
            <Heart size={16} className="text-danger" />
          </div>
        </div>
      </div>
    </footer>
  )
}

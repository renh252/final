'use client'

import { Heart } from 'lucide-react'
import styles from './footer.module.css'

export default function AdminFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`${styles.footer} admin-footer`}>
      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between align-items-center py-3 border-top">
          <div className="col-md-6 d-flex align-items-center">
            <span className="mb-md-0 text-body-secondary">
              © {currentYear} 毛孩之家. 版權所有.
            </span>
          </div>

          <div className="col-md-6 d-flex justify-content-end align-items-center">
            <span className="text-body-secondary me-2">由愛製造</span>
            <Heart size={16} className="text-danger" />
          </div>
        </div>
      </div>
    </footer>
  )
}

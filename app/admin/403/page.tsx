'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from 'react-bootstrap'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <AdminPageLayout title="無權限訪問">
      <AdminSection>
        <AdminCard>
          <div className="text-center py-5">
            <div className="mb-4">
              <AlertCircle size={60} className="text-danger" />
            </div>
            <h1 className="display-5 fw-bold text-danger">403</h1>
            <h2 className="mb-4">無權限訪問此頁面</h2>
            <p className="lead mb-5">
              您沒有權限訪問請求的頁面。如需訪問權限，請聯繫系統管理員。
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="outline-secondary" onClick={() => router.back()}>
                <ArrowLeft size={18} className="me-2" />
                返回上一頁
              </Button>
              <Button variant="primary" onClick={() => router.push('/admin')}>
                返回管理中心
              </Button>
            </div>
          </div>
        </AdminCard>
      </AdminSection>
    </AdminPageLayout>
  )
}

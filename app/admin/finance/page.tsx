'use client'

import React from 'react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import { CreditCard, DollarSign, FileText, PieChart } from 'lucide-react'

export default function FinanceIndexPage() {
  return (
    <AdminPageLayout title="財務管理">
      <div className="admin-layout-container">
        <AdminSection>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="admin-card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <CreditCard size={24} className="text-primary" />
                  </div>
                  <h5 className="card-title">支付設定</h5>
                  <p className="card-text">管理支付方式和金流設定</p>
                  <a href="/admin/finance/payments" className="btn btn-primary">
                    前往管理
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="admin-card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <DollarSign size={24} className="text-success" />
                  </div>
                  <h5 className="card-title">交易紀錄</h5>
                  <p className="card-text">查看訂單和捐款交易</p>
                  <a
                    href="/admin/finance/transactions"
                    className="btn btn-primary"
                  >
                    查看紀錄
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="admin-card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <FileText size={24} className="text-warning" />
                  </div>
                  <h5 className="card-title">報表中心</h5>
                  <p className="card-text">查看財務報表和分析</p>
                  <a href="/admin/finance/reports" className="btn btn-primary">
                    查看報表
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="admin-card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <PieChart size={24} className="text-info" />
                  </div>
                  <h5 className="card-title">收入統計</h5>
                  <p className="card-text">查看統計數據和圖表</p>
                  <a
                    href="/admin/finance/dashboard"
                    className="btn btn-primary"
                  >
                    查看統計
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}

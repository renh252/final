'use client'

import React from 'react'

export default function FinanceIndexPage() {
  return (
    <div className="p-4">
      <h2 className="mb-4">財務管理</h2>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">支付設定</h5>
              <p className="card-text">管理支付方式和金流設定</p>
              <a href="/admin/finance/payments" className="btn btn-primary">
                前往管理
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">交易紀錄</h5>
              <p className="card-text">查看訂單和捐款交易</p>
              <a href="/admin/finance/transactions" className="btn btn-primary">
                查看紀錄
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">報表中心</h5>
              <p className="card-text">查看財務報表和分析</p>
              <a href="/admin/finance/reports" className="btn btn-primary">
                查看報表
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">收入統計</h5>
              <p className="card-text">查看統計數據和圖表</p>
              <a href="/admin/finance/dashboard" className="btn btn-primary">
                查看統計
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

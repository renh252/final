'use client'

import React from 'react'

export default function AdminPage() {
  return (
    <div className="p-4">
      <h2 className="mb-4">後台管理系統</h2>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">會員管理</h5>
              <p className="card-text">管理系統使用者和訪客資料</p>
              <a href="/admin/members" className="btn btn-primary">
                前往管理
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">資金管理</h5>
              <p className="card-text">處理訂單、捐款和財務報表</p>
              <a href="/admin/finance" className="btn btn-primary">
                前往管理
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">毛孩管理</h5>
              <p className="card-text">管理待領養的寵物資訊</p>
              <a href="/admin/pets" className="btn btn-primary">
                前往管理
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">商店管理</h5>
              <p className="card-text">處理商品、庫存和活動</p>
              <a href="/admin/shop" className="btn btn-primary">
                前往管理
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

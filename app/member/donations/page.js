'use client'

import React, { useState, useEffect } from 'react'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DonationPage(props) {
  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/donate/donations', fetcher)
  if (!data) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>

  // 獲取 donations 数据
  const donations = data.donations
  const totalDonations = data.totalDonations
  console.log(data)

  console.log(donations)

  // 修改日期格式
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <>
      <div>
        <select name="" id="">
          <option value="">訂單狀態</option>
        </select>
        <select name="" id="">
          <option value="">日期</option>
        </select>
        <p>共{totalDonations}筆資料</p>
      </div>
      <div>
        <div>
          <div>查看</div>
          <div>編號</div>
          <div>付款狀態</div>
          <div>付款方式</div>
          <div>金額</div>
          <div>備註</div>
          <div>日期</div>
        </div>
        <div>
          {donations.map((donate) => {
            return (
              <div key={donate.id}>
                <div></div>
                <div>{donate.trade_no}</div>
                <div>{donate.transaction_status}</div>
                <div>{donate.payment_method}</div>
                <div>{donate.amount}</div>
                <div>{formatDate(donate.create_datetime)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

'use client'

import React from 'react'
import RecordPage from '../_components/RecordPage'
import StatusBadge from '../_components/StatusBadge'

export default function DonationPage() {
  return (
    <RecordPage
      titleText="捐款紀錄"
      fetchUrl="/api/donate/donations"
      recordKey="donations"
      detailPagePath="/member/donations" // 點擊導向 /member/donations/{id}
      statusOptions={['全部', '已付款', '處理中', '失敗']}
      formatRecord={(donate) => (
        <div>
          <p>金額：NT$ {donate.amount}</p>
          <p>
            日期：
            {new Date(donate.create_datetime).toLocaleDateString('zh-CN')}
          </p>
          <p>付款方式：{donate.payment_method}</p>
          <p>
            狀態：
            <StatusBadge status={donate.transaction_status} />
          </p>
        </div>
      )}
    />
  )
}

'use client'

import React from 'react'
import { Card } from 'react-bootstrap'
import './NewsMarquee.css'

const announcements = [
  {
    id: 1,
    text: '🎉 分享故事、留言互動就能獲得專屬成就徽章，快來蒐集看看你能集滿幾種吧！',
  },
  {
    id: 2,
    text: '📢 快查看「毛孩行事曆」，參加任務挑戰、線上活動，天天都有新驚喜等你來玩！',
  },
  {
    id: 3,
    text: '🏆 你知道貓咪為什麼喜歡蹭你嗎？狗狗聽得懂幾個詞？超多知識小挑戰等你來破解！',
  },
  {
    id: 4,
    text: '💡 從挑選飼料、預防疾病到日常照護，我們整理了最實用的飼養知識文章，快點擊精選文章查看吧！',
  },
]

export default function NewsMarquee() {
  return (
    <Card className="news-marquee-card mb-4 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center p-0">
        <div className="news-icon">
          <i className="bi bi-megaphone-fill"></i>
          <div className="news-label">最新消息</div>
        </div>
        <div className="marquee-container">
          <div className="marquee-content">
            {[...announcements, ...announcements].map((announcement, index) => (
              <div key={`${announcement.id}-${index}`} className="announcement-item">
                <span className="announcement-text">{announcement.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

import React, { useEffect, useState } from 'react'
import styles from './AchievementFeed.module.css'

interface Achievement {
  id: number
  username: string
  badgeName: string
  badgeIcon: string
  timestamp: string
}

const AchievementFeed: React.FC = () => {
  // 固定的虛構成就數據
  const mockData = React.useMemo<Achievement[]>(() => [
    {
      id: 1,
      username: "烏薩奇",
      badgeName: "熱門文章作者",
      badgeIcon: "bi-pencil-square",
      timestamp: "2天前"
    },
    {
      id: 2,
      username: "宋德鶴",
      badgeName: "寵物達人",
      badgeIcon: "bi-heart-fill",
      timestamp: "7天前"
    },
    {
      id: 3,
      username: "烏薩奇",
      badgeName: "成功邀請一位好友",
      badgeIcon: "bi-trophy-fill",
      timestamp: "10天前"
    },
    {
      id: 4,
      username: "宋德鶴",
      badgeName: "寵物知識王",
      badgeIcon: "bi-calendar-event",
      timestamp: "8天前"
    },
    {
      id: 5,
      username: "宋德鶴",
      badgeName: "攝影達人",
      badgeIcon: "bi-camera-fill",
      timestamp: "15天前"
    },
    {
      id: 6,
      username: "宋德鶴",
      badgeName: "知識分享者",
      badgeIcon: "bi-book-fill",
      timestamp: "20天前"
    }
  ], [])

  // 初始化動畫狀態
  const [animatingItems, setAnimatingItems] = useState<Array<{ data: Achievement; status: 'entering' | 'exiting' | 'stable' }>>
    (mockData.slice(0, 3).map(item => ({ data: item, status: 'stable' })))

  useEffect(() => {
    const interval = setInterval(() => {
      // 標記最上面的項目為退出狀態
      setAnimatingItems(prev => {
        const newItems = [...prev]
        newItems[0] = { ...newItems[0], status: 'exiting' }
        return newItems
      })

      // 500ms 後（動畫完成後）更新項目
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newItems = prev.slice(1) // 移除第一個
          const nextIndex = (mockData.indexOf(prev[prev.length - 1].data) + 1) % mockData.length
          newItems.push({ data: mockData[nextIndex], status: 'entering' }) // 添加新的
          return newItems
        })

        // 重置新項目的動畫狀態
        setTimeout(() => {
          setAnimatingItems(prev => 
            prev.map(item => ({ ...item, status: 'stable' }))
          )
        }, 500)
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [mockData])

  return (
    <div className={styles.achievementFeed}>
      <div className={styles.feedHeader}>
        <div className={styles.headerContent}>
          <i className="bi bi-trophy-fill"></i> 最新成就
        </div>
      </div>
      <div className={styles.feedContainer}>
        {animatingItems.map((item, index) => (
          <div
            key={`${item.data.id}-${index}`}
            className={`${styles.feedItem} ${item.status !== 'stable' ? styles[item.status] : ''}`}
          >
            <div className={`${styles.avatar} d-flex align-items-center justify-content-center`}>
              <i className="bi bi-person-circle fs-2"></i>
            </div>
            <div className={styles.content}>
              <div className={styles.username}>{item.data.username}</div>
              <div className={styles.achievement}>
                獲得了 {item.data.badgeName} 徽章！
              </div>
              <div className={styles.timestamp}>{item.data.timestamp}</div>
            </div>
            <div className={`${styles.badge} d-flex align-items-center justify-content-center`}>
              <i className={`bi ${item.data.badgeIcon} fs-4`}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AchievementFeed

'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '../flow.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { BsPatchCheckFill, BsPatchExclamationFill } from 'react-icons/bs'
import { useAuth } from '@/app/context/AuthContext'

export default function ResultPage(props) {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('status') === 'success'
  const amount = searchParams.get('amount')
  console.log('捐款金額: ', amount) // 記錄獲取到的金額，用於調試
  const { user } = useAuth()
  const [notificationSent, setNotificationSent] = useState(false)

  // 當頁面加載且為成功狀態時，發送通知
  useEffect(() => {
    // 確保只在客戶端執行
    if (typeof window === 'undefined') return

    // 只在捐款成功且用戶已登入且通知尚未發送的情況下執行
    const sendNotification = async () => {
      if (isSuccess && user && !notificationSent) {
        try {
          console.log('嘗試發送捐款成功通知，用戶ID:', user.id)

          // 發送通知給用戶
          const userResponse = await fetch('/api/notifications/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              type: 'donation',
              title: '感謝您的愛心捐款',
              message: `您的捐款 NT$${amount} 已成功處理。感謝您的愛心，讓更多浪浪有機會找到幸福的家。`,
              link: '/member/donations',
            }),
          })

          // 發送通知給管理員
          const adminResponse = await fetch('/api/notifications/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              admin_id: 6, // 管理員ID
              type: 'donation',
              title: '收到新的捐款',
              message: `用戶 ${
                user.name || user.id
              } 完成了一筆 NT$${amount} 的捐款`,
              link: '/admin/donations',
            }),
          })

          if (userResponse.ok && adminResponse.ok) {
            console.log('捐款成功通知已發送')
            setNotificationSent(true)
            
            // 發射通知更新事件，使通知鈴鐺更新
            const updateEvent = new Event('updateNotifications')
            document.dispatchEvent(updateEvent)
          } else {
            console.error(
              '發送通知失敗:',
              userResponse.ok ? '' : await userResponse.text(),
              adminResponse.ok ? '' : await adminResponse.text()
            )
          }
        } catch (error) {
          console.error('發送通知時發生錯誤:', error)
        }
      }
    }

    if (isSuccess && user && !notificationSent) {
      sendNotification()
    }
  }, [isSuccess, user, notificationSent, amount])

  return (
    <>
      <div className={styles.flow_container}>
        <h1>線上捐款</h1>
        <hr />
      </div>
      <div className={styles.order_container}>
        <div className={styles.result}>
          {isSuccess ? (
            <BsPatchCheckFill className={styles.successIcon} />
          ) : (
            <BsPatchExclamationFill
              className={styles.successIcon}
              style={{ color: '#d25445' }}
            />
          )}

          <div>
            {isSuccess ? (
              <h1 className={styles.title}>捐款成功</h1>
            ) : (
              <h1 className={styles.title} style={{ color: '#d25445' }}>
                捐款失敗
              </h1>
            )}
          </div>
        </div>{' '}
        {/* 按鈕區塊 */}
        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/member/donations')}
          >
            查看捐款紀錄
          </button>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/donate')}
          >
            回到捐款頁
          </button>
        </div>
      </div>
    </>
  )
}
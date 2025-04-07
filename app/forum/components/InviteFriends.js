import React, { useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap'
import { BsPersonPlus, BsShare } from 'react-icons/bs'
import styles from './InviteFriends.module.css'

export default function InviteFriends() {
  const [showCopied, setShowCopied] = useState(false)
  const inviteMessage = `🐾 歡迎加入我們的寵物社群！

在這裡，你可以：
✨ 分享寵物生活點滴
🎯 獲得專業飼養建議
🎁 參與有趣的活動和挑戰
🤝 認識更多愛寵物的朋友

快來加入我們吧！👉 ${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/register?ref=${Math.random().toString(36).substring(7)}`

  const inviteLink = inviteMessage

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🐾 歡迎加入寵物社群！',
          text: inviteMessage,
          url: inviteLink
        })
      } catch (err) {
        console.error('分享失敗:', err)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Card className={`${styles.inviteCard} mb-4`}>
      <Card.Body className="p-4">
        <div className={styles.iconWrapper}>
          <BsPersonPlus size={24} className={styles.icon} />
        </div>
        <h5 className="text-center mb-3">邀請好友加入</h5>
        <p className="text-muted text-center mb-4">
          邀請好友加入我們的寵物論壇，一起分享寵物生活的點點滴滴！
        </p>
        <p className="text-muted text-center small mb-1">
          朋友成功加入即可取得成就徽章！
        </p>
        <div className="d-grid gap-2 mt-3">
          <Button
            variant="primary"
            onClick={handleCopy}
            className={styles.copyButton}
          >
            複製邀請連結
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleShare}
            className={styles.shareButton}
          >
            <BsShare className="me-2" />
            分享給好友
          </Button>
        </div>
        {showCopied && (
          <Alert 
            variant="success" 
            className={`${styles.copiedAlert} position-absolute start-50 translate-middle-x`}
          >
            已複製到剪貼簿！
          </Alert>
        )}
      </Card.Body>
    </Card>
  )
}

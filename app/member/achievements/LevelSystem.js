import React from 'react'
import { Card, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsStar, BsStarFill, BsTrophy, BsInfoCircle } from 'react-icons/bs'
import styles from './LevelSystem.module.css'

const levels = [
  { level: 1, expNeeded: 0, title: '寵物新手' },
  { level: 2, expNeeded: 100, title: '寵物愛好者' },
  { level: 3, expNeeded: 300, title: '寵物達人' },
  { level: 4, expNeeded: 600, title: '寵物專家' },
  { level: 5, expNeeded: 1000, title: '寵物大師' }
]

const expActions = {
  POST_CREATED: 50,
  COMMENT_ADDED: 10,
  ACHIEVEMENT_UNLOCKED: 100,
  QUIZ_CORRECT: 20,
  DAILY_LOGIN: 5
}

export default function LevelSystem() {
  // 模擬用戶數據
  const currentExp = 880 // 當前經驗值
  
  // 計算當前等級和下一等級
  const getCurrentLevel = (exp) => {
    let currentLevel = levels[0]
    for (const level of levels) {
      if (exp >= level.expNeeded) {
        currentLevel = level
      } else {
        break
      }
    }
    return currentLevel
  }

  const currentLevel = getCurrentLevel(currentExp)
  const nextLevel = levels[currentLevel.level] || currentLevel
  
  // 計算到下一等級所需經驗值和進度
  const expToNextLevel = nextLevel.expNeeded - currentLevel.expNeeded
  const currentLevelExp = currentExp - currentLevel.expNeeded
  const progress = (currentLevelExp / expToNextLevel) * 100

  return (
    <Card className={`${styles.levelCard} mb-4`}>
      <Card.Body className="p-4">
        <div className={styles.levelHeader}>
          <div className={styles.levelBadge}>
            <BsTrophy className={styles.levelIcon} />
            <span className={styles.levelNumber}>{currentLevel.level}</span>
          </div>
          <div>
            <h5 className="mb-1">{currentLevel.title}</h5>
            <div className="d-flex align-items-center">
              <p className="text-muted mb-0">
                距離下一等級還需 {nextLevel.expNeeded - currentExp} 經驗值
              </p>
              <OverlayTrigger
                placement="right"
                delay={{ show: 100, hide: 200 }}
                overlay={
                  <Tooltip id="level-info-tooltip" className={styles.customTooltip}>
                    <div style={{ textAlign: 'left', padding: '10px', minWidth: '200px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>經驗值規則：</div>
                      <ul style={{ paddingLeft: '20px', margin: '0' }}>
                        <li>發表文章 +50</li>
                        <li>留言回覆 +10</li>
                        <li>解鎖成就 +100</li>
                        <li>答對問答 +20</li>
                        <li className="text-danger">違規行為 -2倍經驗值</li>
                        <li className="text-danger">嚴重違規 降至一級</li>
                      </ul>
                    </div>
                  </Tooltip>
                }
              >
                <div>
                  <BsInfoCircle className={`ms-2 ${styles.infoIcon}`} size={20} style={{ cursor: 'pointer' }} />
                </div>
              </OverlayTrigger>
            </div>
          </div>
        </div>

        <div className={styles.progressWrapper}>
          <ProgressBar 
            now={progress} 
            className={styles.expProgress}
            label={`${currentExp}/${nextLevel.expNeeded}`}
          />
        </div>

        <div className={styles.expActions}>
          <h6 className="mb-3">獲得經驗值方式：</h6>
          <div className={styles.actionGrid}>
            <div className={styles.actionItem}>
              <BsStarFill className={styles.actionIcon} />
              <span>發表文章</span>
              <small className={styles.expAmount}>+{expActions.POST_CREATED}</small>
            </div>
            <div className={styles.actionItem}>
              <BsStar className={styles.actionIcon} />
              <span>留言回覆</span>
              <small className={styles.expAmount}>+{expActions.COMMENT_ADDED}</small>
            </div>
            <div className={styles.actionItem}>
              <BsTrophy className={styles.actionIcon} />
              <span>解鎖成就</span>
              <small className={styles.expAmount}>+{expActions.ACHIEVEMENT_UNLOCKED}</small>
            </div>
            <div className={styles.actionItem}>
              <BsStar className={styles.actionIcon} />
              <span>答對問答</span>
              <small className={styles.expAmount}>+{expActions.QUIZ_CORRECT}</small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

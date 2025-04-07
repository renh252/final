'use client'

import React, { useState } from 'react'
import { usePageTitle } from '@/app/context/TitleContext'
import { Card, Container, Row, Col, Badge, Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsTrophy, BsCalendarCheck, BsPeople, BsPencilSquare, BsHeart, BsTicket, BsInfoCircle, BsCamera, BsLightbulb, BsEye, BsCup, BsLock, BsQuestionCircle, BsGift } from 'react-icons/bs'
import Swal from 'sweetalert2'
import styles from './achievements.module.css'
import LevelSystem from './LevelSystem'
import voucherStyles from './voucher.module.css'
import MysteryBox from './MysteryBox'

export default function AchievementsPage() {
  usePageTitle('論壇成就')
  const [showExchange, setShowExchange] = useState(false)
  const [totalPoints, setTotalPoints] = useState(1250) // 初始點數

  const vouchers = [
    { id: 1, amount: 100, points: 500, color: 'primary' },
    { id: 2, amount: 250, points: 1000, color: 'success' },
    { id: 3, amount: 600, points: 2000, color: 'danger' },
    { id: 4, amount: 1000, points: 3000, color: 'warning' },
  ]

  const handleExchange = (voucher) => {
    if (totalPoints >= voucher.points) {
      Swal.fire({
        title: '確定要兑換嗎？',
        html: `將消耗 ${voucher.points} 點<br/>兑換 ${voucher.amount} 元折價券`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '確定兑換',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          setTotalPoints(prev => prev - voucher.points)
          Swal.fire(
            '兑換成功！',
            `已成功兑換 ${voucher.amount} 元折價券`,
            'success'
          )
        }
      })
    } else {
      Swal.fire(
        '點數不足',
        `需要 ${voucher.points} 點才能兑換此折價券`,
        'error'
      )
    }
  }

  const achievements = [
    // 已解鎖成就
    {
      id: 1,
      title: '成功邀請一位好友',
      description: '成功邀請一位好友加入論壇',
      points: 100,
      icon: BsPeople,
      date: '2025-03-15',
      color: 'primary',
      unlocked: true
    },
    {
      id: 2,
      title: '連續登入10天',
      description: '連續10天登入論壇',
      points: 500,
      icon: BsCalendarCheck,
      date: '2025-04-01',
      color: 'success',
      unlocked: true
    },
    {
      id: 3,
      title: '熱門文章作者',
      description: '發表的文章獲得超過100個讚',
      points: 300,
      icon: BsPencilSquare,
      date: '2025-03-20',
      color: 'danger',
      unlocked: true
    },
    {
      id: 4,
      title: '寵物達人',
      description: '在論壇發表超過50篇文章',
      points: 200,
      icon: BsTrophy,
      date: '2025-03-25',
      color: 'warning',
      unlocked: true
    },
    {
      id: 5,
      title: '熱心助人',
      description: '回答超過30個提問',
      points: 150,
      icon: BsHeart,
      date: '2025-04-05',
      color: 'info',
      unlocked: true
    },
    // 未解鎖成就
    {
      id: 6,
      title: '寵物攝影師',
      description: '上傳超過30張寵物照片',
      points: 200,
      icon: BsCamera,
      unlocked: false,
      color: 'primary',
      progress: 18
    },
    {
      id: 7,
      title: '社群之星',
      description: '成功邀請10位好友加入',
      points: 500,
      icon: BsPeople,
      unlocked: false,
      color: 'success',
      progress: 3
    },
    {
      id: 8,
      title: '寵物知識王',
      description: '答對100題寵物問答',
      points: 300,
      icon: BsLightbulb,
      unlocked: false,
      color: 'warning',
      progress: 45
    },
    {
      id: 9,
      title: '熱門部落客',
      description: '發表的文章總觀看次數超過1000次',
      points: 400,
      icon: BsEye,
      unlocked: false,
      color: 'info',
      progress: 658
    },
    {
      id: 10,
      title: '寵物美食家',
      description: '分享30個寵物食譜',
      points: 250,
      icon: BsCup,
      unlocked: false,
      color: 'danger',
      progress: 12
    },
    // 隱藏成就
    {
      id: 11,
      title: '神秘成就',
      description: '?????',
      points: 1000,
      icon: BsQuestionCircle,
      unlocked: false,
      color: 'dark',
      hidden: true
    },
    {
      id: 12,
      title: '特殊成就',
      description: '?????',
      points: 800,
      icon: BsQuestionCircle,
      unlocked: false,
      color: 'dark',
      hidden: true
    }
  ]

  return (
    <Container className="py-4">
      <LevelSystem />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <h1 className="h3 mb-0">論壇成就</h1>
          <OverlayTrigger
            placement="right"
            delay={{ show: 100, hide: 200 }}
            overlay={
              <Tooltip id="achievement-tooltip" className={styles.customTooltip}>
                <div style={{ textAlign: 'left', padding: '10px', minWidth: '200px' }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>如何獲取成就：</div>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li>每日登入論壇</li>
                    <li>發表文章和回覆</li>
                    <li>獲得按讚和評論</li>
                    <li>邀請好友加入</li>
                    <li>參與論壇活動</li>
                  </ul>
                </div>
              </Tooltip>
            }
          >
            <div>
              <BsInfoCircle 
                className={`ms-2 ${styles.infoIcon}`} 
                size={20} 
                style={{ cursor: 'pointer' }} 
              />
            </div>
          </OverlayTrigger>
        </div>
        <div className="text-end">
          <div className="h4 mb-0 text-primary">{totalPoints} 點</div>
          <Button
            variant=""
            className={`ms-3 btn ${styles.exchangeButton}`}
            onClick={() => setShowExchange(true)}
          >
            <BsGift className="me-2" />
            特殊獎勵商店
          </Button>
        </div>
      </div>

      <Modal
        show={showExchange}
        onHide={() => setShowExchange(false)}
        size="lg"
        centered
        contentClassName={styles.modalContent}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <BsGift className="me-2" />
            特殊獎勵商店
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <MysteryBox totalPoints={totalPoints} setTotalPoints={setTotalPoints} />
          </div>
          <hr className="my-4" />
          <h5 className="mb-3">
            <BsTicket className="me-2" />
            折價券列表
          </h5>
          <Row className="g-4">
            {vouchers.map((voucher) => (
              <Col key={voucher.id} md={6}>
                <Card 
                  className={`h-100 position-relative overflow-hidden ${voucherStyles.voucherCard}`}
                  style={{
                    background: `linear-gradient(135deg, ${voucher.color === 'primary' ? '#007bff' : 
                      voucher.color === 'success' ? '#28a745' :
                      voucher.color === 'danger' ? '#dc3545' :
                      '#ffc107'} 0%, #ffffff 100%)`,
                    border: 'none',
                    borderRadius: '15px',
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="position-relative z-1">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h3 className={`display-4 fw-bold mb-0 text-dark ${voucherStyles.amount}`}>${voucher.amount}</h3>
                          <div className="text-muted">折價券</div>
                        </div>
                        <div className="text-end">
                          <div className="h4 mb-1">{voucher.points}</div>
                          <Badge 
                            bg={voucher.color}
                            className={`rounded-pill px-3 py-2 ${voucherStyles.badge}`}
                            style={{ fontSize: '0.9rem' }}
                          >
                            所需點數
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={totalPoints >= voucher.points ? voucher.color : 'secondary'}
                        className="w-100 py-2 position-relative"
                        onClick={() => handleExchange(voucher)}
                        disabled={totalPoints < voucher.points}
                        style={{
                          borderRadius: '10px',
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {totalPoints >= voucher.points ? (
                          <>
                            <i className="bi bi-gift me-2"></i>
                            立即兌換
                          </>
                        ) : (
                          <>
                            <i className="bi bi-lock me-2"></i>
                            點數不足
                          </>
                        )}
                      </Button>
                    </div>
                    <div 
                      className={`position-absolute ${voucherStyles.decorativeCircle}`}
                      style={{
                        top: '-20%',
                        right: '-10%',
                        width: '200px',
                        height: '200px',
                        background: `radial-gradient(circle, ${voucher.color === 'primary' ? '#007bff33' : 
                          voucher.color === 'success' ? '#28a74533' :
                          voucher.color === 'danger' ? '#dc354533' :
                          '#ffc10733'} 0%, transparent 70%)`,
                        borderRadius: '50%',
                        zIndex: 0
                      }}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
      <Row className="g-4">
        {achievements.map(achievement => (
          <Col key={achievement.id} xs={12}>
            <Card className="border-0 shadow-sm position-relative">
              <Card.Body className="d-flex align-items-center">
                {!achievement.unlocked && (
                  <div className={styles.achievementOverlay}>
                    <div className={styles.lockIcon}>
                      <BsLock size={24} />
                    </div>
                    {!achievement.hidden ? (
                      <div className={styles.progressInfo}>
                        <div className="text-white mb-1">
                          進度: {achievement.progress}/
                          {achievement.title === '熱門部落客' ? '1000' :
                           achievement.title === '寵物知識王' ? '100' :
                           achievement.title === '社群之星' ? '10' : '30'}
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{
                              width: `${Math.min(100, (achievement.progress / (
                                achievement.title === '熱門部落客' ? 1000 :
                                achievement.title === '寵物知識王' ? 100 :
                                achievement.title === '社群之星' ? 10 : 30
                              )) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.progressInfo}>
                        <div className="text-white mb-1">神秘彩蛋</div>
                        <div className="text-white-50">快來解鎖隱藏成就吧！</div>
                      </div>
                    )}
                  </div>
                )}
                <div 
                  className={`d-flex align-items-center justify-content-center rounded-circle bg-${achievement.color} bg-opacity-10 p-3 me-3`}
                  style={{ width: '60px', height: '60px' }}
                >
                  <achievement.icon 
                    className={`text-${achievement.color}`} 
                    size={24} 
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">{achievement.title}</h5>
                      <p className="text-muted mb-0">{achievement.description}</p>
                    </div>
                    <div className="text-end">
                      <div className="text-primary fw-bold mb-1">
                        +{achievement.points} 點
                      </div>
                      <Badge bg={achievement.color}>
                        {achievement.unlocked ? '已達成' : '未解鎖'}
                      </Badge>
                    </div>
                  </div>
                  {!achievement.hidden && (
                    <small className="text-muted d-block mt-2">
                      達成日期：{achievement.date}
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

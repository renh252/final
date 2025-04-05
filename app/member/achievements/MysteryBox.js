'use client'

import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { BsGift, BsTrophy, BsCoin, BsTicket, BsStar } from 'react-icons/bs'
import styles from './mysteryBox.module.css'
import Swal from 'sweetalert2'

const REWARDS_POOL = [
  { type: 'achievement', icon: BsTrophy, name: '神秘成就進度+1', color: '#ffd700' },
  { type: 'voucher', icon: BsTicket, name: '50元折價券', color: '#28a745' },
  { type: 'exp', icon: BsCoin, name: '100經驗值', color: '#17a2b8' },
  { type: 'achievement', icon: BsTrophy, name: '特殊成就進度+1', color: '#ffd700' },
  { type: 'voucher', icon: BsTicket, name: '100元折價券', color: '#28a745' },
  { type: 'exp', icon: BsCoin, name: '200經驗值', color: '#17a2b8' },
  { type: 'voucher', icon: BsTicket, name: '200元折價券', color: '#28a745' },
  { type: 'exp', icon: BsCoin, name: '500經驗值', color: '#17a2b8' },
]

export default function MysteryBox({ totalPoints, setTotalPoints }) {
  const [showModal, setShowModal] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [rewards, setRewards] = useState([])
  const [sparkles, setSparkles] = useState([])
  const [confetti, setConfetti] = useState([])

  const handleClick = (e) => {
    if (!isOpening) {
      createSparkle(e)
      openBox()
    }
  }

  const createSparkle = (e) => {
    const rect = e.target.getBoundingClientRect()
    const sparklesCount = 8
    const newSparkles = []
    
    for (let i = 0; i < sparklesCount; i++) {
      const angle = (i / sparklesCount) * 360
      const tx = Math.cos(angle * Math.PI / 180) * 100
      const ty = Math.sin(angle * Math.PI / 180) * 100
      
      newSparkles.push({
        id: Date.now() + i,
        style: {
          left: rect.width / 2 + 'px',
          top: rect.height / 2 + 'px',
          '--tx': tx + 'px',
          '--ty': ty + 'px'
        }
      })
    }
    
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 1000)
  }

  const createConfetti = () => {
    const colors = ['#ffd700', '#28a745', '#17a2b8', '#dc3545', '#6610f2']
    const confettiCount = 50
    const newConfetti = []

    for (let i = 0; i < confettiCount; i++) {
      newConfetti.push({
        id: Date.now() + i,
        style: {
          left: Math.random() * 100 + '%',
          '--color': colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 2 + 's'
        }
      })
    }

    setConfetti(newConfetti)
    setTimeout(() => setConfetti([]), 3000)
  }

  const openBox = async () => {
    if (totalPoints < 300) {
      Swal.fire({
        title: '點數不足',
        text: '需要300點才能開啟神秘毛孩獎勵箱',
        icon: 'error'
      })
      return
    }

    setIsOpening(true)
    setShowModal(true)
    setTotalPoints(prev => prev - 300)

    // 隨機抽取3個獎勵
    const selectedRewards = []
    const rewardsCopy = [...REWARDS_POOL]
    for (let i = 0; i < 3; i++) {
      const index = Math.floor(Math.random() * rewardsCopy.length)
      selectedRewards.push(rewardsCopy[index])
      rewardsCopy.splice(index, 1)
    }

    // 動畫效果
    createConfetti()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 逐個顯示獎勵
    for (let reward of selectedRewards) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setRewards(prev => [...prev, reward])
    }

    setIsOpening(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setRewards([])
    setIsOpening(false)
  }

  return (
    <>
      <Button
        className={styles.mysteryBox}
        onClick={handleClick}
        disabled={isOpening}
      >
        <BsGift size={24} className="me-2" />
        開啟神秘毛孩獎勵箱
        <div className="small">消耗300點</div>
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className={styles.sparkle}
            style={sparkle.style}
          >
            <BsStar />
          </div>
        ))}
      </Button>

      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        className="text-center"
      >
        <Modal.Header closeButton>
          <Modal.Title>神秘毛孩獎勵箱</Modal.Title>
        </Modal.Header>
        <Modal.Body className="position-relative">
          {confetti.map(item => (
            <div
              key={item.id}
              className={styles.confetti}
              style={item.style}
            />
          ))}
          
          {isOpening && rewards.length === 0 ? (
            <div className={styles.openingAnimation}>
              <BsGift size={64} className="mb-3" />
              <h4>正在開啟獎勵箱...</h4>
            </div>
          ) : (
            <div className={styles.rewardList}>
              {rewards.map((reward, index) => (
                <div key={index} className={styles.rewardItem}>
                  <div className={styles.rewardIcon} style={{ background: reward.color + '33' }}>
                    <reward.icon size={24} color={reward.color} />
                  </div>
                  <div className="text-start flex-grow-1">
                    <div className="fw-bold">{reward.name}</div>
                    <small className="text-muted">
                      {reward.type === 'achievement' ? '成就進度' :
                       reward.type === 'voucher' ? '折價券' : '經驗值'}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

'use client'

import React, { useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap'
import styles from './PetQuizChallenge.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import confetti from 'canvas-confetti'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

const questions: QuizQuestion[] = [
  {
    question: '狗狗的正常體溫範圍是多少？',
    options: ['35-36°C', '37.5-39.2°C', '40-41°C', '42-43°C'],
    correctAnswer: 1
  },
  {
    question: '貓咪每天應該餵食幾次？',
    options: ['1次', '2次', '3-4次', '隨時供應'],
    correctAnswer: 2
  },
  {
    question: '以下哪種食物對狗狗有毒？',
    options: ['紅蘿蔔', '巧克力', '南瓜', '蘋果'],
    correctAnswer: 1
  },
  {
    question: '成年貓咪每天需要睡眠多久？',
    options: ['8-10小時', '12-14小時', '16-20小時', '4-6小時'],
    correctAnswer: 2
  }
]

export default function PetQuizChallenge() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const fireConfetti = () => {
    // 左側彩帶
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.2, y: 0.8 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB']
    })

    // 右側彩帶
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.8, y: 0.8 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB']
    })
  }

  const handleAnswer = (selectedIndex: number) => {
    const correct = selectedIndex === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // 觸發彩帶效果
      fireConfetti()

      // 0.5秒後再次觸發
      setTimeout(() => {
        fireConfetti()
      }, 500)
    }

    // 3秒後顯示下一題
    setTimeout(() => {
      setShowResult(false)
      // 如果是最後一題，回到第一題
      setCurrentQuestionIndex((prevIndex) => 
        prevIndex === questions.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000)
  }

  return (
    <Card className={styles.quizCard}>
      <Card.Header className={styles.quizHeader}>
        <div className={styles.headerContent}>
          <i className="bi bi-lightbulb"></i> 寵物知識問答挑戰
        </div>
      </Card.Header>
      <Card.Body>
        {showResult ? (
          <Alert 
            variant={isCorrect ? 'success' : 'danger'}
            className={`${styles.resultAlert} ${isCorrect ? styles.correctAlert : styles.wrongAlert}`}
          >
            {isCorrect ? (
              <>
                <i className="bi bi-emoji-smile-fill me-2"></i>
                答對了！參與更多問答來獲得成就勳章吧！
              </>
            ) : (
              <>
                <i className="bi bi-emoji-frown-fill me-2"></i>
                答錯了！再接再厲！
              </>
            )}
          </Alert>
        ) : (
          <>
            <Card.Title className={styles.question}>{currentQuestion.question}</Card.Title>
            <div className={styles.options}>
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline-primary"
                  className={styles.optionButton}
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  )
}

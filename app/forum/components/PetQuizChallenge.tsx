'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Alert } from 'react-bootstrap'
import styles from './PetQuizChallenge.module.css'

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
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    // 隨機選擇一個問題
    const randomIndex = Math.floor(Math.random() * questions.length)
    setCurrentQuestion(questions[randomIndex])
  }, [])

  const handleAnswer = (selectedIndex: number) => {
    if (!currentQuestion) return
    
    const correct = selectedIndex === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    // 3秒後重置問題
    setTimeout(() => {
      setShowResult(false)
      const newIndex = Math.floor(Math.random() * questions.length)
      setCurrentQuestion(questions[newIndex])
    }, 3000)
  }

  if (!currentQuestion) return null

  return (
    <Card className={styles.quizCard}>
      <Card.Header className={styles.quizHeader}>
        <i className="bi bi-lightbulb"></i> 寵物知識問答挑戰
      </Card.Header>
      <Card.Body>
        {!showResult ? (
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
        ) : (
          <Alert variant={isCorrect ? 'success' : 'danger'}>
            {isCorrect ? '答對了！你真是寵物達人！' : '答錯了！再接再厲！'}
          </Alert>
        )}
      </Card.Body>
    </Card>
  )
}

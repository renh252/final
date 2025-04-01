'use client'

import React, { useState } from 'react'
import { Card, Button, Modal, Badge, Form } from 'react-bootstrap'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import styles from './EventCalendar.module.css'

interface Event {
  id: number
  title: string
  date: Date
  time: string
  location: string
  type: 'meetup' | 'adoption' | 'training' | 'other'
}

// 模擬活動資料
const demoEvents: Event[] = [
  {
    id: 1,
    title: '寵物聚會：貓咪下午茶',
    date: new Date(2025, 3, 5),
    time: '14:00-16:00',
    location: '台北寵物咖啡廳',
    type: 'meetup'
  },
  {
    id: 2,
    title: '狗狗訓練課程',
    date: new Date(2025, 3, 10),
    time: '10:00-12:00',
    location: '快樂寵物訓練中心',
    type: 'training'
  },
  {
    id: 3,
    title: '浪浪認養日',
    date: new Date(2025, 3, 15),
    time: '09:00-17:00',
    location: '中央公園',
    type: 'adoption'
  }
]

export default function EventCalendar() {
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [events] = useState<Event[]>(demoEvents)

  const filteredEvents = events.filter(event => 
    selectedType === 'all' || event.type === selectedType
  )

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const tileContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date)
    if (dayEvents.length > 0) {
      return (
        <div className={styles.eventDot}>
          {dayEvents.map(event => (
            <span
              key={event.id}
              className={`${styles.dot} ${styles[event.type]}`}
            />
          ))}
        </div>
      )
    }
    return null
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value)
  }

  const EventList = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date)
    return (
      <div className={styles.eventList}>
        <h6>{date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })} 活動：</h6>
        {dayEvents.length > 0 ? (
          dayEvents.map(event => (
            <div key={event.id} className={styles.eventItem}>
              <Badge bg={getBadgeColor(event.type)} className="me-2">
                {getEventTypeLabel(event.type)}
              </Badge>
              <div className={styles.eventDetails}>
                <strong>{event.title}</strong>
                <div>{event.time}</div>
                <div>{event.location}</div>
              </div>
            </div>
          ))
        ) : (
          <p>今日無活動</p>
        )}
      </div>
    )
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'meetup': return 'primary'
      case 'adoption': return 'success'
      case 'training': return 'warning'
      default: return 'info'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meetup': return '聚會'
      case 'adoption': return '認養'
      case 'training': return '訓練'
      default: return '其他'
    }
  }

  return (
    <Card className={styles.calendarCard}>
      <Card.Header className={styles.calendarHeader}>
        <i className="bi bi-calendar-event"></i> 寵物活動行事曆
        <Button 
          variant="link" 
          className={styles.expandButton}
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-arrows-fullscreen"></i>
        </Button>
      </Card.Header>
      <Card.Body>
        <Form.Select
          size="sm"
          className="mb-2"
          value={selectedType}
          onChange={handleTypeChange}
          aria-label="活動類型篩選"
        >
          <option value="all">所有活動</option>
          <option value="meetup">寵物聚會</option>
          <option value="adoption">認養活動</option>
          <option value="training">訓練課程</option>
          <option value="other">其他活動</option>
        </Form.Select>

        <div className={styles.miniCalendar}>
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileContent={tileContent}
            locale="zh-TW"
          />
        </div>

        {selectedDate && (
          <EventList date={selectedDate} />
        )}
      </Card.Body>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>寵物活動行事曆</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            className="mb-3"
            value={selectedType}
            onChange={handleTypeChange}
            aria-label="活動類型篩選"
          >
            <option value="all">所有活動</option>
            <option value="meetup">寵物聚會</option>
            <option value="adoption">認養活動</option>
            <option value="training">訓練課程</option>
            <option value="other">其他活動</option>
          </Form.Select>

          <div className={styles.fullCalendar}>
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              tileContent={tileContent}
              locale="zh-TW"
            />
          </div>

          {selectedDate && (
            <EventList date={selectedDate} />
          )}
        </Modal.Body>
      </Modal>
    </Card>
  )
}

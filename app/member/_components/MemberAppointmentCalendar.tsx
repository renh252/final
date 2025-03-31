'use client'

import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Button, ButtonGroup } from 'react-bootstrap'
import styles from './MemberAppointmentCalendar.module.css'

// 定義預約狀態類型
type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

// 定義預約資料介面
interface Appointment {
  id: number
  pet_id: number
  pet_name: string
  pet_image: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  store_name: string
  created_at: string
  updated_at: string
}

// 定義日曆事件介面
interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay: boolean
  extendedProps: {
    pet_id: number
    pet_name: string
    pet_image: string
    status: AppointmentStatus
    store_name: string
  }
  className: string
}

interface MemberAppointmentCalendarProps {
  appointments: Appointment[]
  onEventClick?: (appointmentId: number) => void
}

const MemberAppointmentCalendar: React.FC<MemberAppointmentCalendarProps> = ({
  appointments,
  onEventClick,
}) => {
  const [calendarView, setCalendarView] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  >('dayGridMonth')

  // 格式化日期函數
  const formatDate = (dateString: string): string => {
    // 處理ISO日期格式 (已含有T和時區)
    if (dateString.includes('T')) {
      // 只取日期部分
      return dateString.split('T')[0]
    }
    return dateString
  }

  // 將預約資料轉換為日曆事件
  const events: CalendarEvent[] = appointments.map((appointment) => {
    // 正確處理日期時間格式
    const dateTime = `${formatDate(appointment.appointment_date)}T${
      appointment.appointment_time
    }`

    console.log('處理預約 ID:', appointment.id)
    console.log('處理前日期:', appointment.appointment_date)
    console.log('處理後日期時間:', dateTime)

    // 根據狀態設定不同的事件樣式類名
    let statusClassName = ''
    switch (appointment.status) {
      case 'pending':
        statusClassName = styles.pendingEvent
        break
      case 'approved':
        statusClassName = styles.approvedEvent
        break
      case 'completed':
        statusClassName = styles.completedEvent
        break
      case 'cancelled':
        statusClassName = styles.cancelledEvent
        break
    }

    return {
      id: appointment.id.toString(),
      title: `${appointment.pet_name} - ${appointment.store_name}`,
      start: dateTime,
      allDay: false,
      extendedProps: {
        pet_id: appointment.pet_id,
        pet_name: appointment.pet_name,
        pet_image: appointment.pet_image,
        status: appointment.status,
        store_name: appointment.store_name,
      },
      className: statusClassName,
    }
  })

  // 處理事件點擊
  const handleEventClick = (info: any) => {
    if (onEventClick) {
      onEventClick(parseInt(info.event.id))
    }
  }

  // 切換日曆視圖
  const handleViewChange = (
    view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  ) => {
    setCalendarView(view)
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.viewButtons}>
        <ButtonGroup className="mb-3">
          <Button
            variant={
              calendarView === 'dayGridMonth' ? 'primary' : 'outline-primary'
            }
            onClick={() => handleViewChange('dayGridMonth')}
          >
            月
          </Button>
          <Button
            variant={
              calendarView === 'timeGridWeek' ? 'primary' : 'outline-primary'
            }
            onClick={() => handleViewChange('timeGridWeek')}
          >
            週
          </Button>
          <Button
            variant={
              calendarView === 'timeGridDay' ? 'primary' : 'outline-primary'
            }
            onClick={() => handleViewChange('timeGridDay')}
          >
            日
          </Button>
        </ButtonGroup>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        locales={[]}
        locale="zh-tw"
        buttonText={{
          today: '今天',
          month: '月',
          week: '週',
          day: '日',
        }}
      />
    </div>
  )
}

export default MemberAppointmentCalendar

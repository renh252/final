'use client'

import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button, ButtonGroup } from 'react-bootstrap'

interface FullCalendarProps {
  events: any[]
  onEventClick?: (info: any) => void
}

// 視圖類型定義
type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

export default function FullCalendarComponent({
  events,
  onEventClick,
}: FullCalendarProps) {
  const [viewType, setViewType] = useState<ViewType>('dayGridMonth')

  // 處理視圖變更
  const handleViewChange = (newView: ViewType) => {
    setViewType(newView)
  }

  return (
    <div className="full-calendar-wrapper">
      {/* 視圖選擇按鈕 */}
      <div className="d-flex justify-content-end mb-3">
        <ButtonGroup size="sm">
          <Button
            variant={
              viewType === 'dayGridMonth' ? 'primary' : 'outline-primary'
            }
            onClick={() => handleViewChange('dayGridMonth')}
          >
            月視圖
          </Button>
          <Button
            variant={
              viewType === 'timeGridWeek' ? 'primary' : 'outline-primary'
            }
            onClick={() => handleViewChange('timeGridWeek')}
          >
            週視圖
          </Button>
          <Button
            variant={viewType === 'timeGridDay' ? 'primary' : 'outline-primary'}
            onClick={() => handleViewChange('timeGridDay')}
          >
            日視圖
          </Button>
        </ButtonGroup>
      </div>

      {/* FullCalendar 元件 */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={viewType}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        events={events}
        eventClick={onEventClick}
        height="auto"
        aspectRatio={1.8}
        locale="zh-tw"
        buttonText={{
          today: '今天',
          month: '月',
          week: '週',
          day: '日',
          list: '列表',
        }}
        dayHeaderFormat={{ weekday: 'short' }}
        allDaySlot={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        nowIndicator={true}
        eventDisplay="block"
        eventBorderColor="transparent"
        eventContent={(arg) => {
          const status = arg.event.extendedProps.status
          const petName = arg.event.extendedProps.pet_name
          const userName = arg.event.extendedProps.user_name

          return (
            <div className="event-content">
              <div>
                {viewType !== 'dayGridMonth' ? (
                  <>
                    <div>
                      <strong>{petName}</strong>
                    </div>
                    <div>{userName}</div>
                  </>
                ) : (
                  <>
                    <div>
                      {arg.timeText} - {petName}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        }}
      />

      <style jsx global>{`
        .full-calendar-wrapper {
          width: 100%;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .fc .fc-button {
          background-color: #f8f9fa;
          border-color: #dee2e6;
          color: #212529;
        }

        .fc .fc-button:hover {
          background-color: #e9ecef;
          border-color: #dee2e6;
          color: #212529;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: #fff;
        }

        .fc-day-today {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        .fc-event {
          cursor: pointer;
          padding: 3px 5px;
          border-radius: 4px;
        }

        .fc .fc-timegrid-slot {
          height: 35px;
        }

        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 10px;
          }

          .fc .fc-toolbar-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}

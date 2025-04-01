'use client'

import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

interface FullCalendarProps {
  events: any[]
  onEventClick?: (info: any) => void
}

export default function FullCalendarComponent({
  events,
  onEventClick,
}: FullCalendarProps) {
  return (
    <div className="full-calendar-wrapper">
      {/* FullCalendar 元件 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
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
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        buttonText={{
          today: '今天',
          month: '月',
        }}
        dayHeaderFormat={{ weekday: 'short' }}
        eventDisplay="block"
        eventBorderColor="transparent"
        eventContent={(arg) => {
          const petName = arg.event.extendedProps.pet_name
          const userName = arg.event.extendedProps.user_name
          const status = arg.event.extendedProps.status
          const title = arg.event.title

          return (
            <div className="event-content">
              <div className="event-title">{title}</div>
              <div className="event-user">{userName}</div>
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
          margin-bottom: 1px;
        }

        .fc-event .event-content {
          font-size: 0.85rem;
          line-height: 1.3;
        }

        .fc-event .event-title {
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc-event .event-user {
          font-size: 0.8rem;
          opacity: 0.85;
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

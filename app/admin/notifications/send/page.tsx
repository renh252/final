import { Metadata } from 'next'
import { Container } from 'react-bootstrap'
import NotificationForm from './NotificationForm'

export const metadata: Metadata = {
  title: '發送系統通知 | 寵物領養平台',
  description: '管理員發送系統通知',
}

export default function SendSystemNotification() {
  return (
    <Container className="py-4">
      <h1 className="mb-4">發送系統通知</h1>
      <NotificationForm />
    </Container>
  )
}

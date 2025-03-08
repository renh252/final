'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (
    type: ToastType,
    title: string,
    message: string,
    duration = 5000
  ) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, title, message, duration }])
  }

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastDisplay toasts={toasts} hideToast={hideToast} />
    </ToastContext.Provider>
  )
}

function ToastDisplay({
  toasts,
  hideToast,
}: {
  toasts: ToastMessage[]
  hideToast: (id: string) => void
}) {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContainer>
  )
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage
  onClose: () => void
}) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-success" size={20} />
      case 'error':
        return <AlertCircle className="text-danger" size={20} />
      case 'warning':
        return <AlertCircle className="text-warning" size={20} />
      case 'info':
        return <Info className="text-info" size={20} />
    }
  }

  const getBgClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-subtle text-success'
      case 'error':
        return 'bg-danger-subtle text-danger'
      case 'warning':
        return 'bg-warning-subtle text-warning'
      case 'info':
        return 'bg-info-subtle text-info'
    }
  }

  return (
    <Toast onClose={onClose} className={`border-0 ${getBgClass()}`}>
      <Toast.Header className={`${getBgClass()} border-0`}>
        <span className="me-2">{getIcon()}</span>
        <strong className="me-auto">{toast.title}</strong>
        <small>剛剛</small>
      </Toast.Header>
      <Toast.Body>{toast.message}</Toast.Body>
    </Toast>
  )
}

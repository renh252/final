'use client'

import React, { createContext, useContext, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: number
  type: ToastType
  title: string
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const { isDarkMode } = useTheme()

  const showToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, title, message }])

    // 自動關閉
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />
      case 'error':
        return <AlertCircle size={20} className="text-danger" />
      case 'info':
        return <Info size={20} className="text-info" />
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3 position-fixed"
        style={{ zIndex: 1060 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            className={isDarkMode ? 'bg-dark text-light border-secondary' : ''}
          >
            <Toast.Header
              className={
                isDarkMode ? 'bg-dark text-light border-secondary' : ''
              }
            >
              <span className="me-2">{getToastIcon(toast.type)}</span>
              <strong className="me-auto">{toast.title}</strong>
              <small>剛剛</small>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

'use client'

import React, { createContext, useContext, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useTheme } from '@/app/admin/ThemeContext'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  type?: 'primary' | 'danger' | 'warning' | 'success' | 'info'
}

interface ConfirmContextType {
  confirm: (props: ConfirmDialogProps) => void
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false)
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps | null>(
    null
  )
  const { isDarkMode } = useTheme()

  const confirm = (props: ConfirmDialogProps) => {
    setDialogProps(props)
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    dialogProps?.onCancel && dialogProps.onCancel()
  }

  const handleConfirm = () => {
    setShowModal(false)
    dialogProps?.onConfirm()
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal show={showModal} onHide={handleCancel} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{dialogProps?.title || '確認'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{dialogProps?.message || '您確定要執行此操作嗎？'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={isDarkMode ? 'dark' : 'light'}
            onClick={handleCancel}
          >
            {dialogProps?.cancelText || '取消'}
          </Button>
          <Button
            variant={dialogProps?.type || 'primary'}
            onClick={handleConfirm}
          >
            {dialogProps?.confirmText || '確認'}
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

'use client'

import { useState, createContext, useContext } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { AlertTriangle, Info, HelpCircle, Trash } from 'lucide-react'
import { useTheme } from '../ThemeContext'

type ConfirmType = 'danger' | 'warning' | 'info' | 'confirm'

interface ConfirmOptions {
  title: string
  message: string
  type?: ConfirmType
  confirmText?: string
  cancelText?: string
  onConfirm: () => Promise<void> | void
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const confirm = (options: ConfirmOptions) => {
    setOptions(options)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <ConfirmDialog isOpen={isOpen} onClose={handleClose} {...options} />
      )}
    </ConfirmContext.Provider>
  )
}

interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean
  onClose: () => void
}

function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'confirm',
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDarkMode } = useTheme()

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash className="text-danger" size={24} />
      case 'warning':
        return <AlertTriangle className="text-warning" size={24} />
      case 'info':
        return <Info className="text-info" size={24} />
      case 'confirm':
        return <HelpCircle className="text-primary" size={24} />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      case 'confirm':
        return 'primary'
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <span className="me-2">{getIcon()}</span>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={isDarkMode ? 'dark' : 'light'}
          onClick={onClose}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
        <Button
          variant={getConfirmButtonVariant()}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              處理中...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

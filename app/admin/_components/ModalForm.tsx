'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { useTheme } from '../ThemeContext'

interface FormField {
  name: string
  label: string
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
  placeholder?: string
  required?: boolean
  options?: { value: string | number; label: string }[] // 用於select、radio等
  validation?: (value: any) => string | null // 返回錯誤訊息或null
  defaultValue?: any
}

interface ModalFormProps {
  show: boolean
  onHide: () => void
  title: string
  fields: FormField[]
  onSubmit: (formData: Record<string, any>) => Promise<void>
  initialData?: Record<string, any>
  submitText?: string
  size?: 'sm' | 'lg' | 'xl'
}

export default function ModalForm({
  show,
  onHide,
  title,
  fields,
  onSubmit,
  initialData = {},
  submitText = '儲存',
  size = 'lg',
}: ModalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDarkMode } = useTheme()

  // 初始化表單數據
  useEffect(() => {
    if (show) {
      const initialFormData: Record<string, any> = {}

      fields.forEach((field) => {
        if (initialData && initialData[field.name] !== undefined) {
          initialFormData[field.name] = initialData[field.name]
        } else if (field.defaultValue !== undefined) {
          initialFormData[field.name] = field.defaultValue
        } else {
          // 根據類型設置默認值
          switch (field.type) {
            case 'checkbox':
              initialFormData[field.name] = false
              break
            case 'number':
              initialFormData[field.name] = 0
              break
            default:
              initialFormData[field.name] = ''
          }
        }
      })

      setFormData(initialFormData)
      setErrors({})
    }
  }, [show, initialData, fields])

  // 處理表單輸入變更
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target
    let newValue: any = value

    // 處理特殊類型
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    // 清除錯誤
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      // 必填檢查
      if (
        field.required &&
        (formData[field.name] === undefined ||
          formData[field.name] === null ||
          formData[field.name] === '')
      ) {
        newErrors[field.name] = `${field.label}是必填欄位`
      }

      // 自定義驗證
      if (
        field.validation &&
        formData[field.name] !== undefined &&
        formData[field.name] !== ''
      ) {
        const error = field.validation(formData[field.name])
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onHide()
    } catch (error) {
      console.error('表單提交錯誤:', error)
      // 可以在這裡處理錯誤，例如顯示全局錯誤訊息
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染表單欄位
  const renderField = (field: FormField) => {
    const { name, label, type, placeholder, required, options } = field

    switch (type) {
      case 'textarea':
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>
              {label}
              {required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              placeholder={placeholder}
              isInvalid={!!errors[name]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[name]}
            </Form.Control.Feedback>
          </Form.Group>
        )

      case 'select':
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>
              {label}
              {required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Select
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              isInvalid={!!errors[name]}
            >
              <option value="">請選擇{label}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors[name]}
            </Form.Control.Feedback>
          </Form.Group>
        )

      case 'checkbox':
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Check
              type="checkbox"
              id={`checkbox-${name}`}
              name={name}
              label={label}
              checked={!!formData[name]}
              onChange={handleChange}
              isInvalid={!!errors[name]}
              feedback={errors[name]}
              feedbackType="invalid"
            />
          </Form.Group>
        )

      case 'radio':
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>
              {label}
              {required && <span className="text-danger">*</span>}
            </Form.Label>
            <div>
              {options?.map((option) => (
                <Form.Check
                  key={option.value}
                  type="radio"
                  id={`radio-${name}-${option.value}`}
                  name={name}
                  label={option.label}
                  value={option.value}
                  checked={formData[name] === option.value}
                  onChange={handleChange}
                  isInvalid={!!errors[name]}
                  inline
                />
              ))}
            </div>
            {errors[name] && (
              <div className="text-danger small mt-1">{errors[name]}</div>
            )}
          </Form.Group>
        )

      case 'date':
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>
              {label}
              {required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="date"
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              isInvalid={!!errors[name]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[name]}
            </Form.Control.Feedback>
          </Form.Group>
        )

      default:
        return (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>
              {label}
              {required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              placeholder={placeholder}
              isInvalid={!!errors[name]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[name]}
            </Form.Control.Feedback>
          </Form.Group>
        )
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      size={size}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>{fields.map(renderField)}</Modal.Body>
        <Modal.Footer>
          <Button
            variant={isDarkMode ? 'dark' : 'light'}
            onClick={onHide}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
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
              submitText
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
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
    | string
  placeholder?: string
  required?: boolean
  options?: { value: string | number; label: string }[] // 用於select、radio等
  validation?: (value: any) => string | null // 返回錯誤訊息或null
  defaultValue?: any
  value?: any
}

interface ModalFormProps {
  show: boolean
  onHide: () => void
  title: string
  fields?: FormField[]
  onSubmit?: (formData: Record<string, any>) => Promise<void>
  initialData?: Record<string, any>
  submitText?: string
  size?: 'sm' | 'lg' | 'xl'
  children?: React.ReactNode
  footer?: React.ReactNode
}

export default function ModalForm({
  show,
  onHide,
  title,
  fields = [],
  onSubmit,
  initialData = {},
  submitText = '儲存',
  size = 'lg',
  children,
  footer,
}: ModalFormProps) {
  // 表單狀態
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDarkMode } = useTheme()

  // 使用單一useRef保存所有props，避免頻繁比較
  const propsRef = useRef<{
    show: boolean
    fields: FormField[]
    initialData: Record<string, any>
    initialized: boolean
    fieldsHash: string
    initialDataHash: string
  }>({
    show: false,
    fields: [],
    initialData: {},
    initialized: false,
    fieldsHash: '',
    initialDataHash: '',
  })

  // 創建簡單的字符串hash，用於比較對象內容是否變化
  const getSimpleHash = (obj: any): string => {
    return JSON.stringify(obj)
  }

  // 模態窗狀態變化處理
  useEffect(() => {
    // 如果模態框關閉，重置狀態
    if (!show) {
      // 模態框關閉時，僅重置初始化狀態
      propsRef.current.initialized = false
      return
    }

    // 模態框打開且尚未初始化：執行一次性初始化
    if (show && !propsRef.current.initialized) {
      console.log('初始化模態窗表單')

      // 標記為已初始化
      propsRef.current.initialized = true
      propsRef.current.fieldsHash = getSimpleHash(fields)
      propsRef.current.initialDataHash = getSimpleHash(initialData)
      propsRef.current.fields = fields
      propsRef.current.initialData = initialData

      // 初始化表單數據
      setFormData(processFormData(fields, initialData))
      setErrors({})
    }
    // 不在依賴數組中添加fields和initialData，避免引起連鎖反應
  }, [show])

  // 處理fields和initialData變化
  useEffect(() => {
    // 檢查模態窗是否已顯示且已初始化
    if (!show || !propsRef.current.initialized) {
      return
    }

    // 檢測是否有實質性變化
    const newFieldsHash = getSimpleHash(fields)
    const newInitialDataHash = getSimpleHash(initialData)

    const fieldsChanged = newFieldsHash !== propsRef.current.fieldsHash
    const initialDataChanged =
      newInitialDataHash !== propsRef.current.initialDataHash

    // 有變化時才更新
    if (fieldsChanged || initialDataChanged) {
      console.log('檢測到fields或initialData變化')

      // 更新引用哈希值
      propsRef.current.fieldsHash = newFieldsHash
      propsRef.current.initialDataHash = newInitialDataHash
      propsRef.current.fields = fields
      propsRef.current.initialData = initialData

      // 更新表單數據
      if (fieldsChanged && initialDataChanged) {
        // 兩者都變化時，完全重新處理表單數據
        setFormData(processFormData(fields, initialData))
      } else if (fieldsChanged) {
        // 僅字段變化時，保留用戶已輸入的值
        setFormData((prevData) => {
          const newBaseData = processFormData(fields, initialData)
          return { ...newBaseData, ...prevData }
        })
      } else {
        // 僅初始數據變化時，智能更新相關字段
        setFormData((prevData) => {
          const updatedData = { ...prevData }

          fields.forEach((field) => {
            if (initialData && initialData[field.name] !== undefined) {
              if (field.type === 'date' && initialData[field.name]) {
                try {
                  const dateValue = initialData[field.name]
                  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                    updatedData[field.name] = dateValue
                  } else {
                    const date = new Date(dateValue)
                    if (!isNaN(date.getTime())) {
                      updatedData[field.name] = date.toISOString().split('T')[0]
                    }
                  }
                } catch (e) {
                  // 日期錯誤處理
                }
              } else {
                updatedData[field.name] = initialData[field.name]
              }
            }
          })

          return updatedData
        })
      }

      // 清空錯誤
      setErrors({})
    }
  }, [show, fields, initialData])

  // 處理表單數據的函數(從useEffect中提取出來)
  function processFormData(
    fields: FormField[],
    initialData: Record<string, any>
  ): Record<string, any> {
    const processedData: Record<string, any> = {}

    fields.forEach((field) => {
      // 優先使用 initialData 中的值
      if (initialData && initialData[field.name] !== undefined) {
        // 處理日期類型
        if (field.type === 'date' && initialData[field.name]) {
          try {
            const dateValue = initialData[field.name]
            // 檢查是否已經是YYYY-MM-DD格式
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              processedData[field.name] = dateValue
            } else {
              // 嘗試轉換日期格式
              const date = new Date(dateValue)
              if (!isNaN(date.getTime())) {
                processedData[field.name] = date.toISOString().split('T')[0]
              } else {
                processedData[field.name] = ''
              }
            }
          } catch (e) {
            processedData[field.name] = ''
            console.error('日期轉換錯誤:', e)
          }
        } else {
          processedData[field.name] = initialData[field.name]
        }
      }
      // 如果沒有 initialData，檢查 field.value
      else if (field.value !== undefined) {
        // 處理日期類型
        if (field.type === 'date' && field.value) {
          try {
            const dateValue = field.value
            // 檢查是否已經是YYYY-MM-DD格式
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              processedData[field.name] = dateValue
            } else {
              // 嘗試轉換日期格式
              const date = new Date(dateValue)
              if (!isNaN(date.getTime())) {
                processedData[field.name] = date.toISOString().split('T')[0]
              } else {
                processedData[field.name] = ''
              }
            }
          } catch (e) {
            processedData[field.name] = ''
            console.error('日期轉換錯誤:', e)
          }
        } else {
          processedData[field.name] = field.value
        }
      }
      // 再檢查 defaultValue
      else if (field.defaultValue !== undefined) {
        processedData[field.name] = field.defaultValue
      }
      // 最後設置默認空值
      else {
        switch (field.type) {
          case 'checkbox':
            processedData[field.name] = false
            break
          case 'number':
            processedData[field.name] = 0
            break
          default:
            processedData[field.name] = ''
        }
      }
    })

    return processedData
  }

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
    } else if (type === 'date') {
      // 確保日期格式正確
      if (value) {
        try {
          // 將 yyyy-MM-dd 格式保持不變
          newValue = value
          console.log(`日期輸入: ${value}`)
        } catch (error) {
          console.error(`日期格式處理錯誤: ${value}`, error)
          newValue = ''
        }
      } else {
        newValue = ''
      }
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

    fields?.forEach((field) => {
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
      await onSubmit?.(formData)
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
      {onSubmit ? (
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {fields?.map(renderField)}
            {children}
          </Modal.Body>
          <Modal.Footer>
            {footer || (
              <>
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
              </>
            )}
          </Modal.Footer>
        </Form>
      ) : (
        <>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>
            {footer || (
              <Button variant={isDarkMode ? 'dark' : 'light'} onClick={onHide}>
                關閉
              </Button>
            )}
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

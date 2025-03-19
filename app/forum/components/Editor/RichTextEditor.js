'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { Boot, i18nChangeLanguage } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

const RichTextEditor = ({ initialContent = '', onContentChange }) => {
  // 編輯器實例 - 存儲在 state 中
  const [editor, setEditor] = useState(null)
  // 編輯器內容 HTML
  const [html, setHtml] = useState(initialContent)

  // 工具欄配置
  const toolbarConfig = {
    excludeKeys: [],
  }

  // 編輯器配置
  const editorConfig = {
    placeholder: '請在這裡輸入內容...',
    MENU_CONF: {
      uploadImage: {
        customUpload: async (file, insertFn) => {
          const formData = new FormData()
          formData.append('image', file)

          try {
            const response = await fetch('/api/uploads', {
              method: 'POST',
              body: formData,
              credentials: 'include',
            })

            if (!response.ok) {
              throw new Error('圖片上傳失敗')
            }

            const data = await response.json()
            insertFn(data.url, data.alt || file.name, data.href || '')
          } catch (error) {
            console.error('圖片上傳出錯:', error)
            alert('圖片上傳失敗，請重試')
          }
        },
      },
    },
  }

  // 初始化編輯器
  useEffect(() => {
    // 設置語言
    i18nChangeLanguage('zh-TW')

    // 注意：SSR 環境下需要在客戶端執行才能設置 Editor
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  // 當內容改變時，回調父組件
  useEffect(() => {
    if (onContentChange) {
      onContentChange(html)
    }
  }, [html, onContentChange])

  // 設置初始內容
  useEffect(() => {
    setHtml(initialContent)
  }, [initialContent])

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={(editor) => setHtml(editor.getHtml())}
        mode="default"
        style={{ height: '400px', overflowY: 'hidden' }}
      />
    </div>
  )
}

export default RichTextEditor

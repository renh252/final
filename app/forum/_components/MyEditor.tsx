'use client'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'


function MyEditor() {
  // editor 實例
  const [editor, setEditor] = useState<IDomEditor | null>(null) // TS 語法

  // 編輯器內容
  const [html, setHtml] = useState('<p>hello</p>')

  // 模擬 ajax 請求，非同步載入 html
  useEffect(() => {
    setTimeout(() => {
      setHtml('<p>hello world</p>')
    }, 1500)
  }, [])

  // 工具列設定
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [],
  }// TS 語法
  // const toolbarConfig = 

  // 編輯器設定
  const editorConfig: Partial<IEditorConfig> = {
    // TS 語法
    // const editorConfig = 
    placeholder: '請輸入內容...',
  }

  // 及時銷毀 editor，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  return (
    <>
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
          style={{ height: '500px', overflowY: 'hidden' }}
        />
      </div>
      <div style={{ marginTop: '15px' }}>{html}</div>
    </>
  )
}

export default MyEditor

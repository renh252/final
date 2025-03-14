'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { Boot } from '@wangeditor/editor';
import { uploadImageModule } from './uploadImageModule';
import '@wangeditor/editor/dist/css/style.css';

// 註冊自定義模組
Boot.registerModule(uploadImageModule);

const PublishEditor = ({ onChange, initialContent = '' }) => {
  // 編輯器實例
  const [editor, setEditor] = useState(null);
  // 編輯器內容
  const [html, setHtml] = useState(initialContent);

  // 工具列配置
  const toolbarConfig = {
    excludeKeys: [],
  };

  // 編輯器配置
  const editorConfig = {
    placeholder: '請輸入內容...',
    MENU_CONF: {
      uploadImage: {
        server: '/api/upload',
        fieldName: 'file',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxNumberOfFiles: 10,
        allowedFileTypes: ['image/*'],
        metaWithUrl: true,
        customUpload: async (file, insertFn) => {
          // 這裡可以自定義上傳邏輯
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) throw new Error('上傳失敗');
            
            const data = await response.json();
            insertFn(data.url, data.alt, data.href);
          } catch (error) {
            console.error('圖片上傳錯誤:', error);
            return;
          }
        }
      }
    }
  };

  // 及時更新父組件的內容
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(html);
    }
  }, [html, onChange]);

  // 組件卸載時銷毀編輯器
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [editor]);

  return (
    <div className="publish-editor-container">
      <div className="publish-toolbar">
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
      </div>
      <div className="publish-editor">
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={editor => setHtml(editor.getHtml())}
          mode="default"
          style={{ height: '500px', overflowY: 'hidden' }}
        />
      </div>
    </div>
  );
};

export default PublishEditor;
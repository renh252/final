'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const TitleContext = createContext(null)

export function TitleProvider({ children }) {
  const [title, setTitle] = useState('')

  const setPageTitle = (newTitle) => {
    setTitle(newTitle)
    // 設定文檔標題，加上網站名稱後綴
    document.title = newTitle ? `${newTitle} - 毛孩之家` : '毛孩之家'
  }

  return (
    <TitleContext.Provider value={{ setPageTitle }}>
      {children}
    </TitleContext.Provider>
  )
}

// 建立易用的 Hook
export function usePageTitle(title) {
  const context = useContext(TitleContext)

  if (!context) {
    throw new Error('usePageTitle 必須在 TitleProvider 內使用')
  }

  useEffect(() => {
    context.setPageTitle(title)
    // 清理函數：組件卸載時重置標題
    return () => context.setPageTitle('')
  }, [title])
}

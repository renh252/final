'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type ThemeType = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  isDarkMode: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 從本地存儲中獲取主題設置，默認為 'system'
  const [theme, setTheme] = useState<ThemeType>('system')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // 初始化主題
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as ThemeType
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // 監聽系統主題變化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches)
      }
    }

    // 初始設置
    if (theme === 'system') {
      setIsDarkMode(mediaQuery.matches)
    } else {
      setIsDarkMode(theme === 'dark')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // 當主題變化時，更新 body 類和本地存儲
  useEffect(() => {
    localStorage.setItem('admin-theme', theme)

    // 更新 body 類
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }, [theme, isDarkMode])

  // 設置主題的函數
  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: handleSetTheme, isDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// 自定義鉤子，用於在組件中訪問主題上下文
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

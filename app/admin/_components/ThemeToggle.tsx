'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/app/admin/ThemeContext'
import { Dropdown } from 'react-bootstrap'

export default function ThemeToggle() {
  const { theme, setTheme, isDarkMode } = useTheme()

  // 根據當前主題狀態決定顯示的圖標
  const renderIcon = () => {
    // 如果是系統主題，則根據實際的深淺色模式顯示圖標
    if (theme === 'system') {
      return isDarkMode ? <Moon size={20} /> : <Sun size={20} />
    }
    // 否則根據選擇的主題顯示圖標
    return theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        as="button"
        className="theme-toggle-btn"
        id="theme-dropdown"
      >
        {renderIcon()}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Header>選擇主題</Dropdown.Header>
        <Dropdown.Item
          onClick={() => setTheme('light')}
          active={theme === 'light'}
        >
          <Sun size={16} className="me-2" />
          淺色
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => setTheme('dark')}
          active={theme === 'dark'}
        >
          <Moon size={16} className="me-2" />
          深色
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => setTheme('system')}
          active={theme === 'system'}
        >
          <Monitor size={16} className="me-2" />
          跟隨系統
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

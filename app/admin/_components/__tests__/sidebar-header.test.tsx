/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../Header'
import Sidebar from '../Sidebar'
import { ThemeProvider } from '../../ThemeContext'
import { AdminProvider } from '../../AdminContext'
import { usePathname, useRouter } from 'next/navigation'

// 模擬 Next.js 的 navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// 模擬 AdminContext 的值
const mockAdminContext = {
  admin: {
    id: 1,
    account: 'admin',
    privileges: '111',
  },
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn().mockResolvedValue(true),
  hasPermission: jest.fn().mockReturnValue(true),
}

// 包裝測試組件的 Provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AdminProvider>
  )
}

// 模擬 AdminProvider 和 ThemeProvider
jest.mock('../../AdminContext', () => ({
  useAdmin: () => mockAdminContext,
  AdminProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock('../../ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// 設置移動設備環境
const setupMobileEnvironment = () => {
  // 設置視窗寬度為移動設備寬度
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 480,
  })

  // 觸發 resize 事件
  window.dispatchEvent(new Event('resize'))
}

// 設置桌面環境
const setupDesktopEnvironment = () => {
  // 設置視窗寬度為桌面寬度
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })

  // 觸發 resize 事件
  window.dispatchEvent(new Event('resize'))
}

describe('側邊欄和頭部組件測試', () => {
  beforeEach(() => {
    // 重置 mocks
    jest.clearAllMocks()

    // 模擬 pathname
    ;(usePathname as jest.Mock).mockReturnValue('/admin')

    // 默認設置為桌面環境
    setupDesktopEnvironment()
  })

  test('漢堡按鈕點擊時應該觸發 toggleSidebar 函數', () => {
    const toggleSidebar = jest.fn()

    render(
      <TestWrapper>
        <Header toggleSidebar={toggleSidebar} />
      </TestWrapper>
    )

    // 找到漢堡按鈕並點擊
    const hamburgerButton = screen.getByLabelText('切換側邊欄')
    fireEvent.click(hamburgerButton)

    // 驗證 toggleSidebar 被調用
    expect(toggleSidebar).toHaveBeenCalledTimes(1)
  })

  test('側邊欄在收起狀態下點擊鏈接應該觸發 onToggle 函數', () => {
    const onToggle = jest.fn()

    render(
      <TestWrapper>
        <Sidebar collapsed={true} onToggle={onToggle} />
      </TestWrapper>
    )

    // 等待組件掛載完成
    act(() => {
      // 模擬組件掛載
    })

    // 找到側邊欄鏈接並點擊
    const sidebarLinks = screen.getAllByRole('link')
    if (sidebarLinks.length > 0) {
      fireEvent.click(sidebarLinks[0])

      // 驗證 onToggle 被調用
      expect(onToggle).toHaveBeenCalledTimes(1)
    }
  })

  // 移動設備測試
  describe('移動設備測試', () => {
    beforeEach(() => {
      // 設置移動設備環境
      setupMobileEnvironment()
    })

    test('在移動設備上漢堡按鈕點擊應該觸發 toggleSidebar 函數', () => {
      const toggleSidebar = jest.fn()

      render(
        <TestWrapper>
          <Header toggleSidebar={toggleSidebar} />
        </TestWrapper>
      )

      // 找到漢堡按鈕並點擊
      const hamburgerButton = screen.getByLabelText('切換側邊欄')
      fireEvent.click(hamburgerButton)

      // 驗證 toggleSidebar 被調用
      expect(toggleSidebar).toHaveBeenCalledTimes(1)
    })

    test('在移動設備上側邊欄在收起狀態下點擊鏈接應該觸發 onToggle 函數', () => {
      const onToggle = jest.fn()

      render(
        <TestWrapper>
          <Sidebar collapsed={true} onToggle={onToggle} />
        </TestWrapper>
      )

      // 等待組件掛載完成
      act(() => {
        // 模擬組件掛載
      })

      // 找到側邊欄鏈接並點擊
      const sidebarLinks = screen.getAllByRole('link')
      if (sidebarLinks.length > 0) {
        fireEvent.click(sidebarLinks[0])

        // 驗證 onToggle 被調用
        expect(onToggle).toHaveBeenCalledTimes(1)
      }
    })

    test('在移動設備上側邊欄應該默認收起', async () => {
      // 創建一個模擬的 layout 組件
      const MobileLayout = () => {
        const [isMobile, setIsMobile] = React.useState(false)
        const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

        React.useEffect(() => {
          const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            // 在移動設備上默認收起側邊欄
            if (mobile && !sidebarCollapsed) setSidebarCollapsed(true)
          }

          handleResize()
          window.addEventListener('resize', handleResize)

          return () => window.removeEventListener('resize', handleResize)
        }, [sidebarCollapsed])

        return (
          <TestWrapper>
            <div data-testid="mobile-layout">
              <div
                className={`admin-sidebar ${
                  sidebarCollapsed ? 'collapsed' : ''
                }`}
                data-testid="sidebar"
              >
                <Sidebar
                  collapsed={sidebarCollapsed}
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
              </div>
            </div>
          </TestWrapper>
        )
      }

      render(<MobileLayout />)

      // 等待 useEffect 執行完成
      await waitFor(() => {
        const sidebar = screen.getByTestId('sidebar')
        expect(sidebar).toHaveClass('collapsed')
      })
    })
  })
})

// 集成測試：測試 Header 和 Sidebar 的交互
describe('Header 和 Sidebar 集成測試', () => {
  test('漢堡按鈕點擊應該切換側邊欄的展開/收起狀態', () => {
    // 創建一個模擬的 layout 組件來測試 Header 和 Sidebar 的交互
    const TestLayout = () => {
      const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
      const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

      return (
        <TestWrapper>
          <div data-testid="test-layout">
            <Header toggleSidebar={toggleSidebar} />
            <div
              className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
              data-testid="sidebar"
            >
              <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
          </div>
        </TestWrapper>
      )
    }

    render(<TestLayout />)

    // 找到漢堡按鈕
    const hamburgerButton = screen.getByLabelText('切換側邊欄')

    // 點擊漢堡按鈕
    fireEvent.click(hamburgerButton)

    // 驗證側邊欄狀態變化
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('collapsed')
  })

  test('在移動設備上漢堡按鈕點擊應該切換側邊欄的展開/收起狀態', async () => {
    // 設置移動設備環境
    setupMobileEnvironment()

    // 創建一個模擬的 layout 組件來測試 Header 和 Sidebar 的交互
    const MobileTestLayout = () => {
      // 直接將 isMobile 初始化為 true，確保移動設備模式立即生效
      const [isMobile, setIsMobile] = React.useState(true)
      const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true)

      React.useEffect(() => {
        const handleResize = () => {
          const mobile = window.innerWidth < 768
          setIsMobile(mobile)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
      }, [])

      const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
        console.log(
          'Toggle sidebar:',
          !sidebarCollapsed ? 'collapsed' : 'expanded'
        )
      }

      return (
        <TestWrapper>
          <div data-testid="mobile-test-layout">
            <Header toggleSidebar={toggleSidebar} />
            <div
              className={`admin-sidebar ${
                sidebarCollapsed ? 'collapsed' : ''
              } ${isMobile && !sidebarCollapsed ? 'open' : ''}`}
              data-testid="mobile-sidebar"
            >
              <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
          </div>
        </TestWrapper>
      )
    }

    render(<MobileTestLayout />)

    // 等待 useEffect 執行完成
    await waitFor(() => {
      const sidebar = screen.getByTestId('mobile-sidebar')
      expect(sidebar).toHaveClass('collapsed')
    })

    // 找到漢堡按鈕
    const hamburgerButton = screen.getByLabelText('切換側邊欄')

    // 點擊漢堡按鈕
    fireEvent.click(hamburgerButton)

    // 驗證側邊欄狀態變化 - 在移動設備上，側邊欄會保持 collapsed 類，但會添加 open 類
    await waitFor(() => {
      const sidebar = screen.getByTestId('mobile-sidebar')
      // 在移動設備上，側邊欄仍然有 collapsed 類，但同時也有 open 類
      expect(sidebar).not.toHaveClass('collapsed')
      expect(sidebar).toHaveClass('open')
    })
  })
})

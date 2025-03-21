# 認證系統使用指南

本文檔說明了如何在專案中使用認證系統。

## useAuth Hook

`useAuth` 是一個自定義 React Hook，它提供了與用戶認證相關的狀態和方法。

### 用途

- 獲取當前用戶資訊
- 執行登入/登出操作
- 檢查用戶認證狀態
- 更新用戶資訊

### 可用資源

`useAuth` 返回一個物件，包含以下內容：

| 屬性/方法                 | 類型   | 描述                                  |
| ------------------------- | ------ | ------------------------------------- |
| `user`                    | 物件   | 當前登入用戶的資訊，未登入時為 `null` |
| `loading`                 | 布林值 | 表示認證系統是否正在載入用戶資訊      |
| `isAuthenticated`         | 布林值 | 表示用戶是否已認證（已登入）          |
| `login(userData)`         | 函數   | 登入用戶，並儲存認證資訊              |
| `logout()`                | 函數   | 登出用戶，清除認證資訊                |
| `updateUser(updatedUser)` | 函數   | 更新用戶資訊                          |

### 使用方式

在 React 組件中使用 `useAuth`：

```jsx
'use client'
import { useAuth } from '@/app/context/AuthContext'

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth()

  if (loading) return <div>載入中...</div>
  if (!user) return <div>請先登入</div>

  return (
    <div>
      <h1>用戶資料</h1>
      <p>姓名：{user.name}</p>
      <p>電子郵件：{user.email}</p>
      <button onClick={logout}>登出</button>
    </div>
  )
}
```

## 路由權限管理(withAuth)

在我們的專案中，路由權限管理是通過 `config/routes.js` 配置文件集中管理的，這大大簡化了權限控制的複雜度。

### 路由配置

通過在 `config/routes.js` 中定義路由類型，我們可以輕鬆指定哪些頁面是公開的，哪些頁面需要登入才能訪問：

```jsx
// 路由配置表 - 只需指定路徑和類型
const routes = [
  // 公開頁面
  { path: '/', type: RouteType.PUBLIC }, // 首頁
  { path: '/member/MemberLogin', type: RouteType.PUBLIC }, // 會員登入相關頁面
  { path: '/pets', type: RouteType.PUBLIC }, // 寵物列表

  // 受保護頁面
  { path: '/member', type: RouteType.PROTECTED }, // 會員中心
  { path: '/shop/cart', type: RouteType.PROTECTED }, // 購物車
  { path: '/shop/checkout', type: RouteType.PROTECTED }, // 結帳
]
```

只需要在此配置文件中添加新的路徑和權限類型，整個應用就會自動處理權限檢查，無需修改頁面組件。

### 如何添加新的受保護頁面

要添加新的受保護頁面，只需在 `config/routes.js` 中的 `routes` 陣列中添加一條新記錄：

```jsx
{ path: '/您的新頁面路徑', type: RouteType.PROTECTED } // 您的新受保護頁面
```

系統會自動識別這個路徑及其子路徑，並要求用戶登入才能訪問。

## 認證系統架構

我們的認證系統架構包含以下關鍵組件：

1. `AuthProvider` - 提供整個應用程序的認證狀態和方法
2. `LayoutWrapper` - 內建中間件機制，檢查路由權限
3. `config/routes.js` - 集中管理路由權限配置

在 `LayoutWrapper` 中，系統會根據 `config/routes.js` 中的配置，自動判斷當前路由是否需要認證，並在需要時重定向未登入用戶到登入頁面。

## 最佳實踐

1. **集中管理路由權限**：所有頁面的權限控制都應該在 `config/routes.js` 中配置，這樣可以提供一個清晰的全局視圖。

2. **客戶端組件中使用 useAuth**：在需要訪問用戶資訊或執行登入/登出操作的客戶端組件中使用 `useAuth` hook。

3. **處理載入狀態**：在使用 `useAuth` 獲取用戶資訊的組件中，始終處理 `loading` 狀態，提供良好的用戶體驗。

4. **頁面組件保持簡潔**：讓頁面組件專注於其功能和顯示邏輯，將權限控制邏輯交給系統自動處理。

## 注意事項

- `useAuth` 只能在客戶端組件（Client Components）中使用，請確保在使用它的文件頂部添加 `'use client'` 指令。
- 不要在頁面組件中手動實現重定向邏輯，讓 `LayoutWrapper` 處理這部分工作。
- 如果頁面需要根據用戶角色或權限進行更細粒度的控制，可以在頁面內部使用 `useAuth` 獲取用戶資訊，然後根據用戶角色決定顯示什麼內容。

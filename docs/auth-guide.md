# 認證系統使用指南

本文檔說明了在專案中使用認證系統的兩個主要工具：`useAuth` hook 和 `withAuth` 高階組件（HOC）。

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

## withAuth 高階組件

`withAuth` 是一個高階組件（HOC），用於保護需要認證的頁面或組件。

### 用途

- 保護特定頁面，確保只有已登入用戶可以訪問
- 自動將未登入用戶重定向到登入頁面
- 處理認證相關的載入狀態

### 使用方式

使用 `withAuth` 包裝需要保護的頁面組件：

```jsx
'use client'
import { withAuth } from '@/app/context/AuthContext'

function SecretPage() {
  return (
    <div>
      <h1>機密內容</h1>
      <p>這是只有登入用戶才能看到的內容</p>
    </div>
  )
}

// 導出經過 withAuth 包裝的組件
export default withAuth(SecretPage)
```

## 認證系統架構

從 Next.js 13 的 App Router 開始，我們在專案中實施了以下認證架構：

1. `AuthProvider` - 提供整個應用程序的認證狀態
2. `LayoutWrapper` - 內建中間件機制，檢查路由權限
3. `withAuth` - 用於需要額外保護的特定頁面

在 `LayoutWrapper` 中，我們已實現自動檢查路由權限的機制。系統會根據 `config/routes.js` 中的配置，自動判斷當前路由是否需要認證，並在需要時重定向用戶。

## 最佳實踐

1. **優先使用中間件機制**：大多數情況下，透過 `config/routes.js` 配置路由權限即可，無需在每個頁面使用 `withAuth`。

2. **客戶端組件中使用 useAuth**：在需要訪問用戶資訊的客戶端組件中使用 `useAuth`。

3. **頁面保護**：如有特殊需求需要對個別頁面增加額外保護，可使用 `withAuth`。

4. **處理載入狀態**：始終處理 `loading` 狀態，提供良好的用戶體驗。

## 注意事項

- `withAuth` 和 `useAuth` 只能在客戶端組件（Client Components）中使用，請確保在使用它們的文件頂部添加 `'use client'` 指令。
- 由於在 `LayoutWrapper` 中已經實現了自動路由保護，在大多數情況下不需要使用 `withAuth`。
- 如果頁面需要根據用戶角色或權限進行更細粒度的控制，建議使用 `useAuth` 自行實現相關邏輯。

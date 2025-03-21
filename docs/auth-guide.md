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

## 路由權限管理

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
  { path: '/donate/flow', type: RouteType.PROTECTED }, // 捐款結帳
]
```

只需要在此配置文件中添加新的路徑和權限類型，整個應用就會自動處理權限檢查，無需修改頁面組件。

### 如何添加新的受保護頁面

要添加新的受保護頁面，只需在 `config/routes.js` 中的 `routes` 陣列中添加一條新記錄：

```jsx
{ path: '/您的新頁面路徑', type: RouteType.PROTECTED } // 您的新受保護頁面
```

系統會自動識別這個路徑及其子路徑，並要求用戶登入才能訪問。

## 認證系統架構與流程

我們的認證系統包含以下關鍵組件及流程：

1. **`AuthProvider`** - 提供整個應用程序的認證狀態和方法

   - 初始化時從 localStorage 載入用戶資訊
   - 提供 login、logout 和 updateUser 等方法
   - 透過 Context API 共享認證狀態

2. **`LayoutWrapper`** - 內建中間件機制，處理路由權限驗證

   - 每次路由變更時檢查頁面訪問許可
   - 智能處理查詢參數，確保正確檢查路徑
   - 採用無閃爍跳轉機制，提升用戶體驗

3. **`config/routes.js`** - 集中管理路由權限配置

### 認證流程特點

1. **完整路徑記錄與返回**

   - 當未登入用戶訪問受保護頁面時，系統會記錄完整的原始路徑到 `sessionStorage`
   - 包含所有查詢參數和動態路由部分（例如：`/pet/123?category=dog&age=2`）
   - 用戶登入成功後，自動返回原本想訪問的完整頁面，並保留所有參數和狀態
   - 支援複雜的搜尋條件和過濾器設置，無需用戶重新操作

2. **局部內容區域轉場效果**

   - 加載和權限檢查效果僅顯示在主要內容區域
   - 頁面頂部和底部的佈局（Header、Footer 等）保持可見和固定
   - 提供更自然的頁面過渡體驗，減少視覺干擾

3. **無閃爍跳轉**

   - 使用 `requestAnimationFrame` 優化跳轉流程，最小化視覺閃爍
   - 統一的加載提示，包含動畫效果和狀態訊息
   - 使用 Next.js 的 router.push 進行跳轉，避免頁面重載

4. **優化的視覺反饋**
   - 採用動畫加載指示器，提供良好的視覺回饋
   - 根據權限檢查階段顯示不同的提示訊息
   - 平滑的淡入效果，避免突兀的視覺變化

### 權限檢查流程

權限檢查分為以下幾個階段，每個階段都有對應的視覺提示：

1. **初始載入**：顯示「載入用戶資訊...」
2. **檢查權限**：顯示「檢查頁面權限...」
3. **重定向**：顯示「正在跳轉至登入頁面...」
4. **錯誤處理**：顯示「權限檢查發生錯誤，轉跳至登入頁面...」

## 最佳實踐

1. **集中管理路由權限**：所有頁面的權限控制都應該在 `config/routes.js` 中配置，這樣可以提供一個清晰的全局視圖。

2. **客戶端組件中使用 useAuth**：在需要訪問用戶資訊或執行登入/登出操作的客戶端組件中使用 `useAuth` hook。

3. **處理載入狀態**：在使用 `useAuth` 獲取用戶資訊的組件中，始終處理 `loading` 狀態，提供良好的用戶體驗。

4. **頁面組件保持簡潔**：讓頁面組件專注於其功能和顯示邏輯，將權限控制邏輯交給系統自動處理。

5. **視覺一致性**：對認證相關的提示和轉場使用一致的視覺設計，避免使用者感到困惑。

6. **避免手動權限檢查**：不要在頁面中實現重複的權限檢查邏輯，統一依賴 `LayoutWrapper` 處理。

7. **優化 CSS 樣式**：網站已包含預設的認證加載樣式，如需自定義，可以在全局 CSS 中修改 `.auth-loading` 相關樣式。

## 認證樣式定製

我們的認證系統內建了優雅的加載和跳轉提示。這些樣式定義在 `app/globals.css` 中，主要包括：

```css
/* 認證系統加載樣式 */
.auth-loading {
  position: relative;
  min-height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--auth-loading-bg);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 8px var(--auth-loading-shadow);
  z-index: 100;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.auth-loading::after {
  content: '';
  width: 30px;
  height: 30px;
  border: 3px solid var(--primary-light);
  border-radius: 50%;
  border-top-color: var(--auth-loading-text);
  animation: spin 0.8s linear infinite;
  margin-right: 12px;
}

.auth-loading::before {
  content: attr(data-text);
  color: var(--auth-loading-text);
  font-size: 1rem;
  font-weight: 500;
  text-shadow: 0 1px 2px var(--auth-loading-shadow);
}
```

您可以根據需要調整這些樣式以符合專案的整體設計。

## 注意事項

- `useAuth` 只能在客戶端組件（Client Components）中使用，請確保在使用它的文件頂部添加 `'use client'` 指令。
- 不要在頁面組件中手動實現重定向邏輯，讓 `LayoutWrapper` 處理這部分工作。
- 如果頁面需要根據用戶角色或權限進行更細粒度的控制，可以在頁面內部使用 `useAuth` 獲取用戶資訊，然後根據用戶角色決定顯示什麼內容。
- 登入成功後系統會自動返回用戶原本嘗試訪問的頁面，這對於提升用戶體驗非常重要。
- CSS 加載動畫使用 `data-text` 屬性來顯示當前狀態，在 `LayoutWrapper` 中會根據不同階段設置不同的提示文字。
- 加載和權限檢查的視覺效果僅顯示在內容區域，保持網站 Header 和 Footer 的穩定性，提供更一致的使用者體驗。

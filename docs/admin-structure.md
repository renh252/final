# 後台管理系統結構文檔

> 最後更新時間：2024-03-14
>
> 本文檔描述了寵物領養平台後台管理系統的結構和功能。完整的 API 路由列表請參考 [API 結構文檔](api-structure.md)，項目當前狀態請參考 [項目狀態文檔](current-status.md)。

## 目錄

1. [概述](#概述)
2. [路由結構](#路由結構)
3. [主要模塊](#主要模塊)
4. [共用元件](#共用元件)
5. [認證與授權](#認證與授權)
6. [資料庫交互](#資料庫交互)

## 概述

本文檔描述了寵物領養平台後台管理系統的結構和功能。後台管理系統使用 Next.js 框架開發，採用 App Router 結構，並使用 React Bootstrap 作為 UI 框架。系統包含多個管理模塊，如會員管理、商城管理、寵物管理等，每個模塊都有相應的功能和頁面。

## 路由結構

後台管理系統的路由結構如下：

| 頁面名稱       | 父節點   | 路由                                  |
| -------------- | -------- | ------------------------------------- |
| 管理區         | 首頁     | /admin                                |
| 會員管理       | 管理區   | /admin/members                        |
| [mid]          | 會員管理 | /admin/members/[mid]                  |
| 商城管理       | 管理區   | /admin/shop                           |
| 商品管理       | 商城管理 | /admin/shop/products                  |
| 新增商品       | 商品管理 | /admin/shop/products/add              |
| 商品編輯       | 商品管理 | /admin/shop/products/[pid]            |
| 訂單管理       | 商城管理 | /admin/shop/orders                    |
| 訂單詳情       | 訂單管理 | /admin/shop/orders/[oid]              |
| 商品分類管理   | 商城管理 | /admin/shop/categories                |
| 優惠券管理     | 商城管理 | /admin/shop/coupons                   |
| 寵物管理       | 管理區   | /admin/pets                           |
| 新增寵物       | 寵物管理 | /admin/pets/add                       |
| 寵物編輯       | 寵物管理 | /admin/pets/[pid]                     |
| 寵物分類管理   | 寵物管理 | /admin/pets/categories                |
| 預約管理       | 寵物管理 | /admin/pets/appointments              |
| 論壇管理       | 管理區   | /admin/forum                          |
| 文章管理       | 論壇管理 | /admin/forum/articles                 |
| 文章審核/編輯  | 文章管理 | /admin/forum/articles/[aid]           |
| 文章分類管理   | 論壇管理 | /admin/forum/categories               |
| 檢舉管理       | 論壇管理 | /admin/forum/reports                  |
| 金流管理       | 管理區   | /admin/finance                        |
| 金流儀表板     | 金流管理 | /admin/finance/dashboard              |
| 交易紀錄       | 金流管理 | /admin/finance/transactions           |
| 商品訂單       | 交易紀錄 | /admin/finance/transactions/orders    |
| 捐款紀錄       | 交易紀錄 | /admin/finance/transactions/donations |
| 支付管理       | 金流管理 | /admin/finance/payments               |
| 支付方式設定   | 支付管理 | /admin/finance/payments/methods       |
| 金流供應商設定 | 支付管理 | /admin/finance/payments/providers     |
| 退款管理       | 金流管理 | /admin/finance/refunds                |
| 財務報表       | 金流管理 | /admin/finance/reports                |
| 營收報表       | 財務報表 | /admin/finance/reports/revenue        |
| 捐款報表       | 財務報表 | /admin/finance/reports/donations      |
| 結算報表       | 財務報表 | /admin/finance/reports/settlements    |
| 系統設定       | 管理區   | /admin/settings                       |
| 角色權限管理   | 系統設定 | /admin/settings/roles                 |
| 系統參數設定   | 系統設定 | /admin/settings/system                |
| 系統日誌       | 系統設定 | /admin/settings/logs                  |

## 主要模塊

### 管理區首頁

管理區首頁位於 `/admin` 路由，提供了整個後台管理系統的概覽，包括各個模塊的入口和關鍵統計數據。

### 會員管理

會員管理模塊位於 `/admin/members` 路由，負責管理平台的會員資料。主要功能包括：

- 會員列表顯示
- 會員資料編輯
- 會員狀態管理
- 會員資料導入/導出

### 商城管理

商城管理模塊位於 `/admin/shop` 路由，是一個綜合性的管理模塊，包含多個子模塊：

#### 商城總覽

商城總覽頁面位於 `/admin/shop` 路由，提供商城管理的整體概覽，包括：

- 商城統計數據（銷售額、訂單數、平均訂單金額、商品總數）
- 各子模塊的快速入口（商品管理、訂單管理、商品分類管理、優惠券管理）

#### 商品管理

商品管理頁面位於 `/admin/shop/products` 路由，負責管理商城的商品。主要功能包括：

- 商品列表顯示
- 商品新增、編輯、刪除
- 商品狀態管理
- 商品批量操作
- 商品資料導入/導出

#### 訂單管理

訂單管理頁面位於 `/admin/shop/orders` 路由，負責管理商城的訂單。主要功能包括：

- 訂單列表顯示
- 訂單狀態更新
- 訂單詳情查看

#### 商品分類管理

商品分類管理頁面位於 `/admin/shop/categories` 路由，負責管理商品的分類。主要功能包括：

- 分類列表顯示
- 分類新增、編輯、刪除
- 分類層級結構管理

#### 優惠券管理

優惠券管理頁面位於 `/admin/shop/coupons` 路由，負責管理商城的優惠券。主要功能包括：

- 優惠券列表顯示
- 優惠券新增、編輯、刪除
- 優惠券狀態管理

### 寵物管理

寵物管理模塊位於 `/admin/pets` 路由，負責管理平台的寵物資料。主要功能包括：

- 寵物列表顯示
- 寵物資料新增、編輯、刪除
- 寵物狀態管理
- 寵物資料導入/導出
- 寵物分類管理
- 預約管理

### 論壇管理

論壇管理模塊位於 `/admin/forum` 路由，負責管理平台的論壇內容。主要功能包括：

- 文章管理
- 文章分類管理
- 檢舉管理

### 金流管理

金流管理模塊位於 `/admin/finance` 路由，負責管理平台的金流相關功能。主要功能包括：

- 金流儀表板
- 交易紀錄
- 支付管理
- 退款管理
- 財務報表

### 系統設定

系統設定模塊位於 `/admin/settings` 路由，負責管理平台的系統設定。主要功能包括：

- 角色權限管理
- 系統參數設定
- 系統日誌

## 共用元件

後台管理系統使用了多個共用元件，這些元件位於 `app/admin/_components` 目錄下：

- `AdminPageLayout`：後台頁面的通用佈局
- `DataTable`：數據表格元件，用於顯示列表數據
- `ModalForm`：模態表單元件，用於新增/編輯數據
- `Toast`：提示訊息元件
- `ConfirmDialog`：確認對話框元件

## 認證與授權

### 認證機制

後台管理系統使用 JWT (JSON Web Token) 進行認證，主要包含以下部分：

1. **登入流程**

   ```typescript
   // 在 LoginPage 中
   const handleLogin = async () => {
     const response = await fetch('/api/admin/auth/login', {
       method: 'POST',
       body: JSON.stringify({ account, password }),
     })

     if (response.success) {
       // 設置 Cookie
       Cookies.set('admin_token', response.data.token)
       // 保存管理員資訊
       localStorage.setItem('admin', JSON.stringify(response.data.admin))
     }
   }
   ```

2. **認證檢查**

   ```typescript
   // 在 AdminContext 中
   const checkAuth = async () => {
     const token = Cookies.get('admin_token')
     if (!token) return false

     const response = await fetch('/api/admin/auth/verify', {
       headers: { Authorization: `Bearer ${token}` },
     })

     return response.success
   }
   ```

3. **登出流程**

   ```typescript
   const handleLogout = async () => {
     await fetch('/api/admin/auth/logout', {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` },
     })

     Cookies.remove('admin_token')
     localStorage.removeItem('admin')
   }
   ```

### 權限控制

1. **權限定義**

   ```typescript
   // 在 permissions.ts 中
   export const PERMISSIONS = {
     MEMBERS: {
       READ: 'members.read',
       WRITE: 'members.write',
       DELETE: 'members.delete',
     },
     PETS: {
       READ: 'pets.read',
       WRITE: 'pets.write',
       DELETE: 'pets.delete',
     },
     // ... 其他權限
   }
   ```

2. **API 路由保護**

   ```typescript
   // 在 API 路由中
   export const GET = guard.api(async (request: NextRequest, authData) => {
     // 檢查權限
     if (!auth.can(authData, PERMISSIONS.MEMBERS.READ)) {
       return NextResponse.json(
         { success: false, message: '權限不足' },
         { status: 403 }
       )
     }

     // 處理請求
     // ...
   })
   ```

3. **頁面組件保護**
   ```typescript
   // 在頁面組件中
   export default withAuth(MembersPage, PERMISSIONS.MEMBERS.READ)
   ```

### 權限檢查工具

1. **API 路由保護工具**

   ```typescript
   // 在 guard.ts 中
   export const guard = {
     api: (handler: ApiHandler) => {
       return async (request: NextRequest) => {
         try {
           // 驗證授權
           const authData = await auth.fromRequest(request)
           if (!authData) {
             return NextResponse.json(
               { success: false, message: '未授權的請求' },
               { status: 401 }
             )
           }

           // 執行處理器
           return handler(request, authData)
         } catch (error) {
           console.error('API 錯誤:', error)
           return NextResponse.json(
             { success: false, message: '伺服器錯誤' },
             { status: 500 }
           )
         }
       }
     },
   }
   ```

2. **頁面組件保護工具**

   ```typescript
   // 在 useAuth.tsx 中
   export function withAuth<
     P extends { auth?: Auth; can?: (perm: string) => boolean }
   >(Component: React.ComponentType<P>, requiredPerm?: string) {
     return function AuthComponent(props: Omit<P, 'auth' | 'can'>) {
       const { auth, loading, can } = useAuth(requiredPerm)

       if (loading) {
         return <LoadingSpinner />
       }

       if (!auth) {
         return null
       }

       return <Component {...(props as P)} auth={auth} can={can} />
     }
   }
   ```

### 錯誤處理

1. **認證錯誤**

   - 401 未授權：Token 無效或過期
   - 403 權限不足：無權訪問特定資源
   - 重定向到登入頁面：`/admin/login`

2. **API 錯誤處理**

   ```typescript
   try {
     const response = await fetchApi('/api/admin/members')
     if (!response.success) {
       throw new Error(response.message)
     }
     // ... 處理成功響應
   } catch (error) {
     showToast('error', '錯誤', error.message)
   }
   ```

3. **頁面錯誤處理**
   ```typescript
   if (error) {
     return (
       <div className="alert alert-danger">
         <h4>錯誤</h4>
         <p>{error}</p>
         <Button onClick={() => router.back()}>返回</Button>
       </div>
     )
   }
   ```

### 最佳實踐

1. **Token 管理**

   - 使用 Cookie 存儲 token
   - 不要在 localStorage 中存儲敏感資訊
   - 定期檢查 token 有效性

2. **權限檢查**

   - 在 API 和頁面層級都進行權限檢查
   - 使用統一的權限代碼
   - 超級管理員擁有所有權限

3. **錯誤處理**
   - 統一的錯誤處理機制
   - 友好的錯誤提示
   - 適當的錯誤日誌

## 資料庫交互

後台管理系統通過 API 與資料庫進行交互，主要使用 MySQL 資料庫。資料庫連接和查詢邏輯位於 `app/api/admin/_lib/database.ts` 文件中，提供了 `executeQuery` 函數用於執行 SQL 查詢。

資料庫結構的詳細信息可以參考 `docs/database-structure.md` 文件。

## API 路由

> 完整的 API 路由列表請參考 [API 結構文檔](api-structure.md#api-路由結構)

後台 API 路由位於 `app/api/admin` 目錄下。以下是主要的 API 路由結構：

```
app/
  api/
    admin/
      auth/
      pets/
      products/
      members/
      _lib/
```

### API 使用示例

```typescript
// 使用 API 的示例（前端代碼）
const login = async (account: string, password: string) => {
  const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account, password }),
  })
  return await response.json()
}

// 獲取寵物列表
const getPets = async () => {
  const response = await fetch('/api/admin/pets', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return await response.json()
}
```

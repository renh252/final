# 後台管理系統結構文檔

> 最後更新時間：2024-03-14
>
> 本文檔描述了寵物領養平台後台管理系統的結構和功能。完整的 API 路由列表請參考 [API 結構文檔](api-structure.md)，項目當前狀態請參考 [項目狀態文檔](current-status.md)。

## 快速問題定位指引

| 問題類型     | 查看章節                  | 範例代碼                          |
| ------------ | ------------------------- | --------------------------------- |
| 認證問題     | [認證機制](#認證機制)     | [認證檢查](#認證檢查)             |
| 權限控制     | [權限控制](#權限控制)     | [API 路由保護](#api-路由保護)     |
| 權限處理錯誤 | [權限最佳實踐](#最佳實踐) | [權限處理最佳實踐](#權限控制)     |
| 資料庫交互   | [資料庫交互](#資料庫交互) | [資料庫查詢範例](#資料庫查詢範例) |
| API 使用     | [API 路由](#api-路由)     | [API 使用示例](#api-使用示例)     |
| 錯誤處理     | [錯誤處理](#錯誤處理)     | [錯誤處理範例](#錯誤處理)         |

### 常見問題解決方法

1. **驗證管理員身份**：使用 `auth.fromRequest(request)` 代替舊版的 `verifyAdmin(request)`
2. **資料庫查詢**：使用 `const [results, error] = await db.query(...)` 並檢查錯誤
3. **處理 INSERT 操作**：使用 `const insertId = (result as unknown as ResultSetHeader).insertId`
4. **路由組件權限控制**：使用 `export default withAuth(Component, requiredPermission)`
5. **API 路由權限**：使用 `export const GET = guard.api(async (request) => { ... })`
6. **避免 `privileges` 相關錯誤**：使用 `const privileges = admin.privileges || ''; const perms = privileges ? privileges.split(',') : []` 防止 undefined 錯誤

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

> **⚠️ 重要提醒：**
>
> 1. 實際資料庫中的 `manager` 表**沒有** `is_active` 和 `last_login_at` 等欄位，請勿在代碼中使用這些欄位。
> 2. 如遇到 `Unknown column 'is_active' in 'field list'` 錯誤，請檢查 SQL 查詢語句，確保不使用不存在的欄位。
> 3. 請參考 `docs/database-structure.md` 中的實際資料庫結構說明。
> 4. `manager_privileges` 欄位是必不可少的，它存儲管理員的權限信息，**絕對不可為 NULL 或 undefined**，否則會導致權限驗證失敗。
> 5. 有關權限緩存、初始化流程和側邊欄顯示問題，請參考 [admin-permission-system.md](./admin-permission-system.md) 文檔。

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

       // 登入後立即預載入並緩存權限 - 詳見 admin-permission-system.md
       const adminContext = useAdmin()
       adminContext.preloadPermissions()
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

     if (response.success) {
       // 更新管理員資訊和權限緩存
       // 這一步確保側邊欄能夠正確顯示基於權限的菜單項
       // 詳見 admin-permission-system.md
     }

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

> 注意：有關權限系統的完整詳細說明，請參閱專門的 [admin-permission-system.md](./admin-permission-system.md) 文檔，該文檔包含權限格式、緩存策略、初始化流程，以及側邊欄顯示問題的解決方案。

### 權限基本原則

- 所有需要權限控制的操作都應在 API 層面和頁面層面進行雙重驗證
- 使用統一的權限代碼系統，確保 API 和頁面使用相同的權限標識
- 超級管理員具有所有權限
- **重要**：`manager_privileges` 欄位在 `manager` 資料表中不得為 NULL 或 undefined，否則將導致權限驗證失敗

### 權限處理最佳實踐

為防止 `manager_privileges` 相關錯誤，請遵循以下最佳實踐：

1. **資料庫層面**：

   - 確保 `manager` 表中的 `manager_privileges` 欄位設為 NOT NULL
   - 插入或更新管理員記錄時，務必提供至少一個權限值（例如：'member_view'）

2. **程式碼層面**：

   - 讀取 `manager_privileges` 時，使用防禦性編程技巧：

   ```typescript
   // 正確處理方式
   const privileges = admin.manager_privileges || '' // 確保不是 undefined
   const perms = privileges ? privileges.split(',') : [] // 安全地使用 split

   // 權限檢查
   const hasPermission = (requiredPerm) => {
     if (!admin) return false
     const privileges = admin.manager_privileges || ''
     return privileges.split(',').includes(requiredPerm)
   }
   ```

3. **權限驗證一致性**：
   - API 層面和頁面層面使用相同的權限檢查邏輯
   - 使用 `hasPermission` 函數統一處理權限檢查

### 權限代碼定義

管理員權限在 `manager_privileges` 欄位中以逗號分隔的字符串儲存，包含以下許可權：

```
會員相關：
- member_view：檢視會員列表與詳情 (新格式: members:read)
- member_edit：編輯會員資料 (新格式: members:edit)
- member_delete：刪除會員 (新格式: members:delete)

寵物相關：
- pet_view：檢視寵物列表與詳情 (新格式: pets:read)
- pet_add：新增寵物資料 (新格式: pets:create)
- pet_edit：編輯寵物資訊 (新格式: pets:edit)
- pet_delete：刪除寵物資料 (新格式: pets:delete)

...其他權限...
```

> 權限格式的更詳細說明和新舊格式的映射，請參閱 [admin-permission-system.md](./admin-permission-system.md)。

### API 路由保護

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

### 錯誤處理

#### 認證和權限錯誤

1. **認證錯誤 (401, 403)**

   - 認證失敗或權限不足時，重定向到登錄頁面或顯示權限不足提示
   - 前端接收到 401/403 錯誤時，可清除本地 token 並重定向

2. **權限相關錯誤處理**

   - 當遇到 `TypeError: Cannot read properties of undefined (reading 'split')` 錯誤時，通常是因為 `manager_privileges` 欄位為 `undefined`
   - 解決方案：

     ```typescript
     // 使用防禦性編程
     const privileges = admin?.manager_privileges || ''
     const permList = privileges ? privileges.split(',') : []

     // 或使用可選鏈和空值合併運算符
     const permList = admin?.manager_privileges?.split(',') ?? []
     ```

   - 確保資料庫中 `manager_privileges` 欄位不為 NULL，可執行以下 SQL 修復:
     ```sql
     UPDATE manager SET manager_privileges = 'member_view' WHERE manager_privileges IS NULL;
     ```

#### API 錯誤

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
   - **始終預防 manager_privileges 為 undefined 的情況，使用空值合併運算符**
   - **使用防禦性編程方式處理權限字串：`const perms = privileges ? privileges.split(',') : []`**

3. **錯誤處理**
   - 統一的錯誤處理機制
   - 友好的錯誤提示
   - 適當的錯誤日誌

## 資料庫交互

後台管理系統通過 API 與資料庫進行交互，主要使用 MySQL 資料庫。資料庫連接和查詢邏輯位於 `app/api/admin/_lib/database.ts` 文件中，提供了以下主要函數：

1. `executeQuery<T>(sql, params)` - 執行 SQL 查詢並直接返回結果，支援泛型類型參數
2. `executeSecureQuery<T>(sql, params)` - 執行 SQL 查詢並返回 [results, error] 元組
3. `execute<T>(sql, params)` - 執行 SQL 語句並返回 [results, error] 元組
4. `findAdminById(id)` - 根據 ID 查詢管理員資訊

這些函數提供了不同的錯誤處理方式：

- `executeQuery` 拋出異常，適合需要立即中斷執行流程的情況
- `executeSecureQuery` 和 `execute` 返回結果和錯誤的元組，適合需要更細緻錯誤處理的情況

資料庫結構的詳細信息可以參考 `docs/database-structure.md` 文件。

### 資料庫查詢範例

以下是在 API 路由中使用資料庫的範例：

```typescript
import { db } from '@/app/api/admin/_lib/db'
import { ResultSetHeader } from 'mysql2'

// 查詢資料
export async function getCategories() {
  try {
    // 使用解構賦值獲取查詢結果和可能的錯誤
    const [categories, error] = await db.query(`
      SELECT * FROM categories ORDER BY created_at DESC
    `)

    // 務必檢查錯誤
    if (error) {
      throw error
    }

    return categories
  } catch (error) {
    console.error('查詢分類失敗:', error)
    throw error
  }
}

// 新增資料
export async function createCategory(data) {
  try {
    // 插入資料並獲取結果
    const [result, error] = await db.query(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,

      [data.name, data.description]
    )

    if (error) {
      throw error
    }

    // 安全獲取insertId
    const insertId = (result as unknown as ResultSetHeader).insertId

    // 獲取新增的資料
    const [newCategory, fetchError] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
      [insertId]
    )

    if (fetchError) {
      throw fetchError
    }

    return newCategory[0]
  } catch (error) {
    console.error('新增分類失敗:', error)
    throw error
  }
}

// 更新資料
export async function updateCategory(id, data) {
  try {
    const [result, error] = await db.query(
      `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
      [data.name, data.description, id]
    )

    if (error) {
      throw error
    }

    return (result as unknown as ResultSetHeader).affectedRows > 0
  } catch (error) {
    console.error('更新分類失敗:', error)
    throw error
  }
}

// 刪除資料
export async function deleteCategory(id) {
  try {
    const [result, error] = await db.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    )

    if (error) {
      throw error
    }

    return (result as unknown as ResultSetHeader).affectedRows > 0
  } catch (error) {
    console.error('刪除分類失敗:', error)
    throw error
  }
}
```

### 管理員相關資料庫操作範例

以下是與管理員表 (`manager`) 相關的資料庫操作示例：

```typescript
import { db } from '@/app/api/admin/_lib/db'
import { ResultSetHeader } from 'mysql2'
import { hashPassword, comparePassword } from '@/app/api/admin/_lib/password'

// 管理員資料類型
interface Manager {
  id: number
  manager_account: string
  manager_privileges: string
}

// 查詢管理員
export async function getManager(id: number): Promise<Manager | null> {
  try {
    // 注意：manager表只有id, manager_account, manager_password, manager_privileges欄位
    const [managers, error] = await db.query<Manager[]>(
      `SELECT id, manager_account, manager_privileges FROM manager WHERE id = ?`,
      [id]
    )

    if (error) {
      throw error
    }

    return managers?.[0] || null
  } catch (error) {
    console.error('查詢管理員失敗:', error)
    throw error
  }
}

// 驗證管理員登入
export async function verifyManagerLogin(
  account: string,
  password: string
): Promise<Manager | null> {
  try {
    // 查詢管理員資料
    const [managers, error] = await db.query(
      `SELECT id, manager_account, manager_password, manager_privileges FROM manager WHERE manager_account = ?`,
      [account]
    )

    if (error || !managers || managers.length === 0) {
      return null
    }

    const manager = managers[0]

    // 驗證密碼
    const isValid = await comparePassword(password, manager.manager_password)

    if (!isValid) {
      return null
    }

    // 返回管理員資料（不包含密碼）
    const { manager_password, ...managerData } = manager
    return managerData as Manager
  } catch (error) {
    console.error('驗證管理員登入失敗:', error)
    return null
  }
}

// 創建管理員
export async function createManager(data: {
  account: string
  password: string
  privileges: string
}): Promise<Manager | null> {
  try {
    // 加密密碼
    const hashedPassword = await hashPassword(data.password)

    // 插入管理員資料
    const [result, error] = await db.query(
      `INSERT INTO manager (manager_account, manager_password, manager_privileges) VALUES (?, ?, ?)`,

      [data.account, hashedPassword, data.privileges]
    )

    if (error) {
      throw error
    }

    const insertId = (result as unknown as ResultSetHeader).insertId

    // 查詢新建的管理員
    const [managers, fetchError] = await db.query<Manager[]>(
      `SELECT id, manager_account, manager_privileges FROM manager WHERE id = ?`,
      [insertId]
    )

    if (fetchError) {
      throw fetchError
    }

    return managers?.[0] || null
  } catch (error) {
    console.error('創建管理員失敗:', error)
    throw error
  }
}
```

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

# 後台管理系統架構

## 系統概覽

後台管理系統是管理寵物平台的完整管理平台，包括會員管理、寵物資料管理、商品管理、訂單管理和內容管理等。系統採用模塊化設計，每個功能模塊相對獨立，同時通過統一的權限管理系統進行訪問控制。

## 技術架構

- 前端：React + Material UI
- 後端：Express.js + MySQL
- 身份驗證：JWT (JSON Web Token)
- 狀態管理：Redux
- API 通信：REST API

## 核心模塊

### 1. 認證與授權系統

- 管理員登入
- 角色權限管理
- 操作日誌記錄

### 2. 會員管理模塊

- 會員資訊查詢
- 會員狀態管理
- 會員資料編輯

### 3. 寵物管理模塊

- 寵物資訊維護
- 寵物照片管理
- 寵物領養狀態管理
- 寵物特徵管理

### 4. 商品管理模塊

- 商品分類管理
- 商品資訊管理
- 商品庫存管理
- 商品變體管理
- 商品評價審核

### 5. 訂單管理模塊

- 訂單查詢
- 訂單狀態更新
- 退換貨處理
- 出貨管理

### 6. 捐款管理模塊

- 捐款記錄管理
- 收據生成與管理
- 定期捐款追蹤

### 7. 內容管理模塊

- 文章管理
- 評論審核
- 社區貼文管理
- 舉報處理

### 8. 金流管理模塊

- 交易記錄查詢
- 支付狀態管理
- 退款處理

### 9. 系統設定模塊

- 基本信息設定
- 郵件範本管理
- 系統參數設定

### 10. 報表統計模塊

- 銷售報表
- 捐款統計
- 會員活躍度分析
- 商品銷售分析

## 權限控制

系統基於角色的權限控制機制(RBAC)，定義了以下基礎角色：

1. 超級管理員：擁有所有操作權限
2. 會員管理員：管理會員相關資料
3. 商品管理員：管理商品相關資料
4. 訂單管理員：處理訂單與出貨
5. 內容管理員：負責內容審核與管理
6. 捐款管理員：管理捐款記錄與收據
7. 財務管理員：負責財務相關報表與退款

## 頁面結構

### 共用組件

- AdminLayout：統一的頁面布局
- AdminHeader：頁面頂部導航
- AdminSidebar：側邊導航菜單
- AdminBreadcrumb：頁面路徑導航
- AdminDataTable：資料表格組件
- AdminFormBuilder：表單生成組件
- AdminNotification：通知提示組件
- AdminModal：模態窗組件
- AdminFileUploader：文件上傳組件

### 主要頁面

1. Dashboard：系統概覽與統計報表
2. 會員列表頁：會員資訊查詢與管理
3. 會員詳情頁：單個會員詳細資訊
4. 寵物列表頁：寵物資訊查詢與管理
5. 寵物詳情頁：單個寵物詳細資訊
6. 商品列表頁：商品資訊查詢與管理
7. 商品詳情頁：單個商品詳細資訊
8. 訂單列表頁：訂單資訊查詢與管理
9. 訂單詳情頁：單個訂單詳細資訊
10. 捐款列表頁：捐款記錄查詢與管理
11. 捐款詳情頁：單個捐款詳細資訊
12. 文章列表頁：文章查詢與管理
13. 文章詳情頁：單個文章詳細資訊
14. 系統設定頁：系統參數配置
15. 角色權限頁：角色與權限管理
16. 操作日誌頁：系統操作日誌查詢

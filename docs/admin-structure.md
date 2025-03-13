# 後台管理系統結構文檔

## 目錄

1. [概述](#概述)
2. [路由結構](#路由結構)
3. [主要模塊](#主要模塊)
   - [管理區首頁](#管理區首頁)
   - [會員管理](#會員管理)
   - [商城管理](#商城管理)
   - [寵物管理](#寵物管理)
   - [論壇管理](#論壇管理)
   - [金流管理](#金流管理)
   - [系統設定](#系統設定)
4. [共用元件](#共用元件)
5. [API 結構](#api-結構)
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

## API 結構

後台管理系統的 API 結構遵循 Next.js 的 App Router API 路由結構，位於 `app/api/admin` 目錄下：

- `/api/admin/members`：會員管理相關 API
- `/api/admin/products`：商品管理相關 API
- `/api/admin/orders`：訂單管理相關 API
- `/api/admin/pets`：寵物管理相關 API
- `/api/admin/forum`：論壇管理相關 API
- `/api/admin/finance`：金流管理相關 API
- `/api/admin/settings`：系統設定相關 API

## 資料庫交互

後台管理系統通過 API 與資料庫進行交互，主要使用 MySQL 資料庫。資料庫連接和查詢邏輯位於 `app/api/admin/_lib/database.ts` 文件中，提供了 `executeQuery` 函數用於執行 SQL 查詢。

資料庫結構的詳細信息可以參考 `docs/database-structure.md` 文件。

## API 路由

後台 API 路由位於 `app/api/admin` 目錄下，而不是 `app/admin/api`。所有與後台功能相關的 API 都應該放在這個目錄下。

請注意，使用標準的 Next.js API 路由結構是最佳實踐，因此我們將所有 API 整合到 `app/api/admin` 中。

### API 路由結構

```
app/
  api/
    admin/
      auth/
        login/
          route.ts
        logout/
          route.ts
        verify/
          route.ts
      pets/
        route.ts
        [id]/
          route.ts
        photos/
          route.ts
        import/
          route.ts
        export/
          route.ts
      products/
        route.ts
        [id]/
          route.ts
        import/
          route.ts
        export/
          route.ts
      members/
        route.ts
        [id]/
          route.ts
        import/
          route.ts
        export/
          route.ts
      _lib/
        database.ts
        jwt.ts
        auth.ts
        pet-database.ts
        member-database.ts
        data-import.ts
        data-export.ts
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

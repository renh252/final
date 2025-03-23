# API 結構與規範

> 最後更新時間：2024-05-18
>
> 本文檔描述寵物領養平台 API 的結構、命名規範和使用方法。認證與授權的具體實現細節請參考 [後台管理系統結構文檔](admin-structure.md)。

## 📌 開發規範

開發或修改 API 時，必須遵循以下規範：

1. **路由規範**：所有 API 必須遵循 REST 風格，使用適當的 HTTP 方法
2. **權限控制**：所有後台 API 必須實現權限檢查
3. **錯誤處理**：統一使用標準錯誤格式和狀態碼
4. **資料驗證**：所有請求必須先進行參數驗證
5. **避免修改**：不要修改現有 API 的參數格式和返回值結構
6. **統一風格**：使用下文描述的工具函數和風格
7. **表名一致**：所有 SQL 查詢必須使用正確的資料表名稱，保持與資料庫結構一致
8. **權限格式**：使用 `guard.api(guard.perm('權限名稱')(async (req) => {}))`格式設置 API 路由權限

> ⚠️ **警告**: 未按照規範開發的 API 將無法與前端正確集成。

## 📋 表名映射規範

為保持一致性，API 開發時必須使用以下正確的資料表名稱：

| 正確表名      | 錯誤表名 (禁止使用) |
| ------------- | ------------------- |
| `products`    | `shop_products`     |
| `orders`      | `shop_orders`       |
| `order_items` | `shop_order_items`  |
| `categories`  | `shop_categories`   |
| `promotions`  | `shop_promotions`   |

所有 SQL 查詢必須使用左側列的正確表名。使用錯誤表名會導致數據庫查詢錯誤。

## 重要說明

**注意**: 所有後台 API 都位於 `app/api/admin` 目錄下（標準的 Next.js API 路由結構），而不是 `app/admin/api` 目錄。請確保在開發時使用正確的路徑。

**嚴禁**:

- 不要在 API 路由中直接編寫 SQL 查詢語句
- 不要在 API 路由中包含複雜的業務邏輯
- 不要繞過權限檢查機制
- 不要使用不正確的資料表名稱

## 💯 API 權限檢查標準格式

所有 API 路由必須使用以下標準格式進行權限檢查：

```typescript
// 正確格式
export const GET = guard.api(
  guard.perm('shop:products:read')(async (req: NextRequest) => {
    // API 邏輯
  })
)

// 錯誤格式 - 禁止使用
export const GET = guard(async (req: NextRequest) => {
  // API 邏輯
})
```

權限驗證失敗時，API 會自動返回適當的錯誤響應。

## 📝 API 修復記錄

### 2024-05-18 資料表名稱和權限檢查格式修正

修復了以下 API 路由中的資料表名稱和權限檢查格式問題：

- `app/api/admin/shop/products/route.ts`

  - 將 `shop_products` 改為 `products`
  - 將 `shop_categories` 改為 `categories`
  - 修正權限檢查格式

- `app/api/admin/shop/products/categories/route.ts`

  - 將 `shop_categories` 改為 `categories`
  - 將 `parent_category_id` 改為 `parent_id`
  - 修正權限檢查格式

- `app/api/admin/shop/orders/route.ts`

  - 將 `shop_orders` 改為 `orders`
  - 將 `shop_order_items` 改為 `order_items`
  - 將 `shop_products` 改為 `products`
  - 修正權限檢查格式
  - 增加訂單 ID 生成邏輯

- `app/api/admin/shop/orders/[oid]/route.ts`

  - 將 `shop_orders` 改為 `orders`
  - 將 `shop_order_items` 改為 `order_items`
  - 將 `shop_products` 改為 `products`
  - 修正權限檢查格式

- `app/api/admin/shop/orders/[oid]/status/route.ts`

  - 將 `shop_orders` 改為 `orders`
  - 修正權限檢查格式

- `app/api/admin/shop/route.ts`
  - 將所有表名從 `shop_` 前綴改為標準資料表名稱
  - 改進商店統計查詢
  - 修正權限檢查格式

## 前端 API 工具

所有管理頁面都使用 `fetchApi` 工具函數來處理 API 請求。這個函數位於 `app/admin/_lib/api.ts`，提供以下功能：

1. 自動處理認證 token
2. 統一處理請求頭
3. 統一錯誤處理
4. 支援 JSON 和 FormData 格式的請求體

> **開發規則**:
>
> - 前端必須使用此函數進行 API 調用，不要使用原生 fetch
> - 後端 API 必須遵循與此函數兼容的請求/響應格式

### 使用方式

```typescript
import { fetchApi } from '@/app/admin/_lib/api'

// GET 請求
const response = await fetchApi('/api/admin/members')

// POST 請求
const response = await fetchApi('/api/admin/members', {
  method: 'POST',
  body: JSON.stringify(data),
})

// 上傳文件
const formData = new FormData()
formData.append('file', file)
const response = await fetchApi('/api/admin/members/import', {
  method: 'POST',
  body: formData,
})
```

### 錯誤處理

`fetchApi` 會自動處理常見的錯誤情況：

1. 認證失敗 (401)
2. 權限不足 (403)
3. 請求參數錯誤 (400)
4. 伺服器錯誤 (500)

> **實現要求**:
>
> - API 響應必須使用標準狀態碼
> - 錯誤訊息必須包含在 `message` 字段中
> - 成功響應必須包含在 `data` 字段中

所有錯誤都會拋出異常，並包含詳細的錯誤訊息。

## API 基本結構

API 分為兩個主要部分：

1. 前台 API：提供給用戶使用的接口
2. 後台 API：提供給管理員使用的接口

## 目錄

1. [概述](#概述)
2. [API 路由結構](#api-路由結構)
3. [認證與授權](#認證與授權)
4. [錯誤處理](#錯誤處理)
5. [資料庫交互](#資料庫交互)
6. [檔案上傳與處理](#檔案上傳與處理)
7. [第三方 API 整合](#第三方-api-整合)
8. [API 文檔](#api-文檔)

## 概述

本文檔描述了寵物領養平台的 API 結構。API 使用 Next.js 的 App Router API 路由功能開發，採用 RESTful API 設計風格，並使用 JSON 作為數據交換格式。API 分為前台 API 和後台 API 兩部分，分別用於前台用戶和後台管理員使用。

## API 路由結構

API 路由結構遵循 Next.js 的 App Router API 路由結構，位於 `app/api` 目錄下：

### 前台 API

前台 API 用於前台用戶使用，包括以下路由：

#### 認證 API

- `POST /api/auth/login`：用戶登入
- `POST /api/auth/register`：用戶註冊
- `POST /api/auth/logout`：用戶登出
- `POST /api/auth/refresh`：刷新 Token
- `POST /api/auth/forgot-password`：忘記密碼
- `POST /api/auth/reset-password`：重設密碼
- `GET /api/auth/me`：獲取當前用戶信息

#### 會員 API

- `GET /api/members/profile`：獲取會員資料
- `PUT /api/members/profile`：更新會員資料
- `PUT /api/members/password`：修改密碼
- `GET /api/members/adoptions`：獲取領養歷史
- `GET /api/members/donations`：獲取捐款歷史
- `GET /api/members/favorites`：獲取收藏列表
- `POST /api/members/favorites`：新增收藏
- `DELETE /api/members/favorites/:id`：刪除收藏
- `GET /api/members/notifications`：獲取通知列表
- `PUT /api/members/notifications/:id`：更新通知狀態
- `DELETE /api/members/notifications/:id`：刪除通知
- `GET /api/members/messages`：獲取訊息列表
- `GET /api/members/messages/:id`：獲取訊息詳情
- `POST /api/members/messages`：發送訊息
- `PUT /api/members/messages/:id`：更新訊息狀態
- `DELETE /api/members/messages/:id`：刪除訊息

#### 寵物 API

- `GET /api/pets`：獲取寵物列表
- `GET /api/pets/:id`：獲取寵物詳情
- `GET /api/pets/categories`：獲取寵物分類
- `POST /api/pets/appointments`：預約看寵物 ✅ 已實現
  - 功能：創建新的寵物預約
  - 請求參數：pet_id, user_id, appointment_date, appointment_time, 以及其他表單資料
  - 返回：success, message, 以及預約 ID
- `GET /api/pets/appointments`：獲取用戶預約列表 ✅ 已實現
  - 功能：獲取當前登入用戶的所有預約記錄
  - 請求參數：無(使用 JWT 驗證)
  - 返回：預約資料列表，包含寵物基本資訊
- `PUT /api/pets/appointments/:id`：更新預約狀態 ✅ 已實現
  - 功能：用戶更新預約時間或其他資訊
  - 請求參數：appointment_date, appointment_time 等
  - 返回：success, message
- `DELETE /api/pets/appointments/:id`：取消預約 ✅ 已實現
  - 功能：用戶取消已提交的預約
  - 請求參數：無(通過 URL 參數指定預約 ID)
  - 返回：success, message
- `POST /api/pets/adoptions`：申請領養
- `GET /api/pets/adoptions`：獲取領養申請列表
- `GET /api/pets/adoptions/:id`：獲取領養申請詳情

#### 商城 API

- `GET /api/shop/products`：獲取商品列表
- `GET /api/shop/products/:id`：獲取商品詳情
- `GET /api/shop/categories`：獲取商品分類
- `GET /api/shop/cart`：獲取購物車
- `POST /api/shop/cart`：新增商品到購物車
- `PUT /api/shop/cart/:id`：更新購物車商品數量
- `DELETE /api/shop/cart/:id`：從購物車刪除商品
- `POST /api/shop/checkout`：結帳
- `GET /api/shop/orders`：獲取訂單列表
- `GET /api/shop/orders/:id`：獲取訂單詳情
- `PUT /api/shop/orders/:id/cancel`：取消訂單
- `GET /api/shop/coupons`：獲取優惠券列表
- `POST /api/shop/coupons/validate`：驗證優惠券

#### 論壇 API

- `GET /api/forum/articles`：獲取文章列表
- `GET /api/forum/articles/:id`：獲取文章詳情
- `POST /api/forum/articles`：發布文章
- `PUT /api/forum/articles/:id`：更新文章
- `DELETE /api/forum/articles/:id`：刪除文章
- `GET /api/forum/categories`：獲取文章分類
- `GET /api/forum/comments`：獲取評論列表
- `GET /api/forum/comments/:id`：獲取評論詳情
- `POST /api/forum/comments`：發布評論
- `PUT /api/forum/comments/:id`：更新評論
- `DELETE /api/forum/comments/:id`：刪除評論
- `POST /api/forum/reports`：檢舉文章或評論

#### 捐款 API

> **注意**: 捐款活動管理功能不在當前開發範圍內，相關 API 為文檔描述但未實際實現。

- `POST /api/donations`：捐款
- `GET /api/donations`：獲取捐款列表
- `GET /api/donations/:id`：獲取捐款詳情

#### 支付 API

> **開發狀態說明**:
>
> - 綠界金流 (ECPay): 🔄 正在由協作人員開發中
> - LINE Pay: 📝 待開發項目

- `POST /api/payments/ecpay`：綠界金流支付
- `POST /api/payments/linepay`：LINE Pay 支付
- `GET /api/payments/methods`：獲取支付方式列表
- `POST /api/payments/callback/:provider`：支付回調

### 後台 API

後台 API 用於後台管理員使用，包括以下路由：

#### 認證 API

- `POST /api/admin/auth/login`：管理員登入
- `POST /api/admin/auth/logout`：管理員登出
- `POST /api/admin/auth/refresh`：刷新 Token
- `GET /api/admin/auth/me`：獲取當前管理員信息

#### 會員管理 API

- `GET /api/admin/members`：獲取會員列表
- `GET /api/admin/members/:id`：獲取會員詳情
- `POST /api/admin/members`：新增會員
- `PUT /api/admin/members/:id`：更新會員資料
- `DELETE /api/admin/members/:id`：刪除會員
- `PUT /api/admin/members/:id/status`：更新會員狀態
- `POST /api/admin/members/import`：導入會員資料
- `GET /api/admin/members/export`：導出會員資料

#### 寵物管理 API

- `GET /api/admin/pets`：獲取寵物列表
- `GET /api/admin/pets/:id`：獲取寵物詳情
- `POST /api/admin/pets`：新增寵物
- `PUT /api/admin/pets/:id`：更新寵物資料
- `DELETE /api/admin/pets/:id`：刪除寵物
- `PUT /api/admin/pets/:id/status`：更新寵物狀態
- `POST /api/admin/pets/import`：導入寵物資料
- `GET /api/admin/pets/export`：導出寵物資料
- `GET /api/admin/pets/categories`：獲取寵物分類
- `POST /api/admin/pets/categories`：新增寵物分類
- `PUT /api/admin/pets/categories/:id`：更新寵物分類
- `DELETE /api/admin/pets/categories/:id`：刪除寵物分類
- `GET /api/admin/pets/appointments`：獲取預約列表 ✅ 已實現
  - 功能：管理員獲取所有預約記錄
  - 請求參數：可選的篩選條件
  - 返回：所有預約資料列表
- `PUT /api/admin/pets/appointments/:id`：更新預約狀態 ✅ 已實現
  - 功能：管理員更新預約狀態(核准、拒絕等)
  - 請求參數：status, admin_note 等
  - 返回：success, message
- `DELETE /api/admin/pets/appointments/:id`：刪除預約 ✅ 已實現
  - 功能：管理員刪除預約記錄
  - 請求參數：無(通過 URL 參數指定預約 ID)
  - 返回：success, message
- `GET /api/admin/pets/adoptions`：獲取領養申請列表
- `PUT /api/admin/pets/adoptions/:id`：更新領養申請狀態
- `DELETE /api/admin/pets/adoptions/:id`：刪除領養申請

#### 商城管理 API

- `GET /api/admin/shop/products`：獲取商品列表
- `GET /api/admin/shop/products/:id`：獲取商品詳情
- `POST /api/admin/shop/products`：新增商品
- `PUT /api/admin/shop/products/:id`：更新商品資料
- `DELETE /api/admin/shop/products/:id`：刪除商品
- `PUT /api/admin/shop/products/:id/status`：更新商品狀態
- `POST /api/admin/shop/products/import`：導入商品資料
- `GET /api/admin/shop/products/export`：導出商品資料
- `GET /api/admin/shop/categories`：獲取商品分類
- `POST /api/admin/shop/categories`：新增商品分類
- `PUT /api/admin/shop/categories/:id`：更新商品分類
- `DELETE /api/admin/shop/categories/:id`：刪除商品分類
- `GET /api/admin/shop/orders`：獲取訂單列表
- `GET /api/admin/shop/orders/:id`：獲取訂單詳情
- `PUT /api/admin/shop/orders/:id`：更新訂單狀態
- `DELETE /api/admin/shop/orders/:id`：刪除訂單
- `GET /api/admin/shop/coupons`：獲取優惠券列表
- `GET /api/admin/shop/coupons/:id`：獲取優惠券詳情
- `POST /api/admin/shop/coupons`：新增優惠券
- `PUT /api/admin/shop/coupons/:id`：更新優惠券資料
- `DELETE /api/admin/shop/coupons/:id`：刪除優惠券
- `PUT /api/admin/shop/coupons/:id/status`：更新優惠券狀態

#### 論壇管理 API

- `GET /api/admin/forum/articles`：獲取文章列表
- `GET /api/admin/forum/articles/:id`：獲取文章詳情
- `PUT /api/admin/forum/articles/:id`：更新文章
- `DELETE /api/admin/forum/articles/:id`：刪除文章
- `PUT /api/admin/forum/articles/:id/status`：更新文章狀態
- `GET /api/admin/forum/categories`：獲取文章分類
- `POST /api/admin/forum/categories`：新增文章分類
- `PUT /api/admin/forum/categories/:id`：更新文章分類
- `DELETE /api/admin/forum/categories/:id`：刪除文章分類
- `GET /api/admin/forum/comments`：獲取評論列表
- `GET /api/admin/forum/comments/:id`：獲取評論詳情
- `PUT /api/admin/forum/comments/:id`：更新評論
- `DELETE /api/admin/forum/comments/:id`：刪除評論
- `PUT /api/admin/forum/comments/:id/status`：更新評論狀態
- `GET /api/admin/forum/reports`：獲取檢舉列表
- `GET /api/admin/forum/reports/:id`：獲取檢舉詳情
- `PUT /api/admin/forum/reports/:id`：更新檢舉狀態
- `DELETE /api/admin/forum/reports/:id`：刪除檢舉

#### 金流管理 API

- `GET /api/admin/finance/dashboard`：獲取金流儀表板數據
- `GET /api/admin/finance/transactions`：獲取交易紀錄
- `GET /api/admin/finance/transactions/:id`：獲取交易詳情
- `GET /api/admin/finance/transactions/orders`：獲取商品訂單交易紀錄
- `GET /api/admin/finance/transactions/donations`：獲取捐款紀錄
- `GET /api/admin/finance/payments/methods`：獲取支付方式列表
- `POST /api/admin/finance/payments/methods`：新增支付方式
- `PUT /api/admin/finance/payments/methods/:id`：更新支付方式
- `DELETE /api/admin/finance/payments/methods/:id`：刪除支付方式
- `PUT /api/admin/finance/payments/methods/:id/status`：更新支付方式狀態
- `GET /api/admin/finance/payments/providers`：獲取金流供應商列表
- `POST /api/admin/finance/payments/providers`：新增金流供應商
- `PUT /api/admin/finance/payments/providers/:id`：更新金流供應商
- `DELETE /api/admin/finance/payments/providers/:id`：刪除金流供應商
- `PUT /api/admin/finance/payments/providers/:id/status`：更新金流供應商狀態
- `GET /api/admin/finance/refunds`：獲取退款列表
- `GET /api/admin/finance/refunds/:id`：獲取退款詳情
- `POST /api/admin/finance/refunds`：新增退款
- `PUT /api/admin/finance/refunds/:id`：更新退款狀態
- `GET /api/admin/finance/reports/revenue`：獲取營收報表
- `GET /api/admin/finance/reports/donations`：獲取捐款報表
- `GET /api/admin/finance/reports/settlements`：獲取結算報表

#### 系統設定 API

- `GET /api/admin/settings/roles`：獲取角色列表
- `GET /api/admin/settings/roles/:id`：獲取角色詳情
- `POST /api/admin/settings/roles`：新增角色
- `PUT /api/admin/settings/roles/:id`：更新角色
- `DELETE /api/admin/settings/roles/:id`：刪除角色
- `GET /api/admin/settings/system`：獲取系統參數
- `PUT /api/admin/settings/system`：更新系統參數
- `GET /api/admin/settings/logs`：獲取系統日誌

## 認證與授權

### 認證機制

後台管理系統使用 JWT (JSON Web Token) 進行認證，主要包含以下部分：

1. **Token 存儲**：

   - 使用 `js-cookie` 存儲 token 在 Cookie 中
   - Cookie 名稱：`admin_token`
   - Cookie 配置：
     ```typescript
     {
       expires: 1, // 1 天
       path: '/',
       secure: process.env.NODE_ENV === 'production'
     }
     ```

2. **認證流程**：

   - 登入：`POST /api/admin/auth/login`
   - 登出：`POST /api/admin/auth/logout`
   - 驗證：`GET /api/admin/auth/verify`
   - 獲取當前管理員：`GET /api/admin/auth/me`

3. **Token 結構**：

   ```typescript
   interface AdminPayload {
     id: number
     account: string
     privileges: string
     role?: string
   }
   ```

4. **權限驗證**：
   - 使用 `guard.api()` 包裝 API 路由
   - 使用 `withAuth()` HOC 包裝頁面組件
   - 權限檢查：`auth.can(authData, PERMISSION)`

### 授權管理

1. **權限層級**：

   - 超級管理員：`privileges === '111'`
   - 一般管理員：根據 `privileges` 中的權限代碼

2. **權限檢查工具**：

   ```typescript
   // API 路由保護
   export const guard = {
     api: (handler: ApiHandler) => async (req: NextRequest) => {
       const authData = await auth.fromRequest(req)
       if (!authData) return unauthorized()
       return handler(req, authData)
     },
   }

   // 頁面組件保護
   export function withAuth<P>(
     Component: React.ComponentType<P>,
     requiredPerm?: string
   ) {
     return function AuthComponent(props: P) {
       const { auth, loading } = useAuth(requiredPerm)
       if (loading) return <LoadingSpinner />
       if (!auth) return null
       return <Component {...props} auth={auth} />
     }
   }
   ```

3. **錯誤處理**：
   - 401 未授權：Token 無效或過期
   - 403 權限不足：無權訪問特定資源
   - 重定向到登入頁面：`/admin/login`

### 最佳實踐

1. **API 請求**：

   ```typescript
   // 使用 fetchApi 工具函數
   const response = await fetchApi('/api/admin/members', {
     headers: {
       Authorization: `Bearer ${Cookies.get('admin_token')}`,
     },
   })
   ```

2. **權限檢查**：

   ```typescript
   // 在 API 路由中
   export const GET = guard.api(
     guard.perm('shop:products:read')(async (req: NextRequest) => {
       // API 邏輯
     })
   )

   // 在頁面組件中
   export default withAuth(MembersPage, PERMISSIONS.MEMBERS.READ)
   ```

3. **錯誤處理**：
   ```typescript
   try {
     const response = await fetchApi('/api/admin/members')
     if (!response.success) {
       throw new Error(response.message)
     }
     // ... 處理成功響應
   } catch (error) {
     // ... 處理錯誤
   }
   ```

## 錯誤處理

API 使用統一的錯誤處理機制，包括以下錯誤類型：

### 錯誤類型

- `400 Bad Request`：請求參數錯誤
- `401 Unauthorized`：未認證或認證失敗
- `403 Forbidden`：無權限訪問
- `404 Not Found`：資源不存在
- `409 Conflict`：資源衝突
- `422 Unprocessable Entity`：請求格式正確，但語義錯誤
- `500 Internal Server Error`：伺服器內部錯誤

### 錯誤響應格式

錯誤響應的 JSON 格式如下：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息",
    "details": {
      "field1": "錯誤詳情1",
      "field2": "錯誤詳情2"
    }
  }
}
```

### 錯誤處理相關文件

錯誤處理相關的程式碼位於以下文件中：

- `app/api/_lib/error.ts`：錯誤處理相關函數

## 資料庫交互

API 通過資料庫交互函數與資料庫進行交互，主要使用 MySQL 資料庫。

### 資料庫連接

資料庫連接使用連接池進行管理，連接池配置位於 `app/api/_lib/database.ts` 文件中。

### 資料庫查詢

資料庫查詢使用 `executeQuery` 函數進行，該函數位於 `app/api/_lib/database.ts` 文件中。

### 資料庫交互相關文件

資料庫交互相關的程式碼位於以下文件中：

- `app/api/_lib/database.ts`：資料庫連接和查詢函數
- `app/api/admin/_lib/database.ts`：後台資料庫連接和查詢函數
- `app/api/_lib/member-database.ts`：會員相關資料庫函數
- `app/api/_lib/pet-database.ts`：寵物相關資料庫函數

## 檔案上傳與處理

API 支持檔案上傳與處理，包括圖片上傳、檔案上傳等功能。

### 檔案上傳

檔案上傳使用 `formidable` 庫進行處理，上傳的檔案存儲在 `public/uploads` 目錄下。

### 圖片處理

圖片處理使用 `sharp` 庫進行處理，包括圖片裁剪、縮放、壓縮等功能。

### 檔案上傳與處理相關文件

檔案上傳與處理相關的程式碼位於以下文件中：

- `app/api/_lib/upload.ts`：檔案上傳相關函數
- `app/api/_lib/image.ts`：圖片處理相關函數

## 第三方 API 整合

API 整合了多個第三方 API，包括支付 API、社群登入 API 等。

### 支付 API

支付 API 整合了以下第三方支付服務：

- 綠界金流（ECPay）
- LINE Pay

### 社群登入 API

社群登入 API 整合了以下第三方社群服務：

- Google
- Facebook
- LINE

### 第三方 API 整合相關文件

第三方 API 整合相關的程式碼位於以下文件中：

- `app/api/_lib/payment/ecpay.ts`：綠界金流相關函數
- `app/api/_lib/payment/linepay.ts`：LINE Pay 相關函數
- `app/api/_lib/social/google.ts`：Google 登入相關函數
- `app/api/_lib/social/facebook.ts`：Facebook 登入相關函數
- `app/api/_lib/social/line.ts`：LINE 登入相關函數

## API 文檔

API 文檔使用 Swagger UI 進行展示，可以通過 `/api/docs` 路由訪問。

### API 文檔生成

API 文檔使用 `swagger-jsdoc` 和 `swagger-ui-react` 庫進行生成，API 文檔配置位於 `app/api/docs/route.ts` 文件中。

### API 文檔相關文件

API 文檔相關的程式碼位於以下文件中：

- `app/api/docs/route.ts`：API 文檔路由
- `app/api/docs/swagger.json`：Swagger 配置文件

## 商品資料結構

### 商品 (Product)

```typescript
interface Product {
  product_id: number
  product_name: string
  product_description: string | null
  category_id: number | null
  price: number
  stock_quantity: number
  image_url: string | null
  product_status: '上架' | '下架' // 資料庫儲存值
  status: 'active' | 'inactive' // 前端顯示值
  is_deleted: 0 | 1
  created_at: string
  updated_at: string
}
```

### 商品變體 (ProductVariant)

```typescript
interface ProductVariant {
  variant_id: number
  product_id: number
  variant_name: string
  price: number
  stock_quantity: number
  created_at: string
  updated_at: string
}
```

### 注意事項

1. 商品狀態處理：

   - 資料庫中 `product_status` 儲存為 '上架' 或 '下架'
   - API 回應中會增加 `status` 欄位，將 '上架' 映射為 'active'，'下架' 映射為 'inactive'
   - 前端發送請求時使用 'active' 或 'inactive'，後端會自動轉換

2. 刪除處理：
   - 使用 `is_deleted` 欄位實現軟刪除功能，值為 1 表示已刪除
   - 預設 API 只返回 `is_deleted = 0` 的記錄
   - 需要查詢刪除的商品時，使用 `include_deleted=true` 參數

## 商品管理 API

### 獲取商品列表

```
GET /api/admin/shop/products
```

#### 請求參數

| 參數名          | 類型    | 必填 | 說明                                        |
| --------------- | ------- | ---- | ------------------------------------------- |
| page            | number  | 否   | 頁碼，默認為 1                              |
| limit           | number  | 否   | 每頁記錄數，默認為 10                       |
| sort            | string  | 否   | 排序字段，如 'product_id'                   |
| order           | string  | 否   | 排序方向，'asc' 或 'desc'，默認為 'desc'    |
| search          | string  | 否   | 搜索關鍵字，搜索 product_name 和 product_id |
| category_id     | number  | 否   | 篩選特定分類的商品                          |
| product_status  | string  | 否   | 篩選狀態，'active' 或 'inactive'            |
| include_deleted | boolean | 否   | 是否包含已刪除商品，默認為 false            |

#### 響應範例

```json
{
  "products": [
    {
      "product_id": 1,
      "product_name": "寵物項圈",
      "product_description": "適合小型犬的項圈",
      "category_id": 2,
      "category_name": "寵物用品",
      "price": 350,
      "stock_quantity": 100,
      "main_image": "/images/products/collar.jpg",
      "product_status": "上架",
      "status": "active",
      "is_deleted": 0,
      "created_at": "2023-05-15 10:30:00",
      "updated_at": "2023-05-16 14:20:00"
    }
    // 更多商品...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 獲取商品詳情

```
GET /api/admin/shop/products/:product_id
```

#### 請求參數

| 參數名     | 類型   | 必填 | 說明    |
| ---------- | ------ | ---- | ------- |
| product_id | number | 是   | 商品 ID |

#### 響應範例

```json
{
  "product": {
    "product_id": 1,
    "product_name": "寵物項圈",
    "product_description": "適合小型犬的項圈",
    "category_id": 2,
    "category_name": "寵物用品",
    "price": 350,
    "stock_quantity": 100,
    "main_image": "/images/products/collar.jpg",
    "product_status": "上架",
    "status": "active",
    "is_deleted": 0,
    "created_at": "2023-05-15 10:30:00",
    "updated_at": "2023-05-16 14:20:00",
    "variants": [
      {
        "variant_id": 1,
        "product_id": 1,
        "variant_name": "紅色",
        "price": 350,
        "stock_quantity": 30
      },
      {
        "variant_id": 2,
        "product_id": 1,
        "variant_name": "藍色",
        "price": 350,
        "stock_quantity": 40
      },
      {
        "variant_id": 3,
        "product_id": 1,
        "variant_name": "黑色",
        "price": 380,
        "stock_quantity": 30
      }
    ]
  }
}
```

### 新增商品

```
POST /api/admin/shop/products
```

#### 請求內容

```json
{
  "product_name": "寵物食盆",
  "product_description": "耐用不鏽鋼寵物食盆",
  "product_category": 2,
  "product_price": 280,
  "product_stock": 50,
  "product_status": "active",
  "product_image": "/images/products/bowl.jpg",
  "variants": [
    {
      "variant_name": "小型",
      "variant_price": 280,
      "variant_stock": 20
    },
    {
      "variant_name": "中型",
      "variant_price": 350,
      "variant_stock": 15
    },
    {
      "variant_name": "大型",
      "variant_price": 450,
      "variant_stock": 15
    }
  ]
}
```

#### 響應範例

```json
{
  "message": "商品添加成功",
  "product": {
    "product_id": 46,
    "product_name": "寵物食盆",
    "product_description": "耐用不鏽鋼寵物食盆",
    "category_id": 2,
    "price": 280,
    "stock_quantity": 50,
    "image_url": "/images/products/bowl.jpg",
    "product_status": "上架",
    "status": "active",
    "is_deleted": 0,
    "created_at": "2023-06-01 09:15:00",
    "updated_at": "2023-06-01 09:15:00"
  }
}
```

### 更新商品

```
PUT /api/admin/shop/products/:product_id
```

#### 請求參數

| 參數名     | 類型   | 必填 | 說明    |
| ---------- | ------ | ---- | ------- |
| product_id | number | 是   | 商品 ID |

#### 請求內容

```json
{
  "product_name": "優質寵物食盆",
  "product_description": "升級版耐用不鏽鋼寵物食盆",
  "product_category": 2,
  "product_price": 300,
  "product_stock": 60,
  "product_status": "active",
  "product_image": "/images/products/bowl-premium.jpg",
  "variants": [
    {
      "variant_id": 10,
      "variant_name": "小型",
      "variant_price": 300,
      "variant_stock": 25
    },
    {
      "variant_name": "豪華版",
      "variant_price": 500,
      "variant_stock": 10
    }
  ]
}
```

#### 響應範例

```json
{
  "message": "商品更新成功",
  "product": {
    "product_id": 46,
    "product_name": "優質寵物食盆",
    "product_description": "升級版耐用不鏽鋼寵物食盆",
    "category_id": 2,
    "price": 300,
    "stock_quantity": 60,
    "image_url": "/images/products/bowl-premium.jpg",
    "product_status": "上架",
    "status": "active",
    "is_deleted": 0,
    "created_at": "2023-06-01 09:15:00",
    "updated_at": "2023-06-01 10:30:00"
  }
}
```

### 刪除商品 (軟刪除)

```
DELETE /api/admin/shop/products/:product_id
```

#### 請求參數

| 參數名     | 類型   | 必填 | 說明    |
| ---------- | ------ | ---- | ------- |
| product_id | number | 是   | 商品 ID |

#### 響應範例

```json
{
  "message": "商品刪除成功"
}
```

### 批量刪除商品

```
POST /api/admin/shop/products/batch-delete
```

#### 請求內容

```json
{
  "product_ids": [45, 46, 47]
}
```

## 系統資訊 API

```
GET /api/admin/db-info
```

- 功能：獲取資料庫結構信息
- 權限要求：需要管理員權限
- 返回：資料庫中所有表格的列表

## 資料庫表格結構

系統包含以下資料表：

1. `bank_transfer_details` - 銀行轉帳詳情
2. `bans` - 封禁記錄
3. `bookmarks` - 收藏記錄
4. `categories` - 分類資料
5. `comments` - 評論資料
6. `donations` - 捐款記錄
7. `expenses` - 支出記錄
8. `follows` - 追蹤關係
9. `manager` - 管理員資料
10. `orders` - 訂單主表
11. `order_items` - 訂單項目
12. `pets` - 寵物資料
13. `pets_like` - 寵物按讚記錄
14. `pets_recent_activities` - 寵物近期活動
15. `pet_appointment` - 寵物預約
16. `pet_store` - 寵物商店
17. `pet_trait` - 寵物特徵
18. `pet_trait_list` - 寵物特徵列表
19. `posts` - 貼文
20. `posts_likes` - 貼文按讚
21. `products` - 商品
22. `product_reviews` - 商品評價
23. `product_variants` - 商品變體
24. `promotions` - 促銷活動
25. `promotion_products` - 促銷商品
26. `receipts` - 收據
27. `refunds` - 退款
28. `reports` - 檢舉
29. `return_order` - 退貨訂單
30. `users` - 用戶資料
31. `user_sessions` - 用戶會話

## 權限系統結構

系統使用以下權限結構：

```typescript
const PERMISSIONS = {
  MEMBERS: {
    READ: 'members:read',
    WRITE: 'members:write',
    DELETE: 'members:delete',
  },
  PETS: {
    READ: 'pets:read',
    WRITE: 'pets:write',
    DELETE: 'pets:delete',
  },
  SHOP: {
    READ: 'shop:read',
    WRITE: 'shop:write',
    DELETE: 'shop:delete',
    PRODUCTS: {
      READ: 'shop:products:read',
      WRITE: 'shop:products:write',
      DELETE: 'shop:products:delete',
    },
    ORDERS: {
      READ: 'shop:orders:read',
      WRITE: 'shop:orders:write',
      DELETE: 'shop:orders:delete',
    },
  },
  FORUM: {
    READ: 'forum:read',
    WRITE: 'forum:write',
    DELETE: 'forum:delete',
    REPORTS: {
      READ: 'forum:reports:read',
      WRITE: 'forum:reports:write',
    },
  },
  FINANCE: {
    READ: 'finance:read',
    WRITE: 'finance:write',
    REPORTS: {
      READ: 'finance:reports:read',
    },
  },
  SETTINGS: {
    READ: 'settings:read',
    WRITE: 'settings:write',
    ROLES: {
      READ: 'settings:roles:read',
      WRITE: 'settings:roles:write',
      DELETE: 'settings:roles:delete',
    },
    LOGS: {
      READ: 'settings:logs:read',
    },
  },
}
```

## 系統日誌 API

```
GET /api/admin/settings/logs
```

- 功能：獲取系統操作日誌
- 參數：
  - filter: 過濾條件 (all/login/system/data)
- 返回：最近 100 條日誌記錄
- 返回格式：
  ```json
  {
    "logs": [
      {
        "id": number,
        "admin_id": number,
        "admin_name": string,
        "action": string,
        "details": string,
        "ip_address": string,
        "created_at": string
      }
    ]
  }
  ```

## 捐款 API

```
GET /api/donate
```

- 功能：獲取捐款案例列表
- 返回：包含案例標題、內容和相關圖片的列表
- 資料格式：
  ```json
  {
    "status": "success",
    "data": {
      "cases": [
        {
          "id": number,
          "title": string,
          "content": string,
          "images": string[]
        }
      ]
    }
  }
  ```

## 結帳 API

```
POST /api/shop/checkout
```

- 功能：處理綠界物流相關的結帳流程
- 包含 CreateCMV 加密機制
- 使用綠界測試環境 API
- API URL: https://logistics-stage.ecpay.com.tw/Helper/GetStoreList

## 商品分類 API

```
GET /api/admin/shop/products/categories
```

- 功能：獲取商品分類層級結構
- 返回：包含父分類信息的分類列表
- 權限要求：shop:categories:read

```
GET /api/admin/shop/categories/:cid
```

- 功能：獲取特定分類詳情
- 返回：分類信息及該分類下的商品數量
- 權限要求：shop:categories:read

## 訂單管理 API

```
GET /api/admin/shop/orders/:oid
```

- 功能：獲取訂單詳細信息
- 返回：
  - 訂單基本信息
  - 用戶信息
  - 訂單項目列表（包含商品信息）
- 權限要求：shop:orders:read

## 待確認和編輯的 API 文檔

以下 API 需要進一步確認實現細節：

### 商品管理 API [待確認]

```
GET /api/admin/shop/products
```

- 功能：獲取商品列表
- 參數：
  - search: 搜索關鍵字
  - page: 頁碼
  - limit: 每頁數量
  - category: 分類 ID
- 權限要求：shop:products:read

```
POST /api/admin/shop/products
```

- 功能：創建新商品
- 權限要求：shop:products:write
- TODO: 需要確認商品創建的具體欄位和驗證規則

### 寵物管理 API [待確認]

```
GET /api/admin/pets
```

- 功能：獲取寵物列表
- 參數：
  - search: 搜索關鍵字
  - page: 頁碼
  - limit: 每頁數量
  - status: 寵物狀態
- 權限要求：pets:read

```
POST /api/admin/pets
```

- 功能：新增寵物
- 權限要求：pets:write
- TODO: 需要確認寵物創建的具體欄位和驗證規則

### 論壇管理 API [待確認]

```
GET /api/admin/forum
```

- 功能：獲取論壇文章列表
- 參數：
  - search: 搜索關鍵字
  - page: 頁碼
  - limit: 每頁數量
  - status: 文章狀態
- 權限要求：forum:read

```
PUT /api/admin/forum
```

- 功能：更新文章狀態
- 權限要求：forum:write
- TODO: 需要確認文章狀態更新的具體參數

### 金流管理 API [待確認]

```
GET /api/admin/finance
```

- 功能：獲取金流交易列表
- 參數：
  - search: 搜索關鍵字
  - page: 頁碼
  - limit: 每頁數量
  - type: 交易類型
  - startDate: 開始日期
  - endDate: 結束日期
- 權限要求：finance:read
- TODO: 需要確認交易類型的具體定義和金額計算邏輯

注意：以上 API 的具體實現細節需要與現有的工具和業務邏輯進行核對，確保與系統其他部分的一致性。

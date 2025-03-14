# API 結構與規範

> 最後更新時間：2024-03-14
>
> 本文檔描述寵物領養平台 API 的結構、命名規範和使用方法。認證與授權的具體實現細節請參考 [後台管理系統結構文檔](admin-structure.md)。

## 重要說明

**注意**: 所有後台 API 都位於 `app/api/admin` 目錄下（標準的 Next.js API 路由結構），而不是 `app/admin/api` 目錄。請確保在開發時使用正確的路徑。

## 前端 API 工具

所有管理頁面都使用 `fetchApi` 工具函數來處理 API 請求。這個函數位於 `app/admin/_lib/api.ts`，提供以下功能：

1. 自動處理認證 token
2. 統一處理請求頭
3. 統一錯誤處理
4. 支援 JSON 和 FormData 格式的請求體

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
- `POST /api/pets/appointments`：預約看寵物
- `GET /api/pets/appointments`：獲取預約列表
- `PUT /api/pets/appointments/:id`：更新預約狀態
- `DELETE /api/pets/appointments/:id`：取消預約
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

- `GET /api/donations/campaigns`：獲取捐款活動列表
- `GET /api/donations/campaigns/:id`：獲取捐款活動詳情
- `POST /api/donations`：捐款
- `GET /api/donations`：獲取捐款列表
- `GET /api/donations/:id`：獲取捐款詳情

#### 支付 API

- `POST /api/payments/ecpay`：綠界金流支付
- `POST /api/payments/linepay`：LINE Pay 支付
- `POST /api/payments/newebpay`：藍新金流支付
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
- `GET /api/admin/pets/appointments`：獲取預約列表
- `PUT /api/admin/pets/appointments/:id`：更新預約狀態
- `DELETE /api/admin/pets/appointments/:id`：刪除預約
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
   export const GET = guard.api(async (req: NextRequest, authData) => {
     if (!auth.can(authData, PERMISSIONS.MEMBERS.READ)) {
       return forbidden()
     }
     // ... 處理請求
   })

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
- 藍新金流（NewebPay）

### 社群登入 API

社群登入 API 整合了以下第三方社群服務：

- Google
- Facebook
- LINE

### 第三方 API 整合相關文件

第三方 API 整合相關的程式碼位於以下文件中：

- `app/api/_lib/payment/ecpay.ts`：綠界金流相關函數
- `app/api/_lib/payment/linepay.ts`：LINE Pay 相關函數
- `app/api/_lib/payment/newebpay.ts`：藍新金流相關函數
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
GET /api/admin/products
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
GET /api/admin/products/:product_id
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
POST /api/admin/products
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
PUT /api/admin/products/:product_id
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
DELETE /api/admin/products/:product_id
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
POST /api/admin/products/batch-delete
```

#### 請求內容

```json
{
  "product_ids": [45, 46, 47]
}
```

#### 響應範例

```json
{
  "message": "批量刪除完成",
  "deleted": 3,
  "failed": 0
}
```

### 更新商品狀態

```
PUT /api/admin/products/:product_id/status
```

#### 請求參數

| 參數名     | 類型   | 必填 | 說明    |
| ---------- | ------ | ---- | ------- |
| product_id | number | 是   | 商品 ID |

#### 請求內容

```json
{
  "status": "inactive"
}
```

#### 響應範例

```json
{
  "message": "商品狀態更新成功",
  "product": {
    "product_id": 46,
    "product_status": "下架",
    "status": "inactive"
  }
}
```

### 導入商品數據

```
POST /api/admin/products/import
```

#### 請求內容

使用 `multipart/form-data` 格式，包含一個名為 `file` 的文件字段，文件可以是 CSV 或 JSON 格式。

#### 響應範例

```json
{
  "message": "成功導入 15 個商品，失敗 2 個",
  "results": {
    "total": 17,
    "success": 15,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "error": "商品名稱不能為空"
      },
      {
        "row": 12,
        "error": "商品價格必須是有效數字"
      }
    ]
  }
}
```

### 導出商品數據

```
GET /api/admin/products/export
```

#### 請求參數

| 參數名          | 類型    | 必填 | 說明                                  |
| --------------- | ------- | ---- | ------------------------------------- |
| format          | string  | 否   | 導出格式，'csv' 或 'json'，默認 'csv' |
| include_deleted | boolean | 否   | 是否包含已刪除商品，默認為 false      |

#### 響應

文件下載，文件類型取決於請求的 format 參數。

### 訂單 API 響應格式

#### GET /api/admin/shop/orders/:id

```typescript
interface OrderResponse {
  success: boolean
  order: {
    order_id: string
    user_id: number
    order_status: '待出貨' | '已出貨' | '已完成' | '已取消'
    payment_method: '信用卡' | 'LINE Pay' | '貨到付款'
    payment_status: '未付款' | '已付款' | '已退款'
    recipient_name: string
    recipient_email: string
    recipient_phone: string
    shipping_address: string
    note?: string
    created_at: string
    updated_at: string
    items: Array<{
      order_item_id: number
      product_id: number
      product_name: string
      product_image: string
      variant?: string
      price: number
      quantity: number
    }>
    shipping?: {
      carrier: string
      tracking_number: string
      shipped_date: string
      estimated_delivery: string
    }
    messages: Array<{
      id: number
      admin_name: string
      content: string
      created_at: string
    }>
    timeline: Array<{
      id: number
      status: string
      admin_name: string
      note?: string
      created_at: string
    }>
  }
}
```

#### 訂單總金額計算

訂單總金額是根據訂單項目（items）計算得出：

```typescript
const calculateTotalPrice = (items: OrderItem[]): number => {
  if (!items || items.length === 0) return 0
  return items.reduce((sum, item) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0)
    return sum + itemTotal
  }, 0)
}
```

計算邏輯：

1. 每個訂單項目的金額 = 商品單價 × 購買數量
2. 訂單總金額 = 所有訂單項目的金額總和

注意事項：

1. 訂單總金額不包含運費
2. 優惠券折扣應在計算總金額後再進行扣除
3. 所有金額計算都應考慮到可能的 undefined 值，使用空值合併運算符（??）或邏輯或運算符（||）處理

#### 預設值處理

所有 API 響應中的陣列類型欄位都應有預設值：

```typescript
interface OrderResponse {
  success: boolean
  order: {
    // ... 其他欄位 ...
    items: OrderItem[] // 預設值：[]
    shipping?: ShippingInfo // 預設值：{}
    messages: Message[] // 預設值：[]
    timeline: Timeline[] // 預設值：[]
  }
}
```

前端處理時應確保：

```typescript
const {
  items = [],
  shipping = {},
  messages = [],
  timeline = [],
} = response.order
```

這樣可以避免在處理 undefined 或 null 值時出現錯誤。

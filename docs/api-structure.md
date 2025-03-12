# API 結構文檔

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

API 使用 JWT（JSON Web Token）進行認證和授權，包括以下機制：

### 認證流程

1. 用戶登入：用戶提供帳號和密碼，API 驗證後返回 Access Token 和 Refresh Token。
2. 請求驗證：用戶在請求頭中加入 `Authorization: Bearer {Access Token}` 進行身份驗證。
3. Token 刷新：Access Token 過期後，用戶使用 Refresh Token 獲取新的 Access Token。
4. 用戶登出：用戶登出時，API 將 Refresh Token 加入黑名單，使其失效。

### 授權機制

API 使用基於角色的訪問控制（RBAC）進行授權，包括以下角色：

- 訪客：未登入的用戶，只能訪問公開 API。
- 會員：已登入的用戶，可以訪問會員 API。
- 管理員：後台管理員，可以訪問後台 API。
- 超級管理員：最高權限管理員，可以訪問所有 API。

### 認證與授權相關文件

認證與授權相關的程式碼位於以下文件中：

- `app/api/_lib/auth.ts`：認證相關函數
- `app/api/_lib/jwt.ts`：JWT 相關函數
- `app/api/admin/_lib/auth.ts`：後台認證相關函數

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

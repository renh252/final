# 用戶身份驗證實現指南

> 本文檔總結了關於用戶身份驗證系統的實現經驗和最佳實踐。

## 1. 身份驗證系統架構

### 1.1 架構概述

寵物領養平台的身份驗證系統主要包含以下元件：

```
用戶身份驗證流程
┌─────────────────┐         ┌─────────────────┐         ┌────────────────┐
│ 登入頁面/API     │ ──────► │ JWT Token 生成  │ ──────► │ Cookie 存儲    │
└─────────────────┘         └─────────────────┘         └────────────────┘
         │                                                       │
         │                                                       │
         ▼                                                       ▼
┌─────────────────┐                                    ┌────────────────┐
│ 資料庫用戶驗證  │ ◄───────────────────────────────────┤ API 接口驗證    │
└─────────────────┘                                    └────────────────┘
```

### 1.2 檔案結構

```
app/
├── api/
│   ├── _lib/
│   │   ├── auth.ts         # 認證核心邏輯
│   │   ├── db.ts           # 資料庫連接
│   │   └── jwt.ts          # JWT 工具
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts    # 登入 API
│   │   ├── me/
│   │   │   └── route.ts    # 用戶資料 API
│   │   └── verify/
│   │       └── route.ts    # 驗證 API
```

## 2. 資料庫用戶表結構

### 2.1 users 表結構

用戶表使用以下欄位:

| 欄位名稱        | 類型         | 說明                          |
| --------------- | ------------ | ----------------------------- |
| user_id         | INT          | 用戶 ID (主鍵)                |
| user_email      | VARCHAR(255) | 用戶電子郵件 (唯一)           |
| user_password   | VARCHAR(255) | 用戶密碼 (可能是明碼或哈希)   |
| user_name       | VARCHAR(50)  | 用戶名稱                      |
| user_number     | VARCHAR(20)  | 用戶電話號碼                  |
| user_address    | TEXT         | 用戶地址                      |
| user_birthday   | DATE         | 用戶生日                      |
| user_level      | VARCHAR(20)  | 用戶等級/角色                 |
| profile_picture | VARCHAR(255) | 頭像圖片路徑                  |
| user_status     | VARCHAR(10)  | 用戶狀態 (正常、禁言、停用等) |

> **注意**: 用戶表中不包含 `created_at` 或 `updated_at` 等時間戳記欄位。如需記錄用戶登入時間，應考慮在資料庫中添加相應欄位。

## 3. 身份驗證實現細節

### 3.1 登入流程 (app/api/auth/login/route.ts)

```typescript
// 登入 API 流程
export async function POST(request: NextRequest) {
  // 1. 從請求中獲取用戶認證資訊
  const { email, password } = await request.json()

  // 2. 驗證必要欄位
  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: '請輸入必要欄位' },
      { status: 400 }
    )
  }

  // 3. 在資料庫中查詢用戶
  const [users, error] = await db.query(
    `
    SELECT * FROM users 
    WHERE user_email = ? AND (user_status != '停用' OR user_status IS NULL)`,
    [email]
  )

  // 4. 驗證密碼 (支援明碼和哈希密碼)
  // 5. 生成JWT令牌並設置cookie
  // 6. 返回用戶資訊 (不含敏感資料)
}
```

### 3.2 密碼驗證

系統支援兩種密碼驗證模式:

1. **哈希密碼驗證**: 使用 bcrypt 進行密碼驗證

   ```typescript
   // 如果是bcrypt哈希密碼
   if (
     user.user_password.startsWith('$2y$') ||
     user.user_password.startsWith('$2a$') ||
     user.user_password.startsWith('$2b$')
   ) {
     // 兼容PHP生成的哈希
     let compatibleHash = user.user_password
     if (user.user_password.startsWith('$2y$')) {
       compatibleHash = user.user_password.replace('$2y$', '$2a$')
     }

     isPasswordValid = await bcrypt.compare(password, compatibleHash)
   }
   ```

2. **明碼密碼驗證**: 直接比較
   ```typescript
   // 如果是明碼密碼，直接比較
   isPasswordValid = password === user.user_password
   ```

### 3.3 用戶狀態處理

系統根據用戶狀態決定操作權限:

- **停用**: 不允許登入系統
- **禁言**: 可以登入，但可能限制部分功能（如發表評論）
- **正常/NULL**: 無限制

查詢條件: `WHERE ... AND (user_status != '停用' OR user_status IS NULL)`

### 3.4 令牌生成與驗證 (app/api/\_lib/jwt.ts)

使用 jose 庫處理 JWT 令牌:

```typescript
// 生成令牌
export function generateToken(payload: any): string {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// 驗證令牌
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('JWT驗證失敗:', error)
    return null
  }
}
```

## 4. 認證中間件 (app/api/\_lib/auth.ts)

### 4.1 Auth 類

核心認證類實現了以下功能:

1. **從請求中獲取令牌**: 支援 Cookie 和 Authorization 標頭
2. **令牌驗證**: 檢查令牌有效性
3. **用戶驗證**: 根據令牌中的用戶 ID 從資料庫查詢用戶
4. **權限檢查**: 檢查用戶是否擁有特定權限

```typescript
class Auth {
  async fromRequest(req: NextRequest): Promise<User | null> {
    // 從Cookie或請求標頭獲取令牌
    // 驗證令牌
    // 從資料庫中查詢用戶
  }

  async verify(userId: number): Promise<User | null> {
    // 在資料庫中查詢用戶
    // 檢查用戶狀態
  }

  can(user: User | null, action: string): boolean {
    // 根據用戶角色和操作類型檢查權限
  }
}
```

## 5. 常見問題與解決方案

### 5.1 登入失敗: "電子郵件或密碼錯誤"

**可能原因**:

1. 用戶不存在或電子郵件錯誤
2. 密碼不匹配
3. 用戶狀態為"停用"

**解決方法**:

1. 檢查數據庫中是否存在該郵箱
2. 確認密碼格式與存儲方式(明碼或哈希)匹配
3. 檢查用戶狀態是否允許登入

### 5.2 密碼驗證失敗

**哈希密碼兼容性問題**:

- PHP 生成的 bcrypt 哈希($2y$)與 Node.js 的 bcrypt($2a$或$2b$)不完全兼容
- 解決方法: 將$2y$替換為$2a$後再進行密碼驗證

### 5.3 用戶狀態處理

**問題**: 不同狀態的用戶需要不同的權限控制
**解決方法**:

1. 查詢條件使用 `(user_status != '停用' OR user_status IS NULL)` 來過濾用戶
2. 將用戶狀態包含在 JWT 令牌和 API 返回中，供前端根據狀態實施不同限制

### 5.4 資料庫欄位不存在錯誤

**問題**: 嘗試更新不存在的資料庫欄位（如`updated_at`）導致 SQL 錯誤
**錯誤訊息**: `Unknown column 'updated_at' in 'field list'`

**解決方法**:

1. 移除嘗試更新不存在欄位的代碼
2. 在使用欄位前先檢查資料庫結構
3. 若需記錄登入時間，應先在資料庫中添加相應欄位，如:
   ```sql
   ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL;
   ```

## 6. 安全性考量

1. **密碼存儲**: 應優先使用 bcrypt 哈希而非明碼
2. **令牌安全**: 使用 httpOnly 和 secure 選項保護 Cookie
3. **SQL 注入防護**: 使用參數化查詢避免 SQL 注入
4. **錯誤訊息**: 不應透露具體的認證失敗原因，統一使用通用錯誤訊息

## 7. 最佳實踐

1. **令牌管理**: 設置合理的過期時間(例如 7 天)
2. **密碼安全**: 在註冊和修改密碼時使用 bcrypt 進行哈希
3. **狀態檢查**: 在每個需要認證的 API 中檢查用戶狀態
4. **錯誤處理**: 妥善記錄錯誤但不向前端透露敏感資訊
5. **用戶資訊**: 返回給前端的用戶資訊中不應包含密碼等敏感欄位

## 8. 前台授權檢查暫時禁用說明

> **重要**: 目前前台授權檢查已暫時禁用，以允許所有用戶訪問前台頁面。

### 8.1 禁用方式

前台授權檢查已在以下位置被暫時禁用：

1. **驗證 API (app/api/auth/verify/route.ts)**:
   - 原有的用戶驗證邏輯已被註釋
   - 目前 API 始終返回成功，提供一個訪客用戶資訊

```typescript
// 暫時跳過授權檢查，直接返回成功
return NextResponse.json({
  success: true,
  message: '驗證成功 (暫時跳過授權檢查)',
  isAuthenticated: true,
  data: {
    user_id: 0,
    user_email: 'guest@example.com',
    user_name: '訪客用戶',
    role: '訪客',
    status: '正常',
  },
})
```

### 8.2 恢復方法

當需要重新啟用授權檢查時，只需取消 `app/api/auth/verify/route.ts` 文件中的註釋，並移除臨時返回的訪客用戶代碼即可。

### 8.3 禁用授權檢查的影響

1. 所有用戶（包括未登入用戶）現在可以訪問前台所有頁面
2. 權限控制將不再生效，所有功能對所有用戶開放
3. 用戶狀態（如：禁言）將無法正確限制用戶操作

> **注意**: 此設置僅應用於開發或測試環境，生產環境應始終啟用適當的授權檢查。

## 9. 結論

本文檔詳細說明了寵物領養平台中用戶身份驗證系統的實現方法和最佳實踐。開發者在實作或維護相關功能時應參考本文檔，確保認證系統的安全性和可靠性。

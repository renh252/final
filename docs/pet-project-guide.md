# 寵物領養平台規格書

> 版本: 1.1
> 最後更新: 2025-03-24
> 本文檔作為與 AI 溝通的唯一橋樑，整合了所有關鍵資訊

## 1. 系統概述

**毛孩之家** 是一個綜合性寵物領養與社區平台，旨在連接尋找家庭的寵物與潛在飼主，並提供寵物相關的商品與服務。系統包含以下主要功能模組：

- 寵物領養資訊管理
- 社群討論區
- 寵物用品電子商務
- 捐款與公益活動
- 會員系統
- 後台管理系統

## 2. 技術架構

### 前端技術

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **UI 框架**: React-Bootstrap
- **樣式**: CSS Modules
- **狀態管理**: React Hooks
- **圖示庫**: lucide-react

### 後端技術

- **API 架構**: Next.js API Routes
- **資料庫連接**: mysql2
- **認證**: JWT (jsonwebtoken), next-auth
- **安全**: 參數化查詢, 事務管理

### 資料庫

- **類型**: MySQL
- **關鍵表格**:
  - 會員相關: `users`, `user_roles`, `admin_users`
  - 寵物相關: `pets`, `pet_categories`, `pet_appointment`
  - 商城相關: `products`, `categories`, `orders`, `order_items`
  - 促銷相關: `promotions`, `promotion_products`
  - 論壇相關: `posts`, `comments`, `bookmarks`
  - 管理相關: `admin_operation_logs`

## 3. 核心功能規格

### 3.1 寵物領養系統

#### 功能描述

- 寵物資訊展示（品種、年齡、健康狀況、故事等）
- 領養申請流程
- 預約參觀系統
- 寵物分類與搜尋功能

#### 資料模型

- **Pets**: 寵物基本資訊
- **PetCategories**: 寵物分類
- **PetAppointment**: 預約資訊

#### 預約流程

1. 會員提交預約申請 (待審核)
2. 管理員審核並確認/拒絕
3. 確認後安排參觀時間
4. 完成領養或取消

### 3.2 社群討論區

#### 功能描述

- 發文、留言、樹狀回覆、按讚功能
- 話題分類、標籤、搜尋功能
- 熱門貼文推薦
- 收藏功能
- 即時聊天室

#### 資料模型

- **forum_posts**: 貼文列表個別貼文
- **article_favorites**: 收藏貼文
- **forum_likes**: 貼文按讚
- **forum_categories**: 論壇文章分類
- **forum_tags**: 論壇文章標籤
- **forum_comments**: 留言
- **bookmarks**: 收藏記錄

### 3.3 寵物用品商城

#### 功能描述

- 商品展示與搜尋
- 購物車系統
- 訂單管理
- 評價系統
- 折扣活動管理

#### 資料模型

- **Products**: 商品資訊
- **Categories**: 商品分類
- **Orders**: 訂單資訊
- **OrderItems**: 訂單詳細項目
- **Promotions**: 促銷活動
- **PromotionProducts**: 活動關聯商品

#### 折扣機制

- 按商品分類設置折扣
- 按單一商品設置折扣
- 按時間範圍設置折扣期限
- 折扣百分比計算方式

### 3.4 會員系統

#### 功能描述

- 註冊、登入、登出
- 個人資料管理
- 訂單與預約歷史查詢
- 收藏與關注功能

#### 用戶角色

- **一般會員**: 基本功能
- **VIP 會員**: 享有額外優惠
- **管理員**: 後台管理權限

#### 認證流程

1. 會員登入
2. 後端驗證並簽發 JWT
3. 前端存儲 Token 並用於後續請求
4. 權限檢查與資源訪問控制

### 3.5 後台管理系統

#### 功能描述

- 寵物資訊管理
- 商品與訂單管理
- 會員管理
- 預約管理
- 促銷活動管理
- 內容審核

#### 權限管理

- **超級管理員**: 完全訪問權限 (權限碼: `111`)
- **一般管理員**: 基於功能的細粒度權限 (格式: `module:action`)

#### 權限格式示例

- 寵物管理: `pets:read`, `pets:write`, `pets:delete`
- 商品管理: `shop:products:read`, `shop:products:write`
- 訂單管理: `shop:orders:read`, `shop:orders:process`

## 4. API 設計規範

### 4.1 通用 API 響應格式

成功響應:

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

錯誤響應:

```json
{
  "success": false,
  "message": "錯誤描述",
  "error": "詳細錯誤信息"
}
```

### 4.2 關鍵 API 端點

#### 用戶認證

- `POST /api/auth/login`: 用戶登入
- `POST /api/auth/register`: 用戶註冊
- `GET /api/auth/verify`: 驗證當前用戶

#### 寵物管理

- `GET /api/pets`: 獲取寵物列表
- `GET /api/pets/{id}`: 獲取寵物詳情
- `POST /api/appointment`: 創建預約

#### 商品管理

- `GET /api/products`: 獲取商品列表
- `GET /api/products/{id}`: 獲取商品詳情
- `POST /api/orders`: 創建訂單

#### 促銷活動

- `GET /api/admin/shop/promotions`: 獲取促銷活動列表
- `GET /api/admin/shop/promotions/{pid}`: 獲取促銷活動詳情
- `PUT /api/admin/shop/promotions/{pid}`: 更新促銷活動
- `GET /api/admin/shop/promotions/{pid}/products`: 獲取活動關聯商品
- `POST /api/admin/shop/promotions/{pid}/products`: 更新活動關聯商品

### 4.3 API 安全規範

- 所有 API 必須執行參數驗證
- 管理員 API 必須進行權限檢查
- 使用參數化查詢防止 SQL 注入
- API 響應不得暴露敏感資訊
- 複雜操作必須使用事務確保數據一致性

## 5. 前端組件規範

### 5.1 組件設計原則

- 單一職責原則
- 使用 TypeScript 定義 Props 和 State 類型
- 組件風格與現有設計保持一致
- 針對錯誤與加載狀態提供適當處理
- 避免內聯樣式，優先使用 CSS Module

### 5.2 關鍵組件

#### 後台管理組件

- `AdminPageLayout`: 後台頁面佈局
- `DataTable`: 通用數據表格
- `ModalForm`: 通用模態表單

#### 模態表單組件接口

```typescript
interface ModalFormProps {
  show: boolean
  onHide: () => void
  title: string
  fields: FormField[]
  onSubmit?: (formData: Record<string, any>) => Promise<void>
  initialData?: Record<string, any>
  submitText?: string
  size?: 'sm' | 'lg' | 'xl'
  children?: React.ReactNode
  footer?: React.ReactNode
}

interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: (value: any) => string | null
  value?: any
  defaultValue?: any
}
```

### 5.3 前端資料處理

- 使用`fetchApi`工具函數處理 API 請求
- 使用`useEffect`處理組件生命週期
- 使用`useState`管理組件狀態
- 敏感操作需要確認對話框
- 表單提交需要加載指示器

## 6. 資料庫設計

### 6.1 關鍵表格結構

#### 促銷活動相關表格

**promotions**

```sql
CREATE TABLE promotions (
  promotion_id INT AUTO_INCREMENT PRIMARY KEY,
  promotion_name VARCHAR(255) NOT NULL,
  promotion_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  discount_percentage DECIMAL(5,2) NOT NULL,
  photo VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**promotion_products**

```sql
CREATE TABLE promotion_products (
  promotion_product_id INT AUTO_INCREMENT PRIMARY KEY,
  promotion_id INT NOT NULL,
  product_id INT,
  variant_id INT,
  category_id INT,
  FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);
```

### 6.2 資料庫操作規範

- 所有查詢必須使用參數化查詢
- 多表操作必須使用事務
- 確保正確的錯誤處理和回滾機制
- 禁止直接在 API 路由中編寫 SQL 語句
- 使用連接池管理資料庫連接

## 7. 動態路由與參數處理

### 7.1 Next.js 動態路由處理

- 使用`[param]`格式定義動態路由
- API 處理函數必須檢查`params`參數是否存在
- 實施備用機制從 URL 直接解析參數
- 類型聲明應使用可選參數格式：`{ params?: { id?: string } }`

### 7.2 參數處理最佳實踐

```typescript
// 從URL解析參數的備用機制
let pid: string | null = null

// 嘗試從params獲取pid
if (params && params.pid) {
  pid = params.pid
}
// 如果params不可用，嘗試從URL解析
else {
  const urlParts = req.url.split('/')
  pid = urlParts[urlParts.length - 1]
  // 驗證參數有效性
  if (!/^\d+$/.test(pid)) {
    pid = null
  }
}

// 參數驗證
if (!pid) {
  return NextResponse.json(
    { success: false, message: '無效的ID' },
    { status: 400 }
  )
}
```

## 8. React 狀態管理與防止無限渲染

### 8.1 狀態更新最佳實踐

- 使用函數式更新避免依賴循環
- 小心管理 `useEffect` 的依賴項
- 使用 `useRef` 存儲不需觸發渲染的值

```jsx
// 使用函數式更新
setFormData((prev) => ({ ...prev, [name]: value }))

// 使用 useRef 跨渲染追蹤值
const prevPropsRef = useRef({})
// 更新參考而不觸發重新渲染
prevPropsRef.current = { ...props }

// 在 useEffect 中使用參考比較
useEffect(() => {
  const prevProps = prevPropsRef.current
  if (prevProps.value !== props.value) {
    // 處理變更...
  }
}, [props.value])
```

### 8.2 防止無限渲染循環的策略

1. **適當的依賴項管理**：

   - 只包含真正需要監聽的依賴項
   - 考慮使用 `useMemo` 和 `useCallback` 穩定引用

2. **深度比較**：

   - 使用 `JSON.stringify` 進行簡單的深度比較
   - 複雜情況可使用專用的深比較庫

3. **狀態更新順序**：
   - 先更新引用值，再進行條件判斷
   - 更新前保存舊值用於比較

```jsx
// 正確的更新順序
const oldValue = propsRef.current.value
propsRef.current.value = newValue

// 基於舊值判斷
if (oldValue !== newValue) {
  // 安全地更新狀態
}
```

### 8.3 React 列表渲染與 Key 處理

- 確保提供穩定且唯一的 key
- 處理可能為 null 或 undefined 的數據
- 使用多層備用機制生成唯一 key

```jsx
{
  items.map((item, index) => (
    <ListItem key={item.id || `item-${parentId}-${index}`} data={item} />
  ))
}
```

## 9. 開發與維護指南

### 9.1 開發流程

1. **理解階段**: 先理解現有架構
2. **設計階段**: 提出設計方案，確定修改範圍
3. **實施階段**: 逐步實施，注意代碼質量
4. **驗證階段**: 完整測試，確保功能正常

### 9.2 常見問題與解決方案

#### 無限渲染循環

- 檢查`useEffect`依賴項
- 使用函數式更新避免依賴循環
- 確保條件判斷正確處理所有情況

#### API 參數獲取失敗

- 使用可選參數類型聲明
- 實施 URL 解析備用機制
- 增加日誌記錄便於追蹤問題

#### React 列表渲染警告

- 確保提供唯一且穩定的 key
- 處理 null/undefined 值
- 使用多層備用 ID 生成機制

### 9.3 關鍵注意事項

- 不得修改超級管理員「111」權限格式
- 資料表名稱必須與資料庫一致
- 確保移動端響應式設計
- 保留現有 API 接口格式
- 新功能必須與現有權限系統集成

## 10. 與 AI 溝通指南

### 10.1 功能開發請求模板

```
任務：開發[功能名稱]
實施要求：
1. 僅修改[指定檔案]
2. 遵循[設計模式/規範]
3. 確保不影響[現有功能]
4. 實現方案必須與本規格書一致
驗證方法：[如何驗證功能正常]
```

### 10.2 問題修復請求模板

```
問題：[簡述問題]
相關檔案：[檔案路徑]
修復要求：
1. 精確定位問題根源
2. 提出最小範圍修改
3. 不改變現有架構
4. 說明如何驗證修復成功
```

### 10.3 溝通效率建議

- 提供清晰的問題描述或功能需求
- 明確指出相關的文件和代碼區域
- 說明預期的行為和當前的行為
- 包含任何相關的錯誤訊息或日誌
- 優先使用本規格書中的專業術語

### 10.4 示例請求

```
問題：促銷活動編輯時出現無限渲染循環
相關檔案：app/admin/_components/ModalForm.tsx, app/admin/shop/promotions/page.tsx
修復要求：
1. 分析useEffect依賴項和狀態更新邏輯
2. 修改state更新方式，避免循環依賴
3. 保持現有組件接口不變
4. 測試編輯功能確保能正常保存且不出現Maximum update depth exceeded警告
```

## 11. 項目常見問題與解決方案庫

### 11.1 Next.js 動態路由問題

#### 問題：無法獲取動態路由參數

**症狀**：`Cannot destructure property 'pid' of 'params' as it is undefined`  
**解決方案**：

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params?: { pid?: string } }
) {
  // 從URL解析參數的備用機制
  let pid = null
  if (params && params.pid) {
    pid = params.pid
  } else {
    const urlParts = req.url.split('/')
    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i] === 'promotions' && i + 1 < urlParts.length) {
        const potentialPid = urlParts[i + 1].split('?')[0]
        if (/^\d+$/.test(potentialPid)) {
          pid = potentialPid
          break
        }
      }
    }
  }
  // 驗證參數
  if (!pid) {
    return NextResponse.json(
      { success: false, message: '無效的ID' },
      { status: 400 }
    )
  }
}
```

### 11.2 React 渲染問題

#### 問題：無限渲染循環

**症狀**：`Maximum update depth exceeded`  
**解決方案**：

```jsx
// 先更新引用，再執行條件判斷
const prevPropsRef = { ...propsRef.current }
propsRef.current = {
  show,
  fields,
  initialData,
  initialized: prevPropsRef.initialized,
}

// 基於舊引用做判斷
if (!prevPropsRef.initialized) {
  propsRef.current.initialized = true
  setFormData(processFormData(fields, initialData))
}
```

#### 問題：重複 key 警告

**症狀**：`Encountered two children with the same key, 'cat-undefined'`  
**解決方案**：

```jsx
{
  categories.map((category, parentIndex) => (
    <Accordion.Item
      key={`parent-cat-${category.category_id || `parent-${parentIndex}`}`}
      eventKey={`cat-${category.category_id || `parent-${parentIndex}`}`}
    >
      {subCategories.map((subCategory, index) => (
        <div
          key={`sub-cat-${
            subCategory.category_id || `sub-${parentIndex}-${index}`
          }`}
        >
          {/* 內容 */}
        </div>
      ))}
    </Accordion.Item>
  ))
}
```

### 11.3 資料庫操作問題

#### 問題：資料庫事務失敗

**症狀**：部分操作成功但整體失敗  
**解決方案**：

```typescript
let connection = null
try {
  connection = await db.getConnection()
  await connection.beginTransaction()

  // 執行多個操作...

  await connection.commit()
} catch (error) {
  if (connection) await connection.rollback()
  throw error
} finally {
  if (connection) connection.release()
}
```

## 12. 未來擴展規劃

### 12.1 待完成功能

- **支付系統整合**: 綠界金流 (進行中)
- **LINE Pay 支付**: 規劃中
- **多語言支持**: 規劃中
- **高級搜索功能**: 規劃中
- **數據分析儀表板**: 規劃中

### 12.2 技術改進方向

- 引入單元測試和集成測試
- 優化圖片處理和 CDN 整合
- 改進 SEO 策略
- 提升頁面加載性能
- 強化資料庫查詢優化

---

本規格書作為寵物領養平台的全面指南，涵蓋了系統架構、功能設計、技術規範和開發指南。在後續的開發和維護過程中，所有變更和新功能都應參照本文檔，確保系統的一致性和穩定性。

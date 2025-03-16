# 前端元件結構文檔

> ⚠️ **重要**: 修改前端組件時請遵循本文檔的指導原則，確保與現有系統兼容並避免常見陷阱。

## 開發規範

開發或修改前端組件時必須遵循以下規範：

1. **組件封裝**: 保持組件的單一職責，避免過度耦合
2. **類型安全**: 使用 TypeScript 定義明確的 Props 和 State 類型
3. **樣式一致**: 組件樣式必須與現有設計系統一致
4. **向後兼容**: 修改現有組件時必須保持原有 Props 接口
5. **權限整合**: 後台組件必須與權限系統正確集成
6. **性能優化**: 避免不必要的重複渲染和大型依賴

> **常見錯誤**:
>
> - 組件內直接修改全局狀態或使用非標準 API 調用
> - 使用內聯樣式替代統一樣式系統
> - 未處理加載和錯誤狀態

## 目錄

1. [概述](#概述)
2. [共用元件](#共用元件)
3. [頁面元件](#頁面元件)
4. [後台管理元件](#後台管理元件)
5. [資料表格元件](#資料表格元件)
6. [表單元件](#表單元件)
7. [狀態管理](#狀態管理)
8. [樣式與主題](#樣式與主題)

## 概述

本文檔描述了寵物領養平台前端的元件結構。前端使用 Next.js 框架開發，採用 App Router 結構，並使用 React Bootstrap 作為 UI 框架。系統包含多個共用元件和頁面元件，以實現各種功能和頁面。

> **技術棧限制**:
>
> - 不要引入新的 UI 框架或樣式系統
> - 確保所有修改都與 Next.js App Router 兼容
> - 如需使用外部庫，必須先在文檔中評估兼容性

## 共用元件

共用元件位於 `app/_components` 目錄下，這些元件可以在整個應用程序中重複使用：

### 佈局元件

- `Header`：頁面頂部導航欄
- `Footer`：頁面底部信息
- `Sidebar`：側邊欄導航
- `Layout`：頁面佈局容器
- `AdminLayout`：後台管理頁面佈局

> **修改限制**:
>
> - 佈局組件直接影響整體用戶體驗，修改前必須審慎評估
> - AdminLayout 組件與權限系統高度集成，請參考權限文檔先理解實現

### UI 元件

- `Button`：按鈕元件，支持多種樣式和大小
- `Card`：卡片元件，用於顯示內容
- `Modal`：模態對話框
- `Alert`：警告提示
- `Toast`：提示訊息
- `Spinner`：加載動畫
- `Pagination`：分頁控制
- `Tabs`：標籤頁
- `Dropdown`：下拉菜單
- `Badge`：徽章
- `Tooltip`：工具提示
- `Popover`：彈出提示
- `Breadcrumb`：麵包屑導航

### 表單元件

- `Input`：輸入框
- `Select`：下拉選擇框
- `Checkbox`：複選框
- `Radio`：單選框
- `Switch`：開關
- `DatePicker`：日期選擇器
- `TimePicker`：時間選擇器
- `FileUpload`：文件上傳
- `ImageUpload`：圖片上傳
- `RichTextEditor`：富文本編輯器
- `Form`：表單容器
- `FormGroup`：表單組
- `FormLabel`：表單標籤
- `FormControl`：表單控制
- `FormFeedback`：表單反饋

## 頁面元件

頁面元件位於 `app` 目錄下的各個子目錄中，每個頁面都有自己的元件：

### 首頁元件

- `HeroBanner`：首頁橫幅
- `FeatureSection`：特色區塊
- `PetShowcase`：寵物展示
- `NewsSection`：新聞區塊
- `TestimonialSection`：用戶評價區塊
- `CallToAction`：行動呼籲區塊

### 寵物領養頁面元件

- `PetList`：寵物列表
- `PetCard`：寵物卡片
- `PetFilter`：寵物篩選
- `PetSearch`：寵物搜索
- `PetDetail`：寵物詳情
- `AdoptionForm`：領養申請表單
- `AppointmentForm`：預約表單

### 商城頁面元件

- `ProductList`：商品列表
- `ProductCard`：商品卡片
- `ProductFilter`：商品篩選
- `ProductSearch`：商品搜索
- `ProductDetail`：商品詳情
- `Cart`：購物車
- `Checkout`：結帳
- `OrderSummary`：訂單摘要
- `PaymentForm`：支付表單
- `OrderHistory`：訂單歷史
- `OrderDetail`：訂單詳情

### 論壇頁面元件

- `ArticleList`：文章列表
- `ArticleCard`：文章卡片
- `ArticleFilter`：文章篩選
- `ArticleSearch`：文章搜索
- `ArticleDetail`：文章詳情
- `CommentSection`：評論區塊
- `CommentForm`：評論表單
- `ArticleEditor`：文章編輯器

### 會員中心頁面元件

- `Profile`：個人資料
- `ProfileForm`：個人資料表單
- `PasswordForm`：密碼修改表單
- `AdoptionHistory`：領養歷史
- `DonationHistory`：捐款歷史
- `FavoriteList`：收藏列表
- `NotificationList`：通知列表
- `MessageList`：訊息列表
- `MessageDetail`：訊息詳情
- `MessageForm`：訊息表單

## 後台管理元件

後台管理元件位於 `app/admin/_components` 目錄下，這些元件專門用於後台管理系統：

**注意**: 所有後台 API 都位於 `app/api/admin` 目錄下（標準的 Next.js API 路由結構），而不是 `app/admin/api` 目錄。前端元件應使用 `/api/admin/...` 格式的路徑調用這些 API。

### 佈局元件

- `AdminPageLayout`：後台頁面佈局
- `AdminHeader`：後台頁面頂部導航欄
- `AdminSidebar`：後台頁面側邊欄
  - 基於管理員權限動態顯示菜單項
  - 支持菜單展開/折疊
  - 提供權限診斷工具（雙擊版本徽章開啟）
  - 有關權限和側邊欄顯示的詳細說明，請參考 [admin-permission-system.md](./admin-permission-system.md)
- `AdminFooter`：後台頁面底部信息
- `AdminBreadcrumb`：後台頁面麵包屑導航

### 數據顯示元件

- `DataTable`：數據表格
- `DataCard`：數據卡片
- `DataChart`：數據圖表
- `DataStats`：數據統計
- `DataFilter`：數據篩選
- `DataSearch`：數據搜索
- `DataExport`：數據導出
- `DataImport`：數據導入

### 表單元件

- `ModalForm`：模態表單
- `AdminForm`：後台表單
- `AdminFormGroup`：後台表單組
- `AdminFormLabel`：後台表單標籤
- `AdminFormControl`：後台表單控制
- `AdminFormFeedback`：後台表單反饋

### 操作元件

- `ActionButton`：操作按鈕
- `ActionDropdown`：操作下拉菜單
- `ConfirmDialog`：確認對話框
- `Toast`：提示訊息
- `Alert`：警告提示

## 資料表格元件

資料表格元件是後台管理系統中最常用的元件之一，位於 `app/admin/_components/DataTable.tsx` 文件中。它提供了以下功能：

- 數據顯示：以表格形式顯示數據
- 排序：支持單列排序和多列排序
- 篩選：支持單列篩選和多列篩選
- 搜索：支持全局搜索和列搜索
- 分頁：支持分頁顯示
- 選擇：支持單選和多選
- 操作：支持行操作和批量操作
- 導出：支持導出數據為 CSV、Excel、JSON 等格式
- 導入：支持從 CSV、Excel、JSON 等格式導入數據

資料表格元件的使用方式如下：

```tsx
<DataTable
  title="數據表格"
  data={data}
  columns={columns}
  loading={loading}
  pagination={true}
  search={true}
  filter={true}
  sort={true}
  select={true}
  export={true}
  import={true}
  actions={actions}
  batchActions={batchActions}
  onRowClick={handleRowClick}
  onSelectionChange={handleSelectionChange}
  onPageChange={handlePageChange}
  onSortChange={handleSortChange}
  onFilterChange={handleFilterChange}
  onSearchChange={handleSearchChange}
  onExport={handleExport}
  onImport={handleImport}
/>
```

## 表單元件

表單元件是後台管理系統中另一個常用的元件，位於 `app/admin/_components/ModalForm.tsx` 文件中。它提供了以下功能：

- 表單顯示：以模態對話框形式顯示表單
- 表單驗證：支持表單驗證
- 表單提交：支持表單提交
- 表單重置：支持表單重置
- 表單取消：支持表單取消
- 表單字段：支持多種表單字段類型

表單元件的使用方式如下：

```tsx
<ModalForm
  title="表單"
  show={show}
  onHide={handleHide}
  onSubmit={handleSubmit}
  onReset={handleReset}
  onCancel={handleCancel}
  fields={fields}
  values={values}
  errors={errors}
  loading={loading}
  submitText="提交"
  resetText="重置"
  cancelText="取消"
/>
```

## 狀態管理

前端使用 React 的 Context API 和 Hooks 進行狀態管理，主要包括以下幾個方面：

### 全局狀態

全局狀態位於 `app/_contexts` 目錄下，包括：

- `AuthContext`：認證狀態
- `CartContext`：購物車狀態
- `ThemeContext`：主題狀態
- `NotificationContext`：通知狀態
- `ModalContext`：模態對話框狀態

### 頁面狀態

頁面狀態使用 React 的 `useState` 和 `useReducer` Hooks 進行管理，每個頁面都有自己的狀態管理邏輯。

### 數據獲取

數據獲取使用 React 的 `useEffect` Hook 和 `fetch` API 進行管理，也可以使用 SWR 或 React Query 等庫進行數據獲取和緩存。

## 樣式與主題

前端使用 React Bootstrap 作為主要 UI 框架，並使用 CSS Modules 進行樣式隔離。全局樣式通過 `app/global.css` 進行管理，而不是使用 Tailwind CSS。

### 樣式文件

樣式文件組織如下：

- `app/global.css`：全局樣式，包含基礎樣式設定和共用樣式
- 各頁面和元件的 CSS Modules：如 `styles.module.css`，用於元件級別的樣式隔離
- `bootstrap.scss`：Bootstrap 樣式自定義（如有需要）

### 樣式管理方式

1. **全局樣式**：通過 `app/global.css` 定義全站通用的樣式，如基礎排版、顏色變量等
2. **元件樣式**：每個元件使用獨立的 CSS Module 文件（如 `ComponentName.module.css`）
3. **頁面樣式**：頁面級別的樣式也使用 CSS Module 進行管理

### CSS Modules 使用示例

```tsx
// 引入 CSS Module
import styles from './Button.module.css'

// 在元件中使用
function Button({ children }) {
  return <button className={styles.button}>{children}</button>
}
```

### 主題配置

主題配置主要通過 CSS 變量在 `app/global.css` 中定義，支持明暗主題切換和自定義主題。

```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #50e3c2;
  --text-color: #333333;
  --background-color: #ffffff;
  /* 其他顏色變量 */
}

[data-theme='dark'] {
  --primary-color: #2d6bc9;
  --secondary-color: #39b89e;
  --text-color: #f0f0f0;
  --background-color: #121212;
  /* 其他暗色主題變量 */
}
```

這種方式使得樣式管理更加模組化和可維護，同時保持了樣式的隔離性和可重用性。

## 商品管理相關組件

### 商品資料表格 (`DataTable`)

商品管理頁面使用 `DataTable` 組件顯示商品列表，該組件位於 `app/admin/_components/DataTable.tsx`。

#### 欄位定義

```typescript
const columns = [
  {
    key: 'product_id',
    label: 'ID',
    sortable: true,
  },
  {
    key: 'product_image',
    label: '圖片',
    render: (value, row) => (
      <Image
        src={row.main_image || '/images/default_product.jpg'}
        alt="商品照片"
        width={50}
        height={50}
        className="rounded"
      />
    ),
  },
  {
    key: 'product_name',
    label: '名稱',
    sortable: true,
  },
  {
    key: 'category_name',
    label: '分類',
    sortable: true,
    filterable: true,
    filterOptions: categories.map((c) => ({
      value: c.category_name,
      label: c.category_name,
    })),
  },
  {
    key: 'price',
    label: '價格',
    sortable: true,
    render: (value) => `NT$ ${value || 0}`,
  },
  {
    key: 'stock',
    label: '庫存',
    sortable: true,
    render: (value) => value || 0,
  },
  {
    key: 'product_status',
    label: '狀態',
    sortable: true,
    filterable: true,
    filterOptions: STATUS_OPTIONS,
    render: (value, row) => {
      if (row.is_deleted === 1) {
        return <Badge bg="danger">已刪除</Badge>
      } else if (value === '上架' || value === 'active') {
        return <Badge bg="success">上架中</Badge>
      } else if (value === '下架' || value === 'inactive') {
        return <Badge bg="secondary">已下架</Badge>
      } else if (value === 'out_of_stock') {
        return <Badge bg="danger">缺貨中</Badge>
      }
      return <Badge bg="light">未知</Badge>
    },
  },
  {
    key: 'created_at',
    label: '新增日期',
    sortable: true,
    render: (value) => {
      if (!value) return '-'
      try {
        const date = new Date(value)
        return date.toLocaleString('zh-TW', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      } catch (error) {
        return value
      }
    },
  },
]
```

### 商品編輯表單 (`ModalForm`)

商品編輯使用 `ModalForm` 組件，該組件位於 `app/admin/_components/ModalForm.tsx`。

#### 欄位定義

```typescript
const formFields = [
  {
    name: 'product_name',
    label: '商品名稱',
    type: 'text',
    required: true,
  },
  {
    name: 'product_price',
    label: '價格',
    type: 'number',
    required: true,
  },
  {
    name: 'product_description',
    label: '商品描述',
    type: 'textarea',
    required: false,
  },
  {
    name: 'product_category',
    label: '商品分類',
    type: 'select',
    options: categories.map((c) => ({
      value: c.category_id,
      label: c.category_name,
    })),
    required: true,
  },
  {
    name: 'product_stock',
    label: '庫存數量',
    type: 'number',
    required: false,
    defaultValue: 0,
  },
  {
    name: 'product_status',
    label: '商品狀態',
    type: 'select',
    options: STATUS_OPTIONS.filter((option) => option.value !== 'deleted'),
    required: true,
    defaultValue: 'active',
  },
  {
    name: 'product_image',
    label: '商品圖片URL',
    type: 'text',
    required: false,
  },
]
```

### 商品狀態處理

前端使用一組狀態選項常量定義商品的可能狀態：

```typescript
const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' },
  { value: 'out_of_stock', label: '缺貨中' },
  { value: 'deleted', label: '已刪除' },
]
```

#### 前後端狀態映射

前端與後端之間的狀態值映射如下：

| 前端狀態 (status) | 後端狀態 (product_status) | 說明                   |
| ----------------- | ------------------------- | ---------------------- |
| 'active'          | '上架'                    | 商品上架中，可被購買   |
| 'inactive'        | '下架'                    | 商品已下架，不可被購買 |
| 'out_of_stock'    | '上架'                    | 商品已缺貨但仍顯示     |
| 'deleted'         | 任意 (由 is_deleted 決定) | 商品已被軟刪除         |

### 商品刪除處理

商品使用軟刪除機制，通過 `is_deleted` 欄位標記刪除狀態：

1. 在資料庫中，`is_deleted = 1` 表示商品已刪除
2. 預設情況下，前端只顯示 `is_deleted = 0` 的商品
3. 用戶可以通過篩選選項選擇顯示已刪除商品

```typescript
// 過濾出未刪除的商品作為預設顯示
const nonDeletedProducts = (data.products || []).filter(p => p.is_deleted !== 1)
setFilteredProducts(nonDeletedProducts)

// 切換是否顯示已刪除商品
<Form.Check
  key="filter-deleted"
  type="checkbox"
  id="filter-deleted"
  label="已刪除"
  onChange={(e) => {
    if (e.target.checked) {
      setFilteredProducts(products) // 顯示全部商品，包括已刪除
    } else {
      setFilteredProducts(products.filter(p => p.is_deleted !== 1)) // 僅顯示未刪除商品
    }
  }}
  defaultChecked={false}
/>
```

### 編輯商品時的欄位映射

當編輯商品時，需要處理前後端欄位命名不一致的問題：

```typescript
// 處理編輯商品
const handleEditProduct = (product) => {
  // 設置當前商品和模態框模式
  const productWithCorrectFields = {
    ...product,
    product_stock: product.stock, // 確保庫存欄位正確映射
    product_price: product.price, // 同樣確保價格欄位正確映射
    product_image: product.main_image, // 確保圖片欄位正確映射
    product_category: product.category_id, // 確保分類欄位正確映射
  }
  setCurrentProduct(productWithCorrectFields)
  setModalMode('edit')
  setShowModal(true)
}
```

### 商品儀錶板統計

商品管理頁面上方顯示商品統計儀錶板，統計不同狀態的商品數量：

```typescript
// 統計數據
const productStats = [
  {
    title: '總商品數',
    count: products.filter((p) => p.is_deleted !== 1).length,
    color: 'primary',
    icon: <Package size={24} />,
  },
  {
    title: '上架中',
    count: products.filter(
      (p) =>
        (p.product_status === '上架' || p.product_status === 'active') &&
        p.is_deleted !== 1
    ).length,
    color: 'success',
    icon: <Package size={24} />,
  },
  {
    title: '已下架',
    count: products.filter(
      (p) =>
        (p.product_status === '下架' || p.product_status === 'inactive') &&
        p.is_deleted !== 1
    ).length,
    color: 'secondary',
    icon: <Package size={24} />,
  },
  {
    title: '已刪除',
    count: products.filter((p) => p.is_deleted === 1).length,
    color: 'dark',
    icon: <Trash2 size={24} />,
  },
]
```

## DataTable 組件最佳實踐

DataTable 是後台管理系統中最常用的組件之一，它提供了資料展示、搜尋、排序、過濾等功能。使用時需要特別注意以下幾點以避免常見的問題：

### 避免無限循環渲染

DataTable 組件內部使用了多個 `useEffect` 鉤子來處理數據過濾、排序和分頁等邏輯。為避免無限循環渲染，請遵循以下原則：

1. **正確使用依賴項**：

   ```jsx
   // 錯誤示例 - 可能導致無限循環
   useEffect(() => {
     // 數據處理邏輯...
     setFilteredData(result)
   }, [filteredData]) // 依賴於 filteredData 但又在內部修改它

   // 正確示例
   useEffect(() => {
     // 數據處理邏輯...
     setFilteredData(result)
   }, [data, searchTerm, filters]) // 只依賴不會在 effect 內部修改的狀態
   ```

2. **使用 useCallback 和 useMemo**：

   ```jsx
   // 使用 useCallback 緩存函數
   const processDataFiltering = useCallback(() => {
     // 數據處理邏輯...
   }, [searchTerm, filters, sortKey])

   // 使用 useMemo 計算派生狀態
   const paginationData = useMemo(() => {
     const totalPages = Math.ceil(filteredData.length / pageSize)
     const startIndex = (currentPage - 1) * pageSize
     const endIndex = Math.min(startIndex + pageSize, filteredData.length)
     const currentData = filteredData.slice(startIndex, endIndex)

     return { totalPages, startIndex, endIndex, currentData }
   }, [filteredData, pageSize, currentPage])
   ```

3. **使用 ref 跟踪數據變化**：

   ```jsx
   const dataRef = useRef(data)

   useEffect(() => {
     // 只有當數據真正變化時才處理
     if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
       dataRef.current = data
       // 執行數據處理...
     }
   }, [data])
   ```

4. **拆分相互依賴的效果**：

   ```jsx
   // 處理數據過濾
   useEffect(() => {
     processDataFiltering()
   }, [searchTerm, filters, processDataFiltering])

   // 單獨處理頁碼邏輯
   useEffect(() => {
     setCurrentPage(1)
   }, [searchTerm, filters])
   ```

### 性能優化建議

1. **避免深比較大型數據**：

   - 不要直接使用 JSON.stringify 比較大型數據集，這會導致性能問題
   - 考慮使用資料的 ID 或其他唯一標識符進行比較

2. **限制重新渲染範圍**：

   - 使用記憶化技術（useMemo，useCallback）限制重新計算
   - 考慮將大型表格拆分為更小的組件

3. **虛擬滾動**：

   - 對於大型數據集，考慮使用虛擬滾動技術（例如 react-window 或 react-virtualized）
   - 這樣只渲染可見的行，大大提高性能

4. **延遲搜索和過濾**：
   - 對於搜索和過濾操作實施防抖或節流
   - 避免在每次擊鍵時都重新過濾大型數據集

```jsx
// 延遲搜索示例
const debouncedSearchTerm = useDebounce(searchTerm, 300)

useEffect(() => {
  // 使用 debouncedSearchTerm 而不是 searchTerm 進行過濾
  // 這樣只有當用戶停止輸入 300ms 後才會觸發過濾
}, [debouncedSearchTerm])
```

正確實施這些最佳實踐可以大幅提高 DataTable 組件的性能，並避免常見的無限循環渲染問題。

# 後台管理系統 - 權限系統文檔

> ⚠️ **警告**: 此文檔描述了權限系統的關鍵機制。修改權限相關代碼時請嚴格遵循以下規範，避免破壞現有功能。

## 概述

本文檔描述了後台管理系統的權限控制機制，包括權限格式、緩存策略、初始化流程以及與側邊欄顯示相關的問題解決方案。此權限系統設計用於控制不同管理員對後台各功能模塊的訪問權限。

## 權限格式

系統使用了權限字符串格式，支持以下類型的管理員權限：

1. **超級管理員**: 使用 `111` 表示，擁有所有權限
2. **一般管理員**: 使用冒號分隔的權限格式，例如：
   - 模塊權限：`members:read`
   - 子模塊權限：`shop:products:read`

權限字符串存儲在資料庫 `manager_privileges` 欄位中。

> **重要規範**:
>
> 1. 不得修改超級管理員的 `111` 權限碼格式
> 2. 所有權限檢查必須支持冒號分隔的標準格式
> 3. 系統已經移除對舊格式權限的支持，現在僅支持上述標準權限格式

## 權限系統組件

系統由以下核心組件構成：

### 1. 權限管理模組 (app/admin/\_lib/permissions.ts)

此模組負責權限的定義、解析和檢查。主要功能包括：

- 定義所有可用的權限代碼 (`ALL_PERMISSIONS`)
- 提供權限組映射 (`PERMISSION_GROUPS`)
- 解析權限字串，獲取對應的權限集 (`parsePrivileges`)
- 檢查是否具有特定權限 (`checkPermission`)
- 獲取管理員權限列表 (`getManagerPermissions`)

> **實現限制**:
>
> - 任何對 `checkPermission` 函數的修改都必須保持向後兼容性
> - 修改時必須保留 `privileges === '111'` 的超級管理員判斷邏輯

```typescript
// 權限檢查示例
export function checkPermission(
  privileges: string,
  requiredPrivilege: string | string[]
): boolean {
  // 超級管理員擁有所有權限
  if (privileges === '111') return true

  // 參數驗證
  if (
    !privileges ||
    (!requiredPrivilege && !Array.isArray(requiredPrivilege))
  ) {
    return false
  }

  try {
    // 獲取擴展後的所有權限
    const managerPerms = getManagerPermissions(privileges)
    console.log('權限檢查 - 擴展後權限數量:', managerPerms.length)

    // 檢查是否有必要的權限
    if (Array.isArray(requiredPrivilege)) {
      const result = requiredPrivilege.some((p) => {
        if (p === '111') return privileges === '111'
        return managerPerms.includes(p)
      })
      return result
    }

    // 特殊處理超級管理員代碼
    if (requiredPrivilege === '111') return privileges === '111'

    return managerPerms.includes(requiredPrivilege)
  } catch (error) {
    console.error('權限檢查錯誤:', error)
    return false
  }
}
```

> **處理權限時的關鍵規則**:
>
> 1. 若需額外日誌，使用標準格式並避免重複輸出
> 2. 任何權限錯誤應該默認拒絕訪問，而不是默認允許
> 3. 必須在 try/catch 中處理權限解析，避免未處理的錯誤
> 4. 更新權限邏輯時，所有相關組件必須同步更新

### 2. 管理員上下文 (app/admin/AdminContext.tsx)

此組件負責管理員的認證、權限緩存和權限檢查。主要功能包括：

- 管理員登入/登出及 token 管理
- 權限預載入與緩存
- 管理員身份驗證
- 權限檢查 API

> **集成注意事項**:
>
> - 權限緩存使用 localStorage，請勿更改存儲機制
> - 不要在此組件中添加業務邏輯，只處理權限相關功能

```typescript
// 預加載權限的實現
const preloadPermissions = useCallback(() => {
  console.log('預加載權限開始 - 管理員狀態:', admin)
  if (!admin || !admin.manager_privileges) {
    console.warn('預加載權限失敗 - 管理員未載入或無權限')
    return
  }

  try {
    // 獲取管理員權限
    const permissions = getManagerPermissions(admin.manager_privileges)
    console.log(`預加載權限完成，獲取到 ${permissions.length} 個權限`)

    // 存儲到本地緩存
    localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(permissions))

    // 更新狀態
    setCachedPermissions(permissions)
  } catch (error) {
    console.error('預加載權限失敗:', error)
  }
}, [admin])
```

### 3. 側邊欄組件 (app/admin/\_components/Sidebar.tsx)

側邊欄組件根據管理員權限動態顯示導航菜單。主要功能包括：

- 菜單項根據權限過濾
- 支援深色/淺色主題
- 支援子菜單展開/收起
- 集成權限診斷工具入口

```typescript
// 根據權限過濾菜單項
const filteredMenuItems = useMemo(() => {
  if (!mounted || !admin)
    return menuItems.filter((item) => !item.requiredPrivilege)

  return menuItems.filter((item) => {
    // 沒有權限要求，所有人可見
    if (!item.requiredPrivilege) {
      return true
    }

    // 權限診斷功能始終可見
    if (item.label === '權限診斷') {
      return true
    }

    try {
      // 檢查權限並記錄結果 (用於調試)
      const hasAccess = hasPermission(item.requiredPrivilege)

      if (debugMode) {
        console.log(
          `菜單項 "${item.label}" 權限檢查:`,
          item.requiredPrivilege,
          hasAccess ? '有權限' : '無權限'
        )
      }

      return hasAccess
    } catch (error) {
      console.error(`檢查菜單項 "${item.label}" 權限時出錯:`, error)
      return false
    }
  })
}, [menuItems, mounted, admin, hasPermission, debugMode])
```

### 4. 權限診斷工具 (app/admin/\_components/PermissionDebug.tsx)

新開發的權限診斷工具，用於調試和解決權限相關問題。主要功能包括：

- 顯示管理員信息和權限狀態
- 檢查權限緩存和欄位一致性
- 測試常見權限
- 顯示 localStorage 中存儲的管理員相關數據

```typescript
// 診斷工具實例接口
interface DebugInstance {
  open: () => void
  close: () => void
}

// 創建一個可外部訪問的實例
let debugInstance: DebugInstance | null = null

// 設置調試實例的方法
export const setDebugInstance = (instance: DebugInstance) => {
  debugInstance = instance
}

// 提供給外部使用的方法
export const openPermissionDebug = () => {
  if (debugInstance) {
    debugInstance.open()
  } else {
    console.warn('權限調試工具尚未初始化')
  }
}
```

## 權限初始化流程

系統採用了三層權限緩存策略，確保高效的權限檢查：

1. **資料庫層**：管理員權限存儲在 `manager_privileges` 欄位中
2. **Context 層**：登入或驗證時載入並解析為權限列表
3. **本地儲存層**：使用 `localStorage` 緩存解析後的權限列表

初始化流程：

```
登入/頁面載入 → 檢查本地緩存 → 若無緩存，則從資料庫獲取 → 解析權限 → 更新緩存
```

## 解決側邊欄顯示問題

如果管理員初次進入後台時側邊欄項目沒有正確顯示，原因可能是：

1. 權限尚未正確緩存
2. 權限初始化與側邊欄渲染時序問題
3. 資料庫欄位未正確映射到前端

### 改進措施

我們實施了以下改進措施：

1. **同步權限初始化**：在 `AdminContext.tsx` 中確保權限在初始化、登入和驗證時都被正確處理

   ```typescript
   // 立即預載入並緩存權限
   const managerPerms = getManagerPermissions(
     adminData.manager_privileges || ''
   )
   localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(managerPerms))
   setCachedPermissions(managerPerms)
   ```

2. **添加側邊欄自檢機制**：側邊欄組件會檢測是否已載入管理員信息但權限緩存為空的情況

   ```typescript
   useEffect(() => {
     if (mounted && admin && cachedPermissions.length === 0) {
       console.log('Sidebar: 檢測到管理員已加載但權限緩存為空，自動預載入權限')
       preloadPermissions()
     }
   }, [admin, cachedPermissions, mounted, preloadPermissions])
   ```

3. **改進版本徽章和診斷工具**：使徽章更加明顯並提供診斷信息

   ```typescript
   <span
     className="badge rounded-pill bg-secondary bg-opacity-25 fw-normal px-2 py-1"
     style={{
       backgroundColor: isDarkMode
         ? 'rgba(255,255,255,0.1)'
         : 'rgba(0,0,0,0.1)',
     }}
     onDoubleClick={handleVersionDoubleClick}
   >
     <span className="me-1">v1.0.0</span>
     <small
       className="fs-10"
       style={{
         color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
       }}
     >
       (雙擊開啟診斷)
     </small>
   </span>
   ```

4. **優化權限緩存策略**：確保權限變更時緩存被正確更新
   ```typescript
   // 如果是超級管理員，同時保存所有權限列表
   if (adminData.manager_privileges === '111') {
     localStorage.setItem(
       CACHE_KEYS.ALL_PERMISSIONS_LIST,
       JSON.stringify(ALL_PERMISSIONS)
     )
   }
   ```

## 權限檢查機制

系統使用 `hasPermission` 函數檢查管理員是否具有特定權限：

```typescript
// 檢查是否有權限的實現
const hasPermission = useCallback(
  (requiredPrivilege: string | string[]): boolean => {
    // 如果沒有登入，沒有權限
    if (!admin) {
      console.log('權限檢查 - 管理員未登入')
      return false
    }

    // 超級管理員擁有所有權限
    if (admin.manager_privileges === '111') {
      return true
    }

    try {
      // 檢查緩存權限
      if (cachedPermissions.length === 0) {
        console.log('權限檢查 - 緩存為空，嘗試預載入')
        preloadPermissions()
      }

      // 使用 checkPermission 函數檢查權限
      const result = checkPermission(
        admin.manager_privileges,
        requiredPrivilege
      )
      return result
    } catch (error) {
      console.error('檢查權限時發生錯誤:', error)
      return false
    }
  },
  [admin, cachedPermissions]
)
```

## 功能改進詳情

### 權限系統優化

1. **移除舊格式權限支援**

   - 移除了 `LEGACY_TO_NEW_FORMAT` 映射
   - 移除了 `convertLegacyPermissions` 函數
   - 簡化了 `getManagerPermissions` 函數，只支援新格式權限

2. **權限驗證強化**
   - 優化了 `hasPermission` 函數，增強錯誤處理
   - 改進了 `preloadPermissions` 函數，確保權限正確載入和緩存
   - 清理了權限遷移工具相關代碼和目錄

### 側邊欄優化

1. **主題支援**

   - 使用 `useMemo` 和 `useCallback` 確保圖標顏色隨主題變化
   - 使用 inline style 確保在主題切換時立即生效
   - 適配淺色/深色主題的文字和背景顏色

2. **權限驗證整合**

   - 優化菜單項過濾邏輯，根據權限動態顯示菜單
   - 改進子菜單權限過濾
   - 增加調試日誌，方便追蹤權限問題

3. **界面優化**
   - 改進版本號顯示和權限診斷工具入口
   - 優化子菜單展開/收起動畫
   - 調整側邊欄響應式效果

## 權限診斷工具

系統提供了全新的權限診斷工具，可通過雙擊側邊欄底部的版本徽章或點擊盾牌圖標開啟：

### 主要功能

1. **管理員信息檢查**

   - 顯示管理員 ID、帳號、權限字串
   - 顯示是否為超級管理員
   - 顯示解析後的權限數量

2. **權限緩存分析**

   - 顯示權限緩存數量和覆蓋率
   - 提供權限重新載入功能
   - 提供權限緩存清除功能

3. **欄位一致性檢查**

   - 驗證 `manager_account` 和 `manager_privileges` 欄位是否存在
   - 檢查欄位值是否符合預期格式

4. **權限測試**

   - 測試常見模塊權限
   - 即時顯示權限驗證結果
   - 提供權限詳情輸出功能

5. **localStorage 數據檢視**
   - 顯示所有管理員相關的本地儲存數據
   - 便於排查權限緩存問題

### 使用方式

1. 雙擊側邊欄底部的版本號 "v1.0.0"
2. 點擊側邊欄底部的盾牌圖標

## 最佳實踐

1. **直接使用資料庫欄位名稱**：使用 `manager_account` 和 `manager_privileges` 而非額外的映射
2. **權限預緩存**：初始化時立即解析並緩存權限，提高性能
3. **權限格式統一**：使用統一的權限格式，避免多重格式轉換
4. **定期驗證**：系統每 5 分鐘自動驗證一次權限，確保最新權限狀態
5. **權限診斷**：使用診斷工具便於排查權限問題
6. **使用 useMemo 和 useCallback**：優化側邊欄性能，減少不必要的重新渲染
7. **增加錯誤日誌**：方便追蹤權限相關問題

## 常見問題與解決方案

| 問題                   | 可能原因                | 解決方案                               |
| ---------------------- | ----------------------- | -------------------------------------- |
| 側邊欄項目未顯示       | 權限緩存為空            | 使用診斷工具重新載入權限               |
| 特定頁面無權限         | 權限字串不含必要權限    | 檢查該頁面所需的 `requiredPrivilege`   |
| 權限變更未生效         | 本地緩存未更新          | 登出後重新登入，或使用診斷工具重新載入 |
| 超級管理員無法訪問頁面 | 權限檢查邏輯錯誤        | 確認 `manager_privileges` 值為 `111`   |
| 側邊欄顏色未隨主題變化 | ThemeContext 未正確整合 | 檢查 ThemeContext 是否包裹了應用       |
| 診斷工具無法開啟       | debugInstance 未初始化  | 確保 Sidebar 組件正確載入              |
| 權限檢查報錯           | 權限解析過程中出現異常  | 使用診斷工具檢查權限字串格式           |
| 預加載權限失敗         | 管理員資訊未正確載入    | 查看控制台日誌，檢查 API 響應格式      |

## 調試技巧

1. **啟用偵錯模式**：
   點擊權限診斷工具中的「測試特定權限」可以檢查權限問題。

2. **檢查控制台日誌**：
   系統會在控制台輸出權限相關日誌，包括預載入、權限檢查等信息。

3. **檢查 localStorage**：
   使用診斷工具查看 localStorage 中存儲的管理員信息，確保數據正確。

4. **清除緩存重載**：
   使用診斷工具中的「清除緩存」按鈕，然後重新載入頁面。

5. **測試常見權限**：
   使用診斷工具中的權限測試功能，檢查各模塊的權限設置。

## 注意事項

1. 權限驗證應同時在前端和後端進行
2. 避免直接編輯本地儲存的權限緩存
3. 側邊欄的權限檢查僅為第一層過濾，API 請求時仍需驗證權限
4. 如遇權限異常，可使用診斷工具了解詳情
5. 系統現在僅支持標準權限格式，不再支持舊格式權限
6. 權限字串應使用逗號分隔多個權限
7. 超級管理員權限 `111` 擁有系統中所有權限

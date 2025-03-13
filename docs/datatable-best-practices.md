# DataTable 組件最佳實踐指南

本文檔總結了在使用 DataTable 組件時防止無限循環渲染的最佳實踐。

## 避免循環依賴

### useEffect 和 useCallback

DataTable 組件使用了多個 React 鉤子（hooks）來管理數據過濾、排序和分頁。以下是幾個防止無限循環的關鍵點：

1. **避免在 useEffect 依賴項中包含 processDataFiltering**

   ```jsx
   // ❌ 錯誤示例 - 可能導致無限循環
   useEffect(() => {
     processDataFiltering()
     setCurrentPage(1)
   }, [searchTerm, filters, sortKey, sortDirection, processDataFiltering])

   // ✅ 正確示例 - 避免將 processDataFiltering 作為依賴項
   useEffect(() => {
     processDataFiltering()
     setCurrentPage(1)
   }, [searchTerm, filters, sortKey, sortDirection])
   ```

2. **適當使用 useCallback**

   使用 `useCallback` 來緩存函數，但確保依賴項正確：

   ```jsx
   const processDataFiltering = React.useCallback(() => {
     // 過濾邏輯...
     setFilteredData(result)
   }, [searchTerm, columns, searchKeys, filters, sortKey, sortDirection])
   ```

3. **適當使用 useMemo 緩存計算結果**

   ```jsx
   const paginationData = React.useMemo(() => {
     // 計算分頁邏輯...
     return { totalPages, startIndex, endIndex, currentData }
   }, [filteredData, pageSize, currentPage])
   ```

## 數據變更處理

當数据源 (props.data) 發生變化時，需要謹慎處理：

```jsx
useEffect(() => {
  if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
    dataRef.current = data
    setSelectedRows([])
    setSelectAll(false)
    processDataFiltering()
  }
}, [data])
```

## 使用 ref 避免不必要的重新渲染

在 DataTable 中，我們使用 `useRef` 來保存 data 的引用，這有助於減少不必要的重新渲染：

```jsx
const dataRef = React.useRef(data)
```

## 狀態重置時機

當搜索條件、過濾器或排序條件變更時，需要重置當前頁碼以確保用戶看到正確的結果：

```jsx
useEffect(() => {
  processDataFiltering()
  setCurrentPage(1)
}, [searchTerm, filters, sortKey, sortDirection])
```

## 依賴項設置原則

1. **包含必要的依賴項**：確保 useEffect 和 useCallback 的依賴項包含所有使用的狀態變量
2. **避免循環依賴**：不要在 useEffect 中既修改某個狀態，又依賴於該狀態
3. **避免不穩定的對象引用**：避免直接在依賴項中使用對象或數組，除非使用 useMemo 緩存

## 常見問題和解決方案

### 問題：React 警告 "Maximum update depth exceeded"

**原因**：通常是因為在渲染過程中無限循環更新狀態

**解決方案**：

- 檢查 useEffect 依賴項是否包含其自身修改的狀態
- 確保 useCallback 和 useMemo 的依賴項正確設置
- 使用 ref 來存儲不需要觸發重新渲染的值

### 問題：DataTable 在某些操作後不更新

**原因**：可能是缺少必要的依賴項

**解決方案**：

- 確保 useEffect 依賴項包含所有可能導致副作用重新執行的狀態變量
- 檢查是否正確調用了 setState 函數

## 測試檢查清單

在開發或修改 DataTable 組件時，請檢查以下方面：

1. 加載初始數據時是否正確顯示
2. 搜索時是否正確過濾數據
3. 切換排序時數據是否正確排序
4. 過濾時分頁是否重置到第一頁
5. 更改數據源時是否正確更新顯示

遵循這些最佳實踐可以確保 DataTable 組件高效運行，同時避免常見的性能問題和無限循環渲染。

import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/app/admin/AdminContext'
import {
  ALL_PERMISSIONS,
  getManagerPermissions,
  parsePrivileges,
} from '@/app/admin/_lib/permissions'

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

export const closePermissionDebug = () => {
  if (debugInstance) {
    debugInstance.close()
  }
}

export default function PermissionDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [permissionsCache, setPermissionsCache] = useState<string[]>([])
  const [adminState, setAdminState] = useState(null)
  const [localStorageData, setLocalStorageData] = useState<{
    [key: string]: any
  }>({})

  const {
    admin,
    cachedPermissions,
    preloadPermissions,
    hasPermission,
    isLoading,
    isAuthChecking,
  } = useAdmin()

  // 在組件掛載時設置實例方法
  useEffect(() => {
    // 設置診斷工具控制實例
    setDebugInstance({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    })

    // 清理函數
    return () => {
      setDebugInstance(null)
    }
  }, [])

  // 將當前管理員狀態保存到組件狀態中
  useEffect(() => {
    setAdminState(admin)
  }, [admin])

  // 從 localStorage 檢索所有管理員相關數據
  useEffect(() => {
    try {
      const data = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes('admin') ||
            key.includes('token') ||
            key.includes('auth'))
        ) {
          try {
            const value = localStorage.getItem(key)
            data[key] = value ? JSON.parse(value) : value
          } catch (err) {
            data[key] = localStorage.getItem(key) + ' (無法解析)'
          }
        }
      }
      setLocalStorageData(data)
    } catch (error) {
      console.error('無法讀取 localStorage 數據:', error)
    }
  }, [isOpen])

  // 在組件掛載時和依賴改變時獲取權限緩存
  useEffect(() => {
    try {
      // 嘗試從 localStorage 載入預緩存的權限列表
      const cachedPermsStr = localStorage.getItem('admin_permissions')
      if (cachedPermsStr) {
        const perms = JSON.parse(cachedPermsStr)
        if (Array.isArray(perms)) {
          setPermissionsCache(perms)
        }
      }
    } catch (error) {
      console.error('無法載入預緩存權限:', error)
    }
  }, [admin, cachedPermissions])

  // 重新載入權限
  const handleReloadPermissions = () => {
    preloadPermissions()
  }

  // 清除權限緩存
  const handleClearPermissions = () => {
    try {
      localStorage.removeItem('admin_permissions')
      setPermissionsCache([])
      alert('權限緩存已清除，請重新載入頁面以更新權限')
    } catch (error) {
      console.error('清除權限緩存失敗:', error)
    }
  }

  // 檢查管理員對象的完整性
  const checkAdminObject = () => {
    if (!admin) return '管理員未載入'

    const issues = []
    if (admin.id === undefined) issues.push('ID 缺失')
    if (admin.manager_account === undefined) issues.push('帳號缺失')
    if (admin.manager_privileges === undefined) issues.push('權限缺失')

    return issues.length ? `發現問題: ${issues.join(', ')}` : '管理員對象完整'
  }

  // 解析特定權限
  const testSpecificPermission = (perm: string) => {
    return hasPermission(perm)
  }

  // 添加權限解析分析功能
  const analyzePrivilegesString = (privilegesStr: string) => {
    if (!privilegesStr) return '權限字串為空'
    if (privilegesStr === '111') return '超級管理員權限(111)'

    try {
      // 分割原始權限字串
      const rawPermissions = privilegesStr
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      // 解析權限
      const expandedPermissions = parsePrivileges(privilegesStr)

      return (
        <div>
          <div className="alert alert-secondary small mt-2">
            <strong>原始權限列表 ({rawPermissions.length}):</strong>
            <div className="mt-1">
              {rawPermissions.map((p, i) => (
                <span key={i} className="badge bg-secondary me-1 mb-1">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="alert alert-info small mt-2">
            <strong>擴展後權限列表 ({expandedPermissions.length}):</strong>
            <div
              className="mt-1"
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              {expandedPermissions.map((p, i) => (
                <span key={i} className="badge bg-info me-1 mb-1">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    } catch (error) {
      return `解析錯誤: ${error.message}`
    }
  }

  if (!isOpen) return null

  // 計算權限覆蓋率
  const permissionCoverage =
    cachedPermissions.length > 0
      ? Math.round((cachedPermissions.length / ALL_PERMISSIONS.length) * 100)
      : 0

  return (
    <div
      className="position-fixed top-0 end-0 bottom-0 bg-light shadow-lg p-3 overflow-auto"
      style={{ width: '450px', zIndex: 1050 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">權限診斷工具</h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setIsOpen(false)}
          aria-label="關閉"
        />
      </div>

      <div className="alert alert-primary">
        <strong>系統狀態:</strong>
        <span className="ms-2">
          {isLoading ? '載入中...' : isAuthChecking ? '驗證中...' : '正常'}
        </span>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-primary text-white">管理員信息</div>
        <div className="card-body">
          <div className="alert alert-secondary small mb-2">
            狀態檢查: {checkAdminObject()}
          </div>
          <dl className="row mb-0">
            <dt className="col-sm-5">管理員 ID:</dt>
            <dd className="col-sm-7">{admin ? admin.id : '未載入'}</dd>

            <dt className="col-sm-5">管理員帳號:</dt>
            <dd className="col-sm-7">
              {admin ? admin.manager_account : '未載入'}
            </dd>

            <dt className="col-sm-5">權限字串:</dt>
            <dd className="col-sm-7">
              <code className="small">{admin?.manager_privileges || '無'}</code>
            </dd>

            <dt className="col-sm-5">是否超級管理員:</dt>
            <dd className="col-sm-7">
              {admin?.manager_privileges === '111' ? '是' : '否'}
            </dd>

            <dt className="col-sm-5">解析後權限數量:</dt>
            <dd className="col-sm-7">
              {admin?.manager_privileges
                ? getManagerPermissions(admin.manager_privileges).length
                : 0}
            </dd>
          </dl>

          {admin?.manager_privileges && (
            <div className="mt-3">
              <strong className="d-block mb-2">權限字串解析:</strong>
              {analyzePrivilegesString(admin.manager_privileges)}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-info text-white">
          <div className="d-flex justify-content-between align-items-center">
            <span>權限緩存</span>
            <div>
              <button
                className="btn btn-sm btn-light me-2"
                onClick={handleReloadPermissions}
              >
                重新載入
              </button>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleClearPermissions}
              >
                清除緩存
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-info small">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                緩存權限數量: {cachedPermissions.length} /{' '}
                {ALL_PERMISSIONS.length}
              </span>
              <span className="badge bg-info">{permissionCoverage}% 覆蓋</span>
            </div>
          </div>
          {cachedPermissions.length > 0 ? (
            <div
              className="border rounded p-2"
              style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
              <ul className="list-unstyled mb-0 small">
                {cachedPermissions.map((perm, index) => (
                  <li key={index} className="py-1 border-bottom">
                    <div className="d-flex justify-content-between">
                      <code>{perm}</code>
                      <span
                        className={
                          hasPermission(perm) ? 'text-success' : 'text-danger'
                        }
                      >
                        {hasPermission(perm) ? '✓' : '✗'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="alert alert-warning">
              權限緩存為空。可能是管理員未登入，或預載入失敗。
            </div>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-success text-white">欄位名稱檢查</div>
        <div className="card-body">
          <div className="alert alert-info small mb-2">
            <p className="mb-1">檢查資料庫欄位名稱和代碼中的欄位是否一致:</p>
          </div>
          <ul className="list-group list-group-flush small">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>manager_account</span>
              <span
                className={
                  admin?.manager_account ? 'text-success' : 'text-danger'
                }
              >
                {admin?.manager_account ? '✓' : '✗'}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>manager_privileges</span>
              <span
                className={
                  admin?.manager_privileges !== undefined
                    ? 'text-success'
                    : 'text-danger'
                }
              >
                {admin?.manager_privileges !== undefined ? '✓' : '✗'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-warning text-dark">常見權限測試</div>
        <div className="card-body">
          <div className="row g-2">
            {[
              'members:read',
              'shop:read',
              'pets:read',
              'forum:read',
              'finance:read',
              'settings:read',
              '111',
            ].map((perm) => (
              <div key={perm} className="col-6">
                <div className="card h-100">
                  <div
                    className={`card-body p-2 d-flex justify-content-between align-items-center ${
                      testSpecificPermission(perm)
                        ? 'bg-success bg-opacity-10'
                        : ''
                    }`}
                  >
                    <small>{perm}</small>
                    <span
                      className={
                        testSpecificPermission(perm)
                          ? 'text-success'
                          : 'text-danger'
                      }
                    >
                      {testSpecificPermission(perm) ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-secondary text-white">
          儲存的管理員資料
        </div>
        <div className="card-body">
          <div className="alert alert-secondary small">
            顯示相關的 localStorage 資料
          </div>
          <div
            className="border rounded p-2 small bg-light"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {Object.keys(localStorageData).length > 0 ? (
              Object.entries(localStorageData).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <strong>{key}:</strong>
                  <pre
                    className="m-0 p-1 bg-light border rounded small overflow-auto"
                    style={{ maxHeight: '100px' }}
                  >
                    {typeof value === 'string'
                      ? value
                      : JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <p className="mb-0">未找到儲存的管理員資料</p>
            )}
          </div>
        </div>
      </div>

      <div className="alert alert-secondary small">
        <strong>提示:</strong> 如果以上檢查有異常，請確認以下幾點:
        <ol className="mb-0 mt-2">
          <li>確保資料庫欄位名稱與代碼中使用的欄位名稱一致</li>
          <li>確保 JWT 中的字段與管理員模型字段一致</li>
          <li>確保 API 返回的欄位名稱正確</li>
          <li>檢查 localStorage 中緩存的管理員信息</li>
          <li>確認 preloadPermissions 函數是否正確執行</li>
        </ol>
      </div>
    </div>
  )
}

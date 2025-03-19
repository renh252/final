/**
 * 後台管理系統權限定義
 * 此文件定義了系統中所有可用的權限代碼，用於權限檢查和預緩存
 */

// 所有可能的權限列表
export const ALL_PERMISSIONS = [
  // 會員管理權限
  'members:read',
  'members:write',
  'members:delete',

  // 商城管理權限
  'shop:read',
  'shop:write',
  'shop:delete',
  'shop:products:read',
  'shop:products:write',
  'shop:products:delete',
  'shop:orders:read',
  'shop:orders:write',
  'shop:orders:delete',
  'shop:categories:read',
  'shop:categories:write',
  'shop:categories:delete',
  'shop:promotions:read',
  'shop:promotions:write',
  'shop:promotions:delete',

  // 寵物管理權限
  'pets:read',
  'pets:write',
  'pets:delete',
  'pets:categories:read',
  'pets:categories:write',
  'pets:categories:delete',
  'pets:appointments:read',
  'pets:appointments:write',
  'pets:appointments:delete',

  // 論壇管理權限
  'forum:read',
  'forum:write',
  'forum:delete',
  'forum:articles:read',
  'forum:articles:write',
  'forum:articles:delete',
  'forum:categories:read',
  'forum:categories:write',
  'forum:categories:delete',
  'forum:reports:read',
  'forum:reports:write',
  'forum:reports:delete',

  // 金流管理權限
  'finance:read',
  'finance:write',
  'finance:delete',
  'finance:transactions:read',
  'finance:transactions:write',
  'finance:transactions:delete',
  'finance:payments:read',
  'finance:payments:write',
  'finance:payments:delete',
  'finance:reports:read',

  // 系統設定權限
  'settings:read',
  'settings:write',
  'settings:delete',
  'settings:roles:read',
  'settings:roles:write',
  'settings:roles:delete',
  'settings:logs:read',
  // 特殊權限代碼
  '111', // 超級管理員
]

// 權限組映射表 - 將較高級別的權限映射到具體的細分權限
export const PERMISSION_GROUPS = {
  // 會員管理權限組
  'members:read': ['members:read'],
  'members:write': ['members:read', 'members:write'],
  'members:delete': ['members:read', 'members:write', 'members:delete'],

  // 商城管理權限組
  'shop:read': [
    'shop:read',
    'shop:products:read',
    'shop:orders:read',
    'shop:categories:read',
    'shop:promotions:read',
  ],
  'shop:write': [
    'shop:read',
    'shop:write',
    'shop:products:read',
    'shop:products:write',
    'shop:orders:read',
    'shop:orders:write',
    'shop:categories:read',
    'shop:categories:write',
    'shop:promotions:read',
    'shop:promotions:write',
  ],
  'shop:delete': [
    'shop:read',
    'shop:write',
    'shop:delete',
    'shop:products:read',
    'shop:products:write',
    'shop:products:delete',
    'shop:orders:read',
    'shop:orders:write',
    'shop:orders:delete',
    'shop:categories:read',
    'shop:categories:write',
    'shop:categories:delete',
    'shop:promotions:read',
    'shop:promotions:write',
    'shop:promotions:delete',
  ],

  // 寵物管理權限組
  'pets:read': ['pets:read', 'pets:categories:read', 'pets:appointments:read'],
  'pets:write': [
    'pets:read',
    'pets:write',
    'pets:categories:read',
    'pets:categories:write',
    'pets:appointments:read',
    'pets:appointments:write',
  ],
  'pets:delete': [
    'pets:read',
    'pets:write',
    'pets:delete',
    'pets:categories:read',
    'pets:categories:write',
    'pets:categories:delete',
    'pets:appointments:read',
    'pets:appointments:write',
    'pets:appointments:delete',
  ],

  // 論壇管理權限組
  'forum:read': [
    'forum:read',
    'forum:articles:read',
    'forum:categories:read',
    'forum:reports:read',
  ],
  'forum:write': [
    'forum:read',
    'forum:write',
    'forum:articles:read',
    'forum:articles:write',
    'forum:categories:read',
    'forum:categories:write',
    'forum:reports:read',
    'forum:reports:write',
  ],
  'forum:delete': [
    'forum:read',
    'forum:write',
    'forum:delete',
    'forum:articles:read',
    'forum:articles:write',
    'forum:articles:delete',
    'forum:categories:read',
    'forum:categories:write',
    'forum:categories:delete',
    'forum:reports:read',
    'forum:reports:write',
    'forum:reports:delete',
  ],

  // 金流管理權限組
  'finance:read': [
    'finance:read',
    'finance:transactions:read',
    'finance:payments:read',
    'finance:reports:read',
  ],
  'finance:write': [
    'finance:read',
    'finance:write',
    'finance:transactions:read',
    'finance:transactions:write',
    'finance:payments:read',
    'finance:payments:write',
    'finance:reports:read',
  ],
  'finance:delete': [
    'finance:read',
    'finance:write',
    'finance:delete',
    'finance:transactions:read',
    'finance:transactions:write',
    'finance:transactions:delete',
    'finance:payments:read',
    'finance:payments:write',
    'finance:payments:delete',
    'finance:reports:read',
  ],

  // 系統設定權限組
  'settings:read': [
    'settings:read',
    'settings:roles:read',
    'settings:logs:read',
  ],
  'settings:write': [
    'settings:read',
    'settings:write',
    'settings:roles:read',
    'settings:roles:write',
    'settings:logs:read',
  ],
  'settings:delete': [
    'settings:read',
    'settings:write',
    'settings:delete',
    'settings:roles:read',
    'settings:roles:write',
    'settings:roles:delete',
    'settings:logs:read',
  ],

  // 特殊權限代碼映射
  '111': ALL_PERMISSIONS, // 超級管理員有所有權限
}

// 用於跟踪已經警告過的權限格式
const warnedPrivileges = new Set<string>()

// 權限別名映射，用於相容舊版權限
const PERMISSION_ALIASES = {
  // 已移除coupon相關別名，完全使用promotion
}

// 檢查管理員是否有特定權限
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

  // 獲取該管理員的所有權限
  let adminPermissions = privileges.split(',')

  // 轉換為數組以便統一處理
  const required = Array.isArray(requiredPrivilege)
    ? requiredPrivilege
    : [requiredPrivilege]

  // 檢查每個需要的權限
  return required.some((permission) => {
    // 檢查直接匹配
    if (adminPermissions.includes(permission)) {
      return true
    }

    // 檢查權限別名（如果有）
    const aliases = PERMISSION_ALIASES[permission]
    if (aliases && aliases.length > 0) {
      return aliases.some((alias) => adminPermissions.includes(alias))
    }

    // 從整個權限層級中尋找對應的權限集
    if (PERMISSION_GROUPS[permission]) {
      // 檢查此權限組的每個權限
      const subPermissions = PERMISSION_GROUPS[permission]
      return subPermissions.some((p) => adminPermissions.includes(p))
    }

    return false
  })
}

// 從原始權限字串解析並標準化權限
export function parsePrivileges(privilegesStr: string): string[] {
  if (!privilegesStr) return []
  if (privilegesStr === '111') return ALL_PERMISSIONS

  try {
    // 對於已知的舊格式，直接返回對應的權限
    if (privilegesStr === 'donation') {
      return ['donation', 'finance:read', 'finance:transactions:read']
    }

    if (privilegesStr === 'general') {
      return ['general', 'members:read', 'shop:read']
    }

    // 分割原始權限字串，僅支持逗號作為分隔符
    const rawPermissions = privilegesStr
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p) // 過濾掉空字符串

    const parsedPermissions = new Set<string>()

    // 處理每個權限，僅支持新格式（帶冒號的）
    rawPermissions.forEach((perm) => {
      // 添加原始權限
      parsedPermissions.add(perm)

      // 如果有權限組，自動添加權限組中的所有子權限
      if (PERMISSION_GROUPS[perm]) {
        PERMISSION_GROUPS[perm].forEach((p) => parsedPermissions.add(p))
      }

      // 如果找到權限並帶有冒號，說明是標準格式，考慮擴展頂層權限
      if (perm.includes(':') && ALL_PERMISSIONS.includes(perm)) {
        // 特殊權限擴展：如果有頂層權限，自動添加所有子權限
        const permPrefix = perm.split(':')[0] + ':'
        ALL_PERMISSIONS.forEach((p) => {
          if (
            p !== perm &&
            p.startsWith(permPrefix) &&
            !parsedPermissions.has(p)
          ) {
            parsedPermissions.add(p)
          }
        })
      }
    })

    return Array.from(parsedPermissions)
  } catch (error) {
    console.error('解析權限字串失敗:', error)
    return []
  }
}

// 根據給定權限列表擴展所有相關權限
export function expandPermissions(permissions: string[]): string[] {
  const expanded = new Set<string>()

  permissions.forEach((perm) => {
    // 添加原始權限
    expanded.add(perm)

    // 如果是權限組，添加所有子權限
    if (PERMISSION_GROUPS[perm]) {
      PERMISSION_GROUPS[perm].forEach((p) => expanded.add(p))
    }
  })

  return Array.from(expanded)
}

// 獲取超級管理員的所有權限
export function getSuperAdminPermissions(): string[] {
  return ALL_PERMISSIONS
}

/**
 * 獲取管理員權限 - 根據權限字串返回權限列表
 * @param privileges 管理員權限字串
 * @returns 權限列表
 */
export function getManagerPermissions(
  privileges: string | undefined
): string[] {
  // 超級管理員 - 擁有所有權限
  if (privileges === '111') {
    return ALL_PERMISSIONS
  }

  // 空值處理 - 返回空陣列
  if (!privileges) {
    return []
  }

  try {
    // 特殊處理舊格式
    if (privileges === 'donation') {
      return ['donation', 'finance:read', 'finance:transactions:read']
    }

    if (privileges === 'general') {
      return ['general', 'members:read', 'shop:read']
    }

    // 直接使用parsePrivileges函數解析權限
    return parsePrivileges(privileges)
  } catch (error) {
    console.error('解析權限時發生錯誤:', error)
    return []
  }
}

// 將權限代碼轉換為人類可讀的描述
export function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    'members:read': '查看會員資料',
    'members:write': '編輯會員資料',
    'members:delete': '刪除會員資料',

    'shop:read': '查看商城資料',
    'shop:write': '編輯商城資料',
    'shop:delete': '刪除商城資料',

    'pets:read': '查看寵物資料',
    'pets:write': '編輯寵物資料',
    'pets:delete': '刪除寵物資料',

    'forum:read': '查看論壇資料',
    'forum:write': '編輯論壇資料',
    'forum:delete': '刪除論壇資料',

    'finance:read': '查看金流資料',
    'finance:write': '編輯金流資料',
    'finance:delete': '刪除金流資料',

    'settings:read': '查看系統設定',
    'settings:write': '編輯系統設定',
    'settings:delete': '刪除系統設定',

    '111': '超級管理員',
  }

  return descriptions[permission] || permission
}

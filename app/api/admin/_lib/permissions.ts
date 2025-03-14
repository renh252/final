// 權限常數定義
export const PERMISSIONS = {
  // 會員管理權限
  MEMBERS: {
    READ: 'members:read',
    WRITE: 'members:write',
    DELETE: 'members:delete',
  },

  // 寵物管理權限
  PETS: {
    READ: 'pets:read',
    WRITE: 'pets:write',
    DELETE: 'pets:delete',
  },

  // 商城管理權限
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

  // 論壇管理權限
  FORUM: {
    READ: 'forum:read',
    WRITE: 'forum:write',
    DELETE: 'forum:delete',
    REPORTS: {
      READ: 'forum:reports:read',
      WRITE: 'forum:reports:write',
    },
  },

  // 金流管理權限
  FINANCE: {
    READ: 'finance:read',
    WRITE: 'finance:write',
    REPORTS: {
      READ: 'finance:reports:read',
    },
  },

  // 系統設定權限
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

// 權限組定義
export const PERMISSION_GROUPS = {
  // 超級管理員
  SUPER_ADMIN: '111',

  // 一般管理員
  ADMIN: [
    PERMISSIONS.MEMBERS.READ,
    PERMISSIONS.MEMBERS.WRITE,
    PERMISSIONS.PETS.READ,
    PERMISSIONS.PETS.WRITE,
    PERMISSIONS.SHOP.READ,
    PERMISSIONS.SHOP.WRITE,
    PERMISSIONS.FORUM.READ,
    PERMISSIONS.FORUM.WRITE,
    PERMISSIONS.FINANCE.READ,
    PERMISSIONS.SETTINGS.READ,
  ].join(','),

  // 編輯者
  EDITOR: [
    PERMISSIONS.PETS.READ,
    PERMISSIONS.PETS.WRITE,
    PERMISSIONS.SHOP.PRODUCTS.READ,
    PERMISSIONS.SHOP.PRODUCTS.WRITE,
    PERMISSIONS.FORUM.READ,
    PERMISSIONS.FORUM.WRITE,
  ].join(','),

  // 檢視者
  VIEWER: [
    PERMISSIONS.PETS.READ,
    PERMISSIONS.SHOP.READ,
    PERMISSIONS.FORUM.READ,
    PERMISSIONS.FINANCE.READ,
  ].join(','),
}

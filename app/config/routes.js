/**
 * 路由配置文件 - 簡化版本，只區分公開和需要認證的頁面
 */

// 頁面類型分類
const RouteType = {
  PUBLIC: 'public', // 公開頁面，無需登入
  PROTECTED: 'protected', // 受保護頁面，需要登入
}

// 路由配置表 - 只需指定路徑和類型
const routes = [
  // 公開頁面
  { path: '/', type: RouteType.PUBLIC }, // 首頁
  { path: '/member/MemberLogin', type: RouteType.PUBLIC }, // 會員登入相關頁面
  { path: '/pets', type: RouteType.PUBLIC }, // 寵物列表
  { path: '/shop', type: RouteType.PUBLIC }, // 商店首頁
  { path: '/shop/categories', type: RouteType.PUBLIC }, // 商品分類
  { path: '/forum', type: RouteType.PUBLIC }, // 論壇首頁
  { path: '/donate', type: RouteType.PUBLIC }, // 捐贈頁面

  // 受保護頁面
  { path: '/member', type: RouteType.PROTECTED }, // 會員中心
  { path: '/shop/cart', type: RouteType.PROTECTED }, // 購物車
  { path: '/shop/checkout', type: RouteType.PROTECTED }, // 結帳
]

/**
 * 獲取特定類型的路徑列表
 */
const getRoutesByType = (type) => {
  return routes
    .filter((route) => route.type === type)
    .map((route) => route.path)
}

// 導出預定義路徑列表
export const publicPaths = getRoutesByType(RouteType.PUBLIC)
export const protectedPaths = getRoutesByType(RouteType.PROTECTED)

/**
 * 檢查路徑是否需要認證 (智能版本)
 * @param {string} pathname 當前路徑
 * @returns {boolean} 是否需要認證
 */
export const requiresAuth = (pathname) => {
  // 特殊情況處理：如果是登入頁面直接返回 false
  if (pathname.startsWith('/member/MemberLogin')) {
    return false
  }

  // 一、檢查是否匹配公開頁面
  // 1. 完全匹配
  if (publicPaths.includes(pathname)) {
    return false
  }

  // 2. 檢查是否是公開頁面的子路徑
  const isPublicPathChild = publicPaths.some((path) =>
    // 確保匹配完整路徑段，例如 /pets/ 匹配 /pets/123 但不匹配 /pets-abc
    pathname.startsWith(path + '/')
  )

  if (isPublicPathChild) {
    return false
  }

  // 二、檢查是否匹配保護頁面
  // 1. 完全匹配受保護頁面
  if (protectedPaths.includes(pathname)) {
    return true
  }

  // 2. 檢查是否是受保護頁面的子路徑
  const isProtectedPathChild = protectedPaths.some((path) =>
    pathname.startsWith(path + '/')
  )

  if (isProtectedPathChild) {
    return true
  }

  // 三、處理複雜的動態路由情況
  // 提取路徑段進行比較
  const pathSegments = pathname.split('/').filter(Boolean)

  // 對於像 /pets/123 這樣的路徑，判斷前綴(/pets)是否在公開路徑中
  if (pathSegments.length > 1) {
    const basePathWithoutId = `/${pathSegments[0]}`
    if (publicPaths.includes(basePathWithoutId)) {
      return false
    }

    // 檢查更長的路徑，如 /shop/categories/123
    if (pathSegments.length > 2) {
      const longerBasePath = `/${pathSegments[0]}/${pathSegments[1]}`
      if (publicPaths.includes(longerBasePath)) {
        return false
      }
    }
  }

  // 預設策略：不在白名單中的路徑需要認證
  return true
}

// 導出路由類型枚舉
export { RouteType }

// 導出所有路由配置
export default routes

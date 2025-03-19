import {
  ALLOWED_TAGS,
  ALLOWED_ATTRIBUTES,
  ALLOWED_CSS,
  ALLOWED_URL_PROTOCOLS,
} from './dom-whitelist'

/**
 * 淨化HTML內容，移除潛在的惡意代碼或不安全的HTML元素
 * @param {string} html 原始HTML字串
 * @returns {string} 淨化後的HTML字串
 */
export function sanitizeHtml(html) {
  if (!html) return ''

  // 對於空白字串或非字串類型直接返回空字串
  if (typeof html !== 'string') return ''

  // 創建一個暫時的DOM元素來解析HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(
    `<div id="sanitize-wrapper">${html}</div>`,
    'text/html'
  )
  const wrapper = doc.getElementById('sanitize-wrapper')

  // 遞迴清理DOM節點
  sanitizeNode(wrapper)

  // 返回清理後的HTML
  return wrapper.innerHTML
}

/**
 * 遞迴清理DOM節點及其所有子節點
 * @param {Node} node DOM節點
 */
function sanitizeNode(node) {
  // 獲取所有子節點的複本(因為在迭代過程中可能會刪除節點)
  const childNodes = Array.from(node.childNodes)

  // 深度優先遍歷，先處理所有子節點
  childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      // 元素節點
      if (!ALLOWED_TAGS.includes(child.tagName.toLowerCase())) {
        // 不在白名單中的標籤，保留內容但移除標籤
        const fragment = document.createDocumentFragment()
        while (child.firstChild) {
          fragment.appendChild(child.firstChild)
        }
        node.replaceChild(fragment, child)
      } else {
        // 清理屬性
        sanitizeAttributes(child)

        // 繼續清理子節點
        sanitizeNode(child)
      }
    } else if (child.nodeType === 8) {
      // 註釋節點
      // 移除所有註釋
      node.removeChild(child)
    }
  })
}

/**
 * 清理元素的屬性
 * @param {Element} element DOM元素
 */
function sanitizeAttributes(element) {
  const tagName = element.tagName.toLowerCase()
  const attributesToRemove = []

  // 收集需要移除的屬性
  for (const attr of element.attributes) {
    const attrName = attr.name.toLowerCase()

    // 檢查是否為允許的通用屬性或特定標籤的屬性
    const isAllowedForAll = ALLOWED_ATTRIBUTES['*']?.includes(attrName)
    const isAllowedForTag = ALLOWED_ATTRIBUTES[tagName]?.includes(attrName)

    if (!isAllowedForAll && !isAllowedForTag) {
      attributesToRemove.push(attrName)
    } else if (attrName === 'style') {
      // 特殊處理style屬性
      sanitizeStyle(element)
    } else if (['src', 'href', 'xlink:href'].includes(attrName)) {
      // 特殊處理URL屬性
      sanitizeUrl(element, attrName)
    }
  }

  // 移除不安全的屬性
  attributesToRemove.forEach((attrName) => {
    element.removeAttribute(attrName)
  })
}

/**
 * 清理URL屬性
 * @param {Element} element DOM元素
 * @param {string} attrName 屬性名稱
 */
function sanitizeUrl(element, attrName) {
  const url = element.getAttribute(attrName)
  if (!url) return

  try {
    // 嘗試解析URL
    const urlObj = new URL(url, window.location.href)
    const protocol = urlObj.protocol.toLowerCase()

    // 檢查URL協議是否在白名單中
    if (!ALLOWED_URL_PROTOCOLS.includes(protocol)) {
      element.removeAttribute(attrName)
    }
  } catch (e) {
    // 無效URL，移除屬性
    if (
      !url.startsWith('/') &&
      !url.startsWith('#') &&
      !url.startsWith('./') &&
      !url.startsWith('../')
    ) {
      element.removeAttribute(attrName)
    }
  }
}

/**
 * 清理style屬性
 * @param {Element} element DOM元素
 */
function sanitizeStyle(element) {
  const style = element.getAttribute('style')
  if (!style) return

  // 解析CSS屬性
  const declarations = style
    .split(';')
    .filter(Boolean)
    .map((declaration) => {
      const [property, ...valueParts] = declaration.split(':')
      return {
        property: property.trim().toLowerCase(),
        value: valueParts.join(':').trim(),
      }
    })

  // 過濾安全的CSS屬性
  const safeDeclarations = declarations.filter(
    ({ property }) =>
      ALLOWED_CSS.includes(property) &&
      !property.startsWith('--') && // 排除CSS變數
      !property.includes('expression') // 排除CSS表達式
  )

  // 重新組合安全的style屬性
  if (safeDeclarations.length > 0) {
    const safeStyle = safeDeclarations
      .map(({ property, value }) => `${property}: ${value}`)
      .join('; ')

    element.setAttribute('style', safeStyle)
  } else {
    element.removeAttribute('style')
  }
}

/**
 * 簡單檢測HTML是否包含可疑代碼
 * @param {string} html HTML字串
 * @returns {boolean} 是否包含可疑代碼
 */
export function containsSuspiciousCode(html) {
  if (!html) return false

  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // <script>標籤
    /javascript\s*:/gi, // javascript:協議
    /data\s*:/gi, // data:協議
    /on\w+\s*=/gi, // 事件處理程序
    /eval\s*\(/gi, // eval()函數
    /expression\s*\(/gi, // CSS表達式
  ]

  return suspiciousPatterns.some((pattern) => pattern.test(html))
}

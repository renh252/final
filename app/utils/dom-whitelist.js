/**
 * 允許的HTML標籤白名單
 */
export const ALLOWED_TAGS = [
  // 標題與段落
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',

  // 格式化
  'b',
  'strong',
  'i',
  'em',
  'u',
  'del',
  'strike',
  'code',
  'pre',

  // 列表
  'ul',
  'ol',
  'li',

  // 表格
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',

  // 其他
  'a',
  'br',
  'hr',
  'div',
  'span',
  'blockquote',
  'img',
]

/**
 * 允許的HTML屬性白名單
 */
export const ALLOWED_ATTRIBUTES = {
  // 所有元素允許的通用屬性
  '*': ['class', 'id', 'style'],

  // 連結特定屬性
  a: ['href', 'target', 'rel', 'title'],

  // 圖片特定屬性
  img: ['src', 'alt', 'title', 'width', 'height'],

  // 表格特定屬性
  table: ['border', 'cellpadding', 'cellspacing', 'width'],
  th: ['scope', 'colspan', 'rowspan', 'width'],
  td: ['colspan', 'rowspan', 'width'],
}

/**
 * 允許的CSS屬性白名單
 */
export const ALLOWED_CSS = [
  'color',
  'background-color',
  'text-align',
  'font-size',
  'font-weight',
  'margin',
  'padding',
  'border',
  'width',
  'height',
  'max-width',
  'max-height',
  'display',
  'font-style',
  'text-decoration',
  'line-height',
]

/**
 * 允許的URL協議白名單
 */
export const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']

import Cookies from 'js-cookie'

// 引入 fetch 相關的類型定義
type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
type RequestMode = 'cors' | 'no-cors' | 'same-origin' | 'navigate'
type RequestCredentials = 'omit' | 'same-origin' | 'include'
type RequestCache =
  | 'default'
  | 'no-store'
  | 'reload'
  | 'no-cache'
  | 'force-cache'
  | 'only-if-cached'
type RequestRedirect = 'follow' | 'error' | 'manual'
type ReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

// 定義 RequestInit 接口
interface RequestInit {
  method?: RequestMethod | string
  headers?: Record<string, string>
  body?: any
  mode?: RequestMode
  credentials?: RequestCredentials
  cache?: RequestCache
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  integrity?: string
  keepalive?: boolean
  signal?: AbortSignal
}

// 定義我們的 API 選項接口
interface FetchApiOptions {
  method?: RequestMethod | string
  headers?: Record<string, string>
  body?: any | FormData | string
  mode?: RequestMode
  credentials?: RequestCredentials
  cache?: RequestCache
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  integrity?: string
  keepalive?: boolean
  signal?: AbortSignal
}

export async function fetchApi(
  url: string,
  options: FetchApiOptions = {}
): Promise<any> {
  try {
    // 從 cookie 中獲取 token
    const token = Cookies.get('admin_token')

    // 設置請求頭
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    // 如果有 token，添加到請求頭
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 如果是 FormData，移除 Content-Type 頭
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    }

    // 準備請求選項
    const fetchOptions: RequestInit = {}

    // 添加方法
    if (options.method) {
      fetchOptions.method = options.method
    }

    // 添加標頭
    fetchOptions.headers = headers

    // 添加主體
    if (options.body !== undefined) {
      fetchOptions.body =
        options.body instanceof FormData
          ? options.body
          : typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)
    }

    // 添加其他選項
    if (options.credentials) fetchOptions.credentials = options.credentials
    if (options.mode) fetchOptions.mode = options.mode
    if (options.cache) fetchOptions.cache = options.cache
    if (options.redirect) fetchOptions.redirect = options.redirect
    if (options.referrer) fetchOptions.referrer = options.referrer
    if (options.referrerPolicy)
      fetchOptions.referrerPolicy = options.referrerPolicy
    if (options.integrity) fetchOptions.integrity = options.integrity
    if (options.keepalive !== undefined)
      fetchOptions.keepalive = options.keepalive
    if (options.signal) fetchOptions.signal = options.signal

    // 發送請求
    const response = await fetch(url, fetchOptions)

    // 處理響應
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    // 解析響應數據
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API 請求失敗:', error)
    throw error
  }
}

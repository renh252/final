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

    // 調試信息 - 發送請求前
    console.log(`[fetchApi] 發送請求到: ${url}`, {
      method: fetchOptions.method || 'GET',
      headers: fetchOptions.headers,
      bodyType: options.body
        ? options.body instanceof FormData
          ? 'FormData'
          : typeof options.body
        : 'undefined',
    })

    // 發送請求
    const response = await fetch(url, fetchOptions)

    // 調試信息 - 收到響應
    console.log(`[fetchApi] 收到響應: ${url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // 處理響應
    if (!response.ok) {
      // 嘗試解析錯誤響應
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`

      try {
        // 嘗試獲取JSON錯誤信息
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage =
              typeof errorData.error === 'string'
                ? errorData.error
                : JSON.stringify(errorData.error)
          }
        } else {
          // 非JSON響應，嘗試獲取文本
          const textError = await response.text()
          if (textError) {
            errorMessage = textError
            errorData = { text: textError }
          }
        }
      } catch (parseError) {
        console.error('[fetchApi] 解析錯誤響應失敗:', parseError)
      }

      // 詳細記錄錯誤
      console.error(`[fetchApi] 請求失敗: ${url}`, {
        status: response.status,
        message: errorMessage,
        data: errorData,
      })

      throw new Error(errorMessage)
    }

    // 解析響應數據
    try {
      // 檢查內容類型
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return data
      } else {
        // 非JSON響應，先嘗試獲取文本
        const text = await response.text()

        // 如果文本看起來像JSON，嘗試解析
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            return JSON.parse(text)
          } catch (jsonError) {
            console.warn('[fetchApi] 文本看起來像JSON但解析失敗:', jsonError)
          }
        }

        // 返回文本響應
        console.warn(`[fetchApi] 收到非JSON響應: ${contentType}`)
        return { success: true, text, _nonJson: true }
      }
    } catch (parseError) {
      console.error('[fetchApi] 解析響應數據失敗:', parseError)
      throw new Error(`解析響應數據失敗: ${parseError.message}`)
    }
  } catch (error) {
    console.error('[fetchApi] 請求失敗:', error)
    throw error
  }
}

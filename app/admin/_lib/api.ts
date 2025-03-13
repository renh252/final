import Cookies from 'js-cookie'

interface FetchApiOptions extends RequestInit {
  body?: any
}

export async function fetchApi(
  url: string,
  options: FetchApiOptions = {}
): Promise<any> {
  try {
    // 從 cookie 中獲取 token
    const token = Cookies.get('admin_token')

    // 設置請求頭
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // 如果有 token，添加到請求頭
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // 如果是 FormData，移除 Content-Type 頭
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    }

    // 發送請求
    const response = await fetch(url, {
      ...options,
      headers,
    })

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

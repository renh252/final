import { NextResponse } from 'next/server'
import { verifyJwtToken } from '@/app/utils/auth' // 假設有此工具函數
import { sanitizeHtml } from '@/app/utils/sanitize' // 假設有此工具函數

// 模擬資料庫 - 用戶草稿
const drafts = new Map()

// 取得當前用戶的草稿
export async function GET(request) {
  try {
    // 驗證用戶身份
    const token = request.cookies.get('token')?.value
    const userData = await verifyJwtToken(token)

    if (!userData) {
      return NextResponse.json(
        { message: '未登入或session已過期' },
        { status: 401 }
      )
    }

    // 查找該用戶的草稿
    const draft = drafts.get(userData.id) || {
      title: '',
      category: '1',
      content: '',
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('取得草稿失敗:', error)
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}

// 儲存草稿
export async function POST(request) {
  try {
    // 驗證用戶身份
    const token = request.cookies.get('token')?.value
    const userData = await verifyJwtToken(token)

    if (!userData) {
      return NextResponse.json(
        { message: '未登入或session已過期' },
        { status: 401 }
      )
    }

    // 解析請求資料
    const data = await request.json()

    // 儲存草稿
    drafts.set(userData.id, {
      title: data.title || '',
      category: data.category || '1',
      content: data.content ? sanitizeHtml(data.content) : '',
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ message: '草稿已儲存' })
  } catch (error) {
    console.error('儲存草稿失敗:', error)
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}

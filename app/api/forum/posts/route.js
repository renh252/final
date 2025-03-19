import { NextResponse } from 'next/server'
import { verifyJwtToken } from '@/app/utils/auth' // 假設有此工具函數
import { sanitizeHtml } from '@/app/utils/sanitize' // 假設有此工具函數
import { v4 as uuidv4 } from 'uuid'

// 模擬資料庫
let posts = []
let drafts = new Map()

// 參數驗證
function validatePostData(data) {
  const { title, category, content } = data
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return '標題不能少於3個字元'
  }
  if (!category) {
    return '請選擇分類'
  }
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    return '內容不能少於10個字元'
  }
  return null
}

// 取得所有文章
export async function GET() {
  return NextResponse.json(posts)
}

// 新增文章
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

    // 驗證資料
    const validationError = validatePostData(data)
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 })
    }

    // 消毒HTML內容，防止XSS攻擊
    const sanitizedContent = sanitizeHtml(data.content)

    // 建立新文章
    const newPost = {
      id: uuidv4(),
      title: data.title.trim(),
      category: data.category,
      content: sanitizedContent,
      author: {
        id: userData.id,
        name: userData.name || 'Anonymous',
        avatar: userData.avatar || '/default-avatar.png',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      likes: 0,
      views: 0,
    }

    // 儲存文章
    posts.unshift(newPost)

    // 清除該用戶的草稿
    drafts.delete(userData.id)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('新增文章失敗:', error)
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}

// 更新指定ID的文章
export async function PUT(request, { params }) {
  try {
    const postId = params.id
    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 })
    }

    // 驗證用戶身份
    const token = request.cookies.get('token')?.value
    const userData = await verifyJwtToken(token)

    if (!userData || post.author.id !== userData.id) {
      return NextResponse.json({ message: '無權限編輯此文章' }, { status: 403 })
    }

    // 解析請求資料
    const data = await request.json()

    // 驗證資料
    const validationError = validatePostData(data)
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 })
    }

    // 消毒HTML內容，防止XSS攻擊
    const sanitizedContent = sanitizeHtml(data.content)

    // 更新文章
    post.title = data.title.trim()
    post.category = data.category
    post.content = sanitizedContent
    post.updatedAt = new Date().toISOString()

    return NextResponse.json(post)
  } catch (error) {
    console.error('更新文章失敗:', error)
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}

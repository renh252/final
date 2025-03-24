import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils'

// GET /api/forum/posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'latest'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 使用字串陣列來收集條件，避免類型錯誤
    const conditions: string[] = []
    if (category) {
      conditions.push(`p.category_id = ${parseInt(category)}`)
    }
    if (search) {
      const safeSearch = search.replace(/'/g, "''")
      conditions.push(`(p.title LIKE '%${safeSearch}%' OR p.content LIKE '%${safeSearch}%')`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 排序條件
    let orderClause = ''
    switch (sort) {
      case 'hot':
        orderClause = 'ORDER BY p.view_count DESC, p.created_at DESC'
        break
      case 'latest':
      default:
        orderClause = 'ORDER BY p.created_at DESC'
        break
    }

    // 簡化計數查詢
    const countQuery = `
      SELECT COUNT(*) as total
      FROM forum_posts p
      ${whereClause}
    `

    const [countResult] = (await executeQuery(countQuery)) as any[]
    const total = countResult.total
    const totalPages = Math.ceil(total / limit)

    // 簡化文章查詢
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        p.view_count,
        p.like_count,
        p.comment_count,
        p.user_id,
        p.category_id
      FROM forum_posts p
      ${whereClause}
      ${orderClause}
      LIMIT ${offset}, ${limit}
    `

    // 獲取文章列表
    let posts = (await executeQuery(postsQuery)) as any[]

    // 在 JavaScript 中添加默認值，而不是在 SQL 中
    posts = posts.map((post) => ({
      ...post,
      author_name: '烏薩奇',
      author_avatar: '',
      category_name: '熱門標籤',
      tags: '',
    }))

    // 返回結果
    const responseData = {
      status: 'success',
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}

// POST /api/forum/posts
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content, categoryId, tags } = body

    // 基本驗證
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        {
          status: 'error',
          message: '請填寫所有必要欄位',
        },
        { status: 400 }
      )
    }

    // 使用預設用戶ID (1) 作為示範
    const userId = 1

    // 簡化：只插入到 forum_posts 資料表
    const insertPostQuery = `
      INSERT INTO forum_posts (title, content, user_id, category_id)
      VALUES (?, ?, ?, ?)
    `

    // 執行插入操作
    const postResult = await executeQuery(insertPostQuery, [
      title,
      content,
      userId,
      categoryId
    ]) as any
    
    const postId = postResult.insertId

    // 處理標籤 - 只有當資料庫中有 forum_tags 和 forum_post_tags 資料表時才執行
    try {
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // 為每個標籤創建記錄
        for (const tagName of tags) {
          // 先檢查標籤是否存在
          const checkTagQuery = `SELECT id FROM forum_tags WHERE name = ?`
          const existingTags = await executeQuery(checkTagQuery, [tagName]) as any[]
          
          let tagId
          
          if (existingTags.length > 0) {
            // 標籤已存在，使用現有ID
            tagId = existingTags[0].id
          } else {
            // 創建新標籤
            const insertTagQuery = `INSERT INTO forum_tags (name, slug, created_at) VALUES (?, ?, NOW())`
            const tagResult = await executeQuery(insertTagQuery, [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]) as any
            tagId = tagResult.insertId
          }
          
          // 關聯標籤與文章
          const insertPostTagQuery = `INSERT INTO forum_post_tags (post_id, tag_id) VALUES (?, ?)`
          await executeQuery(insertPostTagQuery, [postId, tagId])
        }
      }
    } catch (tagError) {
      console.error('處理標籤時出錯，但文章已成功創建:', tagError)
      // 不阻止文章創建，即使標籤處理失敗
    }

    // 簡化：直接返回已知數據，不再查詢資料庫
    const newPost = {
      id: postId,
      title,
      content,
      user_id: userId,
      category_id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      author_name: '用戶',
      author_avatar: '',
      category_name: '分類',
      tags: Array.isArray(tags) ? tags.join(',') : ''
    }

    return NextResponse.json({
      status: 'success',
      data: newPost,
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}

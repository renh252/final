import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils'
import { auth } from '@/lib/auth'

// 偵錯函數：輸出完整的 SQL 語法和參數
function debugSQL(query: string, params: any[]) {
  // 替換所有的 ? 為實際參數值
  let debugQuery = query
  params.forEach((param) => {
    debugQuery = debugQuery.replace('?', typeof param === 'string' ? `'${param}'` : param)
  })
  console.log('=== Debug SQL Query ===')
  console.log('Query:', debugQuery)
  console.log('Parameters:', params)
  console.log('=====================')
  return debugQuery
}

// GET /api/forum/posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    // 注意：tags 參數目前沒有使用，但保留以便將來擴充功能
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    // 注意：sort 參數目前只支援 latest 和 oldest
    const sort = searchParams.get('sort') || 'latest'
    const search = searchParams.get('search')

    const offset = (page - 1) * limit
    
    // 使用直接的數值而不是參數佔位符
    let query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        u.nickname as author_name,
        u.avatar as author_avatar
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1 = 1
    `

    const conditions: string[] = []

    if (category && category !== 'all') {
      conditions.push(`p.category_id = '${category}'`)
    }

    if (search) {
      conditions.push(`(p.title LIKE '%${search}%' OR p.content LIKE '%${search}%')`)
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`
    }

    // 根據 sort 參數排序
    if (sort === 'latest') {
      query += ` ORDER BY p.created_at DESC`
    } else if (sort === 'oldest') {
      query += ` ORDER BY p.created_at ASC`
    }

    query += `
      LIMIT ${limit} OFFSET ${offset}
    `

    // 在執行查詢前先偵錯
    debugSQL(query, [])

    const posts = await executeQuery(query, []) as any[]

    // 獲取每篇文章的評論數和點讚數
    for (const post of posts) {
      const likeResults = await executeQuery(
        `SELECT COUNT(*) as count FROM forum_likes WHERE post_id = ${post.id}`,
        []
      ) as any[]
      post.like_count = likeResults[0].count

      const commentResults = await executeQuery(
        `SELECT COUNT(*) as count FROM forum_comments WHERE post_id = ${post.id}`,
        []
      ) as any[]
      post.comment_count = commentResults[0].count

      // 獲取標籤
      const tagResults = await executeQuery(
        `SELECT t.name FROM forum_tags t
         JOIN forum_post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = ${post.id}`,
        []
      ) as any[]
      
      if (tagResults && tagResults.length > 0) {
        post.tags = tagResults.map(tag => tag.name).join(',')
      } else {
        post.tags = ''
      }
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM forum_posts p
      WHERE 1 = 1
    `
    
    if (category && category !== 'all') {
      countQuery += ` AND p.category_id = '${category}'`
    }
    
    // 在執行計數查詢前先偵錯
    debugSQL(countQuery, [])

    const totalResults = await executeQuery(countQuery, []) as any[]
    const total = totalResults[0].total

    return NextResponse.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 })
  }
}

// POST /api/forum/posts
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          status: 'error',
          message: '請先登入',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, categorySlug, tags } = body

    if (!title || !content || !categorySlug) {
      return NextResponse.json(
        {
          status: 'error',
          message: '缺少必要欄位',
        },
        { status: 400 }
      )
    }

    // Start transaction
    await executeQuery('START TRANSACTION')

    try {
      // Insert post
      const [postResult]: any = await executeQuery(
        `INSERT INTO forum_posts (title, content, user_id, category_id) 
         VALUES (?, ?, ?, ?)`,
        [title, content, session.user.id, categorySlug]
      )

      // Insert tags if provided
      if (tags && tags.length > 0) {
        const tagValues = tags.map((tagId: number) => [
          postResult.insertId,
          tagId,
        ])
        await executeQuery(
          `INSERT INTO forum_post_tags (post_id, tag_id) VALUES ?`,
          [tagValues]
        )
      }

      await executeQuery('COMMIT')

      return NextResponse.json({
        status: 'success',
        data: { id: postResult.insertId },
      })
    } catch (error) {
      await executeQuery('ROLLBACK')
      throw error
    }
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

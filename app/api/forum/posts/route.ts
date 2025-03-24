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

    //
    let whereConditions = ''
    if (category) {
      whereConditions += ` AND p.category_id = ${parseInt(category)}`
    }
    if (search) {
      const safeSearch = search.replace(/'/g, "''")
      whereConditions += ` AND (p.title LIKE '%${safeSearch}%' OR p.content LIKE '%${safeSearch}%')`
    }

    const whereClause = whereConditions ? `WHERE 1=1${whereConditions}` : ''

    //
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

    //
    const countQuery = `
      SELECT COUNT(*) as total
      FROM forum_posts p
      ${whereClause}
    `

    const [countResult] = (await executeQuery(countQuery)) as any[]
    const total = countResult.total
    const totalPages = Math.ceil(total / limit)

    //
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.view_count,
        p.user_id,
        p.category_id
      FROM forum_posts p
      ${whereClause}
      ${orderClause}
      LIMIT ${offset}, ${limit}
    `

    //
    let posts = (await executeQuery(postsQuery)) as any[]

    //
    posts = posts.map((post) => ({
      ...post,
      author_name: '烏薩奇',
      author_avatar: '',
      category_name: '熱門標籤',
      like_count: 0,
      comment_count: 0,
    }))

    //
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

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
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
    const { title, content, categoryId, userId } = body

    // u57fau672cu9a57u8b49
    if (!title || !content || !categoryId || !userId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'u8acbu586bu5bebu6240u6709u5fc5u8981u6b04u4f4d',
        },
        { status: 400 }
      )
    }

    //
    const safeTitle = title.replace(/'/g, "''")
    const safeContent = content.replace(/'/g, "''")
    const safeCategoryId = parseInt(categoryId)
    const safeUserId = parseInt(userId)

    // -
    const insertPostQuery = `
      INSERT INTO forum_posts (title, content, user_id, category_id)
      VALUES ('${safeTitle}', '${safeContent}', ${safeUserId}, ${safeCategoryId})
    `

    const postResult = (await executeQuery(insertPostQuery)) as any
    const postId = postResult.insertId

    //
    const getPostQuery = `
      SELECT 
        id,
        title,
        content,
        created_at,
        view_count,
        user_id,
        category_id
      FROM forum_posts
      WHERE id = ${postId}
    `

    const [post] = (await executeQuery(getPostQuery)) as any[]

    //
    const enhancedPost = {
      ...post,
      author_name: 'u7528u6236',
      author_avatar: '',
      category_name: '',
      like_count: 0,
      comment_count: 0,
    }

    return NextResponse.json({
      status: 'success',
      data: enhancedPost,
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

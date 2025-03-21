import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils'

// GET /api/forum/posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const sort = searchParams.get('sort') || 'latest';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 
    let conditions = ['1=1']; 
    let params: any[] = [];

    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }

    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      if (tagList.length > 0) {
        // IN 
        const placeholders = tagList.map(() => '?').join(',');
        conditions.push(`t.name IN (${placeholders})`);
        params.push(...tagList);
      }
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 
    let orderClause = '';
    switch (sort) {
      case 'hot':
        orderClause = 'ORDER BY p.view_count DESC, p.created_at DESC';
        break;
      case 'latest':
      default:
        orderClause = 'ORDER BY p.created_at DESC';
        break;
    }

    // 
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM forum_posts p
      LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
      LEFT JOIN forum_tags t ON pt.tag_id = t.id
      ${whereClause}
    `;

    const [countResult] = await executeQuery(countQuery, params) as any[];
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // - 
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        p.view_count,
        p.category_id,
        c.name as category_name,
        u.user_nickname as author_name,
        u.profile_picture as author_avatar,
        0 as like_count,
        0 as comment_count,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
      LEFT JOIN forum_tags t ON pt.tag_id = t.id
      ${whereClause}
      GROUP BY p.id
      ${orderClause}
      LIMIT ?, ?
    `;

    // 
    const postsParams = [...params, offset, limit];

    // 
    const posts = await executeQuery(postsQuery, postsParams);

    // 
    const responseData = {
      status: 'success',
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, categoryId, tags, userId } = body;

    // 
    if (!title || !content || !categoryId || !userId) {
      return NextResponse.json({
        status: 'error',
        message: '請填寫所有必要欄位'
      }, { status: 400 });
    }

    // u958bu59cbu8cc7u6599u5eabu4ea4u6613
    await executeQuery('START TRANSACTION');

    try {
      // 1. u63d2u5165u6587u7ae0
      const insertPostQuery = `
        INSERT INTO forum_posts (title, content, user_id, category_id)
        VALUES (?, ?, ?, ?)
      `;
      const postResult = await executeQuery(insertPostQuery, [title, content, userId, categoryId]) as any;
      const postId = postResult.insertId;

      // 2. u5982u679cu6709u6a19u7c64uff0cu8655u7406u6a19u7c64
      if (tags && tags.length > 0) {
        // u70bau6bcfu500bu6a19u7c64u5275u5efau63d2u5165u8a9eu53e5
        const tagValues = tags.map(tag => [tag.trim()]);
        const insertTagsQuery = `
          INSERT IGNORE INTO forum_tags (name)
          VALUES ?
        `;
        await executeQuery(insertTagsQuery, [tagValues]);

        // u7372u53d6u6a19u7c64 ID
        const tagNames = tags.map(tag => tag.trim());
        let getTagIdsQuery;
        if (tagNames.length === 1) {
          getTagIdsQuery = `
            SELECT id, name FROM forum_tags
            WHERE name = ?
          `;
        } else {
          const placeholders = tagNames.map(() => '?').join(',');
          getTagIdsQuery = `
            SELECT id, name FROM forum_tags
            WHERE name IN (${placeholders})
          `;
        }
        const existingTags = await executeQuery(getTagIdsQuery, tagNames) as any[];

        // u5efau7acbu6587u7ae0u548cu6a19u7c64u7684u95dcu806f
        if (existingTags.length > 0) {
          const postTagValues = existingTags.map(tag => [postId, tag.id]);
          const insertPostTagsQuery = `
            INSERT INTO forum_post_tags (post_id, tag_id)
            VALUES ?
          `;
          await executeQuery(insertPostTagsQuery, [postTagValues]);
        }
      }

      // 
      await executeQuery('COMMIT');

      // 
      const getPostQuery = `
        SELECT 
          p.*,
          u.user_nickname as author_name,
          u.profile_picture as author_avatar,
          c.name as category_name,
          GROUP_CONCAT(DISTINCT t.name) as tags
        FROM forum_posts p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN forum_categories c ON p.category_id = c.id
        LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
        LEFT JOIN forum_tags t ON pt.tag_id = t.id
        WHERE p.id = ?
        GROUP BY p.id
      `;
      const [post] = (await executeQuery(getPostQuery, [postId])) as any[];

      return NextResponse.json({
        status: 'success',
        data: post
      });
    } catch (error) {
      // 
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/forum/posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sort = searchParams.get('sort') || 'latest';
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        u.nickname as author_name,
        u.avatar as author_avatar,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
      LEFT JOIN forum_tags t ON pt.tag_id = t.id
    `;

    const conditions = ['1 = 1'];
    const params: any[] = [];

    if (category && category !== 'all') {
      conditions.push('p.category_slug = ?');
      params.push(category);
    }

    if (tags && tags.length > 0) {
      query += `
        INNER JOIN (
          SELECT post_id
          FROM forum_post_tags pt2
          JOIN forum_tags t2 ON pt2.tag_id = t2.id
          WHERE t2.slug IN (${tags.map(() => '?').join(',')})
          GROUP BY post_id
          HAVING COUNT(DISTINCT t2.slug) = ?
        ) matching_tags ON p.id = matching_tags.post_id
      `;
      params.push(...tags, tags.length);
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` WHERE ${conditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${
        sort === 'hot' 
          ? 'like_count DESC, comment_count DESC, p.created_at DESC'
          : 'p.created_at DESC'
      }
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const posts = await executeQuery(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      ${tags && tags.length > 0 ? `
        INNER JOIN forum_post_tags pt ON p.id = pt.post_id
        INNER JOIN forum_tags t ON pt.tag_id = t.id
        WHERE t.slug IN (${tags.map(() => '?').join(',')})
      ` : ''}
      ${category && category !== 'all' ? 'WHERE p.category_slug = ?' : ''}
    `;
    
    const countParams = [];
    if (tags && tags.length > 0) countParams.push(...tags);
    if (category && category !== 'all') countParams.push(category);
    
    const [{ total }] = await executeQuery(countQuery, countParams);

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
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}

// POST /api/forum/posts
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: '請先登入'
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, categorySlug, tags } = body;

    if (!title || !content || !categorySlug) {
      return NextResponse.json({
        status: 'error',
        message: '缺少必要欄位'
      }, { status: 400 });
    }

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Insert post
      const [postResult]: any = await executeQuery(
        `INSERT INTO posts (title, content, user_id, category_slug) 
         VALUES (?, ?, ?, ?)`,
        [title, content, session.user.id, categorySlug]
      );

      // Insert tags if provided
      if (tags && tags.length > 0) {
        const tagValues = tags.map((tagId: number) => [postResult.insertId, tagId]);
        await executeQuery(
          `INSERT INTO forum_post_tags (post_id, tag_id) VALUES ?`,
          [tagValues]
        );
      }

      await executeQuery('COMMIT');

      return NextResponse.json({
        status: 'success',
        data: { id: postResult.insertId }
      });
    } catch (error) {
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

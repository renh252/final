import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/forum/posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    
    let query = `
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        GROUP_CONCAT(t.name) as tags
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
      LEFT JOIN forum_tags t ON pt.tag_id = t.id
      WHERE p.status = 'published'
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY p.id';
    
    if (sort === 'hot') {
      query += ' ORDER BY p.like_count DESC, p.comment_count DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const posts = await executeQuery(query, params);
    
    // Get total count for pagination
    const [{ total }] = await executeQuery(
      'SELECT COUNT(*) as total FROM forum_posts WHERE status = "published"'
    );
    
    return NextResponse.json({
      status: 'success',
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { status: 'error', message: '無法獲取文章列表' },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { status: 'error', message: '請先登入' },
        { status: 401 }
      );
    }

    const { title, content, categoryId, tags = [] } = await request.json();

    // 驗證必要欄位
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { status: 'error', message: '標題、內容和分類為必填項目' },
        { status: 400 }
      );
    }

    // 新增文章
    const [result] = await executeQuery(
      'INSERT INTO forum_posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)',
      [title, content, session.user.id, categoryId]
    );

    const postId = result.insertId;

    // 處理標籤
    if (tags.length > 0) {
      // 先確保所有標籤都存在
      for (const tag of tags) {
        await executeQuery(
          'INSERT IGNORE INTO forum_tags (name, slug) VALUES (?, ?)',
          [tag, tag.toLowerCase().replace(/\s+/g, '-')]
        );
      }

      // 獲取標籤 ID
      const tagIds = await executeQuery(
        'SELECT id FROM forum_tags WHERE name IN (?)',
        [tags]
      );

      // 建立文章和標籤的關聯
      for (const { id: tagId } of tagIds) {
        await executeQuery(
          'INSERT INTO forum_post_tags (post_id, tag_id) VALUES (?, ?)',
          [postId, tagId]
        );
      }
    }

    return NextResponse.json({
      status: 'success',
      data: { id: postId },
      message: '文章發布成功'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { status: 'error', message: '文章發布失敗' },
      { status: 500 }
    );
  }
}

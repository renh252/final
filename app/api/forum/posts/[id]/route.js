import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/forum/posts/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const [post] = await executeQuery(`
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        GROUP_CONCAT(t.name) as tags
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_post_tags pt ON p.id = pt.post_id
      LEFT JOIN forum_tags t ON pt.tag_id = t.id
      WHERE p.id = ? AND p.status = 'published'
      GROUP BY p.id
    `, [id]);
    
    if (!post) {
      return NextResponse.json(
        { status: 'error', message: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 增加瀏覽次數
    await executeQuery(
      'UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
    
    // 獲取評論
    const comments = await executeQuery(`
      SELECT 
        c.*,
        u.username as author_name,
        u.avatar as author_avatar
      FROM forum_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.status = 'visible'
      ORDER BY c.created_at DESC
    `, [id]);
    
    return NextResponse.json({
      status: 'success',
      data: { ...post, comments }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { status: 'error', message: '無法獲取文章內容' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/posts/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { status: 'error', message: '請先登入' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { title, content, categoryId, tags = [] } = await request.json();

    // 檢查文章是否存在且是否為作者
    const [post] = await executeQuery(
      'SELECT user_id FROM forum_posts WHERE id = ?',
      [id]
    );

    if (!post) {
      return NextResponse.json(
        { status: 'error', message: '文章不存在' },
        { status: 404 }
      );
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json(
        { status: 'error', message: '無權限編輯此文章' },
        { status: 403 }
      );
    }

    // 更新文章
    await executeQuery(
      'UPDATE forum_posts SET title = ?, content = ?, category_id = ? WHERE id = ?',
      [title, content, categoryId, id]
    );

    // 更新標籤
    await executeQuery('DELETE FROM forum_post_tags WHERE post_id = ?', [id]);

    if (tags.length > 0) {
      // 確保標籤存在
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

      // 建立新的關聯
      for (const { id: tagId } of tagIds) {
        await executeQuery(
          'INSERT INTO forum_post_tags (post_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }

    return NextResponse.json({
      status: 'success',
      message: '文章更新成功'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { status: 'error', message: '文章更新失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/posts/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { status: 'error', message: '請先登入' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 檢查文章是否存在且是否為作者
    const [post] = await executeQuery(
      'SELECT user_id FROM forum_posts WHERE id = ?',
      [id]
    );

    if (!post) {
      return NextResponse.json(
        { status: 'error', message: '文章不存在' },
        { status: 404 }
      );
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json(
        { status: 'error', message: '無權限刪除此文章' },
        { status: 403 }
      );
    }

    // 刪除文章（這會通過外鍵約束自動刪除相關的標籤關聯和評論）
    await executeQuery('DELETE FROM forum_posts WHERE id = ?', [id]);

    return NextResponse.json({
      status: 'success',
      message: '文章刪除成功'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { status: 'error', message: '文章刪除失敗' },
      { status: 500 }
    );
  }
}

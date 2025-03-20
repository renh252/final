import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { executeQuery } from '@/lib/db';

// POST /api/forum/posts/[id]/comments
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        status: 'error',
        message: '請先登入'
      }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({
        status: 'error',
        message: '評論內容不能為空'
      }, { status: 400 });
    }

    // 檢查文章是否存在
    const [post] = await executeQuery(
      'SELECT id FROM forum_posts WHERE id = ?',
      [params.id]
    );

    if (!post) {
      return NextResponse.json({
        status: 'error',
        message: '找不到此文章'
      }, { status: 404 });
    }

    // 新增評論
    const [result] = await executeQuery(
      \`INSERT INTO forum_comments (post_id, user_id, content, created_at)
       VALUES (?, ?, ?, NOW())\`,
      [params.id, session.user.id, content]
    );

    // 更新文章評論數
    await executeQuery(
      'UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = ?',
      [params.id]
    );

    // 獲取新增的評論資料
    const [comment] = await executeQuery(
      \`SELECT c.id, c.content, c.created_at,
              u.nickname as author_name, u.image as author_avatar
       FROM forum_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?\`,
      [result.insertId]
    );

    return NextResponse.json({
      status: 'success',
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({
      status: 'error',
      message: '新增評論失敗'
    }, { status: 500 });
  }
}

// GET /api/forum/posts/[id]/comments
export async function GET(request, { params }) {
  try {
    const comments = await executeQuery(
      \`SELECT c.id, c.content, c.created_at,
              u.nickname as author_name, u.image as author_avatar
       FROM forum_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC\`,
      [params.id]
    );

    return NextResponse.json({
      status: 'success',
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({
      status: 'error',
      message: '載入評論失敗'
    }, { status: 500 });
  }
}

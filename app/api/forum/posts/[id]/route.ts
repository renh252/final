import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';

// GET /api/forum/posts/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    console.log('Fetching post with ID:', postId, 'Type:', typeof postId);
    
    if (isNaN(postId)) {
      console.log('Invalid post ID:', params.id);
      return NextResponse.json(
        { status: 'error', message: '無效的文章ID' },
        { status: 400 }
      );
    }

    // 查詢文章
    const query = `
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
      WHERE p.id = ?
    `;

    const posts = await executeQuery(query, [postId]) as any[];
    
    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '找不到該文章' },
        { status: 404 }
      );
    }

    // 在 JavaScript 中格式化資料
    const post = posts[0];
    const formattedPost = {
      ...post,
      author_name: '作者',
      author_avatar: '',
      category_name: '分類',
      tags: '',
      comments: [],
    };

    // 查詢標籤
    try {
      const tagsQuery = `
        SELECT t.name
        FROM forum_tags t
        JOIN forum_post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `;
      const tags = await executeQuery(tagsQuery, [postId]) as any[];
      if (tags && tags.length > 0) {
        formattedPost.tags = tags.map(tag => tag.name).join(',');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // 如果標籤查詢失敗，直接返回文章資料
    }

    // 更新文章的瀏覽次數
    try {
      const updateViewCountQuery = `
        UPDATE forum_posts
        SET view_count = view_count + 1
        WHERE id = ?
      `;
      await executeQuery(updateViewCountQuery, [postId]);
    } catch (error) {
      console.error('Error updating view count:', error);
      // 如果更新瀏覽次數失敗，直接返回文章資料
    }

    return NextResponse.json({
      status: 'success',
      data: {
        post: formattedPost,
        comments: [],
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { status: 'error', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts/[id]/vote
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    console.log('Fetching post with ID:', postId, 'Type:', typeof postId);
    
    if (isNaN(postId)) {
      console.log('Invalid post ID:', params.id);
      return NextResponse.json(
        { status: 'error', message: '無效的文章ID' },
        { status: 400 }
      );
    }

    const { type } = await request.json();
    if (type !== 'up' && type !== 'down') {
      return NextResponse.json(
        { status: 'error', message: '無效的投票類型' },
        { status: 400 }
      );
    }

    // 查詢文章
    const query = `
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
      WHERE p.id = ?
    `;

    const posts = await executeQuery(query, [postId]) as any[];
    
    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '找不到該文章' },
        { status: 404 }
      );
    }

    // 在 JavaScript 中格式化資料
    const post = posts[0];
    const formattedPost = {
      ...post,
      author_name: '作者',
      author_avatar: '',
      category_name: '分類',
      tags: '',
      comments: [],
    };

    // 查詢標籤
    try {
      const tagsQuery = `
        SELECT t.name
        FROM forum_tags t
        JOIN forum_post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `;
      const tags = await executeQuery(tagsQuery, [postId]) as any[];
      if (tags && tags.length > 0) {
        formattedPost.tags = tags.map(tag => tag.name).join(',');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // 如果標籤查詢失敗，直接返回文章資料
    }

    // 更新文章的投票數
    try {
      let updateVoteCountQuery = `
        UPDATE forum_posts
        SET like_count = like_count + 1
        WHERE id = ?
      `;
      if (type === 'down') {
        updateVoteCountQuery = `
          UPDATE forum_posts
          SET like_count = GREATEST(like_count - 1, 0)
          WHERE id = ?
        `;
      }
      await executeQuery(updateVoteCountQuery, [postId]);
    } catch (error) {
      console.error('Error updating vote count:', error);
      // 如果更新投票數失敗，直接返回文章資料
    }

    return NextResponse.json({
      status: 'success',
      data: formattedPost,
    });
  } catch (error) {
    console.error('Error updating post vote:', error);
    return NextResponse.json(
      { status: 'error', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

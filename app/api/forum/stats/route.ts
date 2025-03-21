import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';

// GET /api/forum/stats
export async function GET() {
  try {
    // 獲取文章總數
    const postsQuery = `SELECT COUNT(*) as count FROM forum_posts`;
    const [postsResult] = await executeQuery(postsQuery) as any[];
    
    // 獲取活躍用戶數（有發表過文章的用戶）
    const usersQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM forum_posts
    `;
    const [usersResult] = await executeQuery(usersQuery) as any[];
    
    // 獲取分類總數
    const categoriesQuery = `SELECT COUNT(*) as count FROM forum_categories WHERE is_active = 1`;
    const [categoriesResult] = await executeQuery(categoriesQuery) as any[];
    
    return NextResponse.json({
      status: 'success',
      data: {
        totalPosts: postsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalCategories: categoriesResult.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}

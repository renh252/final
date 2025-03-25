import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { status: 'error', message: '無效的文章ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type } = body;

    if (!type || (type !== 'up' && type !== 'down')) {
      return NextResponse.json(
        { status: 'error', message: '無效的投票類型' },
        { status: 400 }
      );
    }

    // 簡化投票處理，只更新文章的 like_count
    const updateValue = type === 'up' ? 1 : -1;
    
    // 更新文章的點讚數
    const updateQuery = `
      UPDATE forum_posts 
      SET like_count = like_count + ? 
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [updateValue, postId]);

    // 獲取更新後的文章
    const getPostQuery = `
      SELECT like_count 
      FROM forum_posts 
      WHERE id = ?
    `;
    
    const result = await executeQuery(getPostQuery, [postId]) as any[];
    
    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '找不到文章' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: '投票成功',
      data: {
        like_count: result[0].like_count
      }
    });
  } catch (error) {
    console.error('投票失敗:', error);
    return NextResponse.json(
      { status: 'error', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

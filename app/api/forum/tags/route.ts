import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';

// GET /api/forum/tags
export async function GET() {
  try {
    const query = `
      SELECT 
        t.id,
        t.name,
        t.slug,
        COUNT(pt.post_id) as post_count
      FROM forum_tags t
      LEFT JOIN forum_post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id
      ORDER BY post_count DESC, t.name ASC
    `;

    const tags = await executeQuery(query);
    
    return NextResponse.json({
      status: 'success',
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}

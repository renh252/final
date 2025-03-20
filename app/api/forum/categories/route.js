import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/forum/categories
export async function GET() {
  try {
    const categories = await executeQuery(`
      SELECT id, name, slug, description, parent_id, \`order\`
      FROM forum_categories
      ORDER BY \`order\` ASC
    `);
    
    return NextResponse.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { status: 'error', message: '無法獲取分類列表' },
      { status: 500 }
    );
  }
}

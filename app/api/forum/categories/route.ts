import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils';

// GET /api/forum/categories
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        \`order\`
      FROM forum_categories 
      ORDER BY \`order\` ASC
    `;

    const categories = await executeQuery(query);
    
    return NextResponse.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      status: 'error',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}

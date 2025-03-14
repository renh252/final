'use client';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        // 假設從資料庫或後端獲取文章資料的函數
        const article = await getArticleById(id);

        if (!article) {
            return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// 假設的函數，實際上應該從資料庫或其他來源獲取資料
async function getArticleById(id) {
    // 這裡應該有實際的資料獲取邏輯
    // 例如：從資料庫查詢文章
    return {
        id,
        title: 'Sample Article Title',
        content: 'This is the content of the article.',
        author: 'Author Name',
        publishedAt: '2023-10-01T12:00:00Z',
        category: 'General',
    };
}
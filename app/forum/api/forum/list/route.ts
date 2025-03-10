import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        // 假設這裡有一個函數可以從資料庫獲取文章列表
        const articles = await getArticlesFromDatabase(limit, offset);
        
        return NextResponse.json({
            page,
            limit,
            articles,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

// 假設這是一個模擬的資料庫獲取函數
async function getArticlesFromDatabase(limit, offset) {
    // 這裡應該是從資料庫獲取資料的邏輯
    // 目前返回一個模擬的文章列表
    return Array.from({ length: limit }, (_, index) => ({
        id: offset + index + 1,
        title: `Article Title ${offset + index + 1}`,
        summary: `Summary of article ${offset + index + 1}`,
        author: `Author ${offset + index + 1}`,
        publishedAt: new Date().toISOString(),
        category: 'General',
    }));
}
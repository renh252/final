import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // 假設從資料庫或後端獲取置頂文章的函數
        const featuredArticles = await getFeaturedArticles(5); // 取得前 5 篇置頂文章

        return NextResponse.json(featuredArticles);
    } catch (error) {
        console.error('Error fetching featured articles:', error);
        return NextResponse.json({ message: 'Failed to fetch featured articles' }, { status: 500 });
    }
}

// 模擬從資料庫獲取置頂文章的函數
async function getFeaturedArticles(limit) {
    // 這裡應該是實際的資料庫查詢邏輯
    return [
        {
            id: 1,
            title: '置頂文章 1',
            summary: '這是置頂文章 1 的摘要。',
            image: '/images/featured1.jpg',
            author: '作者 A',
        },
        {
            id: 2,
            title: '置頂文章 2',
            summary: '這是置頂文章 2 的摘要。',
            image: '/images/featured2.jpg',
            author: '作者 B',
        },
        {
            id: 3,
            title: '置頂文章 3',
            summary: '這是置頂文章 3 的摘要。',
            image: '/images/featured3.jpg',
            author: '作者 C',
        },
        {
            id: 4,
            title: '置頂文章 4',
            summary: '這是置頂文章 4 的摘要。',
            image: '/images/featured4.jpg',
            author: '作者 D',
        },
        {
            id: 5,
            title: '置頂文章 5',
            summary: '這是置頂文章 5 的摘要。',
            image: '/images/featured5.jpg',
            author: '作者 E',
        },
    ].slice(0, limit);
}
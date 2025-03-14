'use client';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // 假設這裡是從資料庫或後端獲取置頂文章的邏輯
        const featuredArticles = [
            {
                id: 1,
                title: '置頂文章 1',
                summary: '這是置頂文章 1 的摘要。',
                image: 'https://example.com/image1.jpg',
                author: '作者 A',
            },
            {
                id: 2,
                title: '置頂文章 2',
                summary: '這是置頂文章 2 的摘要。',
                image: 'https://example.com/image2.jpg',
                author: '作者 B',
            },
            {
                id: 3,
                title: '置頂文章 3',
                summary: '這是置頂文章 3 的摘要。',
                image: 'https://example.com/image3.jpg',
                author: '作者 C',
            },
            {
                id: 4,
                title: '置頂文章 4',
                summary: '這是置頂文章 4 的摘要。',
                image: 'https://example.com/image4.jpg',
                author: '作者 D',
            },
            {
                id: 5,
                title: '置頂文章 5',
                summary: '這是置頂文章 5 的摘要。',
                image: 'https://example.com/image5.jpg',
                author: '作者 E',
            },
        ];

        // 限制回傳的置頂文章數量
        const limitedFeaturedArticles = featuredArticles.slice(0, 5);

        return NextResponse.json(limitedFeaturedArticles);
    } catch (error) {
        console.error('Error fetching featured articles:', error);
        return NextResponse.json({ message: '無法獲取置頂文章' }, { status: 500 });
    }
}
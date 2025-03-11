'use client';
import { NextResponse } from 'next/server';

const articles = [
    // Sample data for demonstration purposes
    { id: 1, title: 'First Article', summary: 'Summary of the first article', author: 'Author 1', publishedAt: '2023-01-01', category: 'General' },
    { id: 2, title: 'Second Article', summary: 'Summary of the second article', author: 'Author 2', publishedAt: '2023-01-02', category: 'Health' },
    { id: 3, title: 'Third Article', summary: 'Summary of the third article', author: 'Author 3', publishedAt: '2023-01-03', category: 'Events' },
    { id: 4, title: 'Fourth Article', summary: 'Summary of the fourth article', author: 'Author 4', publishedAt: '2023-01-04', category: 'Sharing' },
    { id: 5, title: 'Fifth Article', summary: 'Summary of the fifth article', author: 'Author 5', publishedAt: '2023-01-05', category: 'Adoption' },
    { id: 6, title: 'Sixth Article', summary: 'Summary of the sixth article', author: 'Author 6', publishedAt: '2023-01-06', category: 'General' },
    { id: 7, title: 'Seventh Article', summary: 'Summary of the seventh article', author: 'Author 7', publishedAt: '2023-01-07', category: 'Health' },
    { id: 8, title: 'Eighth Article', summary: 'Summary of the eighth article', author: 'Author 8', publishedAt: '2023-01-08', category: 'Events' },
    { id: 9, title: 'Ninth Article', summary: 'Summary of the ninth article', author: 'Author 9', publishedAt: '2023-01-09', category: 'Sharing' },
    { id: 10, title: 'Tenth Article', summary: 'Summary of the tenth article', author: 'Author 10', publishedAt: '2023-01-10', category: 'Adoption' },
    // Add more articles as needed
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    try {
        const paginatedArticles = articles.slice(startIndex, endIndex);
        const totalArticles = articles.length;

        return NextResponse.json({
            articles: paginatedArticles,
            total: totalArticles,
            page,
            pageSize,
            totalPages: Math.ceil(totalArticles / pageSize),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
'use client';
import { NextResponse } from 'next/server';
import { getArticleById } from '../../../../lib/api';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const article = await getArticleById(id);
        if (!article) {
            return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        }
        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
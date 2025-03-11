'use client';

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const res = await fetch(`https://api.example.com/articles/${id}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = await res.json();
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
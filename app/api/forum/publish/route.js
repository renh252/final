import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, category, publishedAt } = body;
    
    // 驗證資料
    if (!title || !content || !category) {
      return NextResponse.json({ message: '缺少必要參數' }, { status: 400 });
    }
    
    // 這裡應該是保存到資料庫的邏輯
    // 暫時先輸出到控制台模擬保存
    console.log('新發布的文章:', {
      title,
      content,
      category,
      publishedAt,
      authorId: 'user-id', // 這裡應從身份驗證獲取真實用戶ID
    });
    
    // 假設生成一個文章ID
    const articleId = Math.floor(Math.random() * 1000).toString();
    
    return NextResponse.json({
      success: true,
      message: '文章發布成功',
      articleId,
    });
  } catch (error) {
    console.error('文章發布錯誤:', error);
    return NextResponse.json({ message: '伺服器內部錯誤' }, { status: 500 });
  }
}
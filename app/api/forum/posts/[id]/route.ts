import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { writeFile } from 'fs/promises';

// GET /api/forum/posts/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '無效的文章ID' },
        { status: 400 }
      );
    }

    // 獲取文章數據
    const post = await prisma.forum_posts.findUnique({
      where: { 
        id: postId 
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: '找不到該文章' },
        { status: 404 }
      );
    }

    // 增加瀏覽次數
    await prisma.forum_posts.update({
      where: { id: postId },
      data: {
        view_count: {
          increment: 1
        }
      }
    });

    // 組合回應數據，使用預設值
    const response = {
      ...post,
      user: {
        id: post.user_id,
        name: `User_${post.user_id}`, // 使用 user_id 作為名稱
        avatar: '/images/default-avatar.png', // 預設頭像
      },
      category: {
        id: post.category_id,
        name: `Category_${post.category_id}`, // 使用 category_id 作為名稱
        slug: `category-${post.category_id}`,
      },
      comments: [], // 空陣列
      tags: [], // 空陣列
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '無法獲取文章內容' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/posts/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '無效的文章ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);
    const imageFiles = formData.getAll('images') as File[];
    
    // 驗證必填欄位
    if (!title || !content || isNaN(categoryId)) {
      return NextResponse.json(
        { error: '標題、內容和分類為必填項目' },
        { status: 400 }
      );
    }

    // 獲取現有文章
    const existingPost = await prisma.forum_posts.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: '找不到該文章' },
        { status: 404 }
      );
    }

    // 處理圖片上傳
    let images: string[] = [];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filePath = `/uploads/forum/${filename}`;
        const fullPath = join(process.cwd(), 'public', filePath);
        await writeFile(fullPath, buffer);
        return filePath;
      });
      images = await Promise.all(uploadPromises);
    }

    // 更新文章
    const updatedPost = await prisma.forum_posts.update({
      where: { id: postId },
      data: {
        title,
        content,
        category_id: categoryId,
        images,
      }
    });

    // 組合回應數據，使用預設值
    const response = {
      ...updatedPost,
      user: {
        id: updatedPost.user_id,
        name: `User_${updatedPost.user_id}`, // 使用 user_id 作為名稱
        avatar: '/images/default-avatar.png', // 預設頭像
      },
      category: {
        id: updatedPost.category_id,
        name: `Category_${updatedPost.category_id}`, // 使用 category_id 作為名稱
        slug: `category-${updatedPost.category_id}`,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    );
  }
}

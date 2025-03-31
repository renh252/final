import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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

    const post = await prisma.forum_posts.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: '找不到該文章' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.author.id,
        name: post.author.name,
        avatar: post.author.avatar,
      },
      category: post.category,
      like_count: post.like_count,
      comment_count: post.comment_count,
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatar: comment.author.avatar,
        },
      })),
      tags: post.tags.map(tag => tag.tag.name),
    };

    return NextResponse.json(formattedPost);
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

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
    
    // Validate required fields
    if (!title || !content || isNaN(categoryId)) {
      return NextResponse.json(
        { error: '標題、內容和分類為必填項目' },
        { status: 400 }
      );
    }

    // Get existing post
    const existingPost = await prisma.forum_posts.findUnique({
      where: { id: postId },
      select: { user_id: true, images: true }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: '找不到該文章' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (existingPost.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '您沒有權限編輯此文章' },
        { status: 403 }
      );
    }

    // Handle image uploads
    let images = existingPost.images as string[] || [];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filePath = `/uploads/forum/${filename}`;
        const fullPath = join(process.cwd(), 'public', filePath);
        await writeFile(fullPath, buffer);
        return filePath;
      });
      const newImages = await Promise.all(uploadPromises);
      images = [...images, ...newImages];
    }

    // Update post
    const updatedPost = await prisma.forum_posts.update({
      where: { id: postId },
      data: {
        title,
        content,
        category_id: categoryId,
        images: images,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// POST /api/forum/posts/[id]/comments
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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

    const { content } = await request.json();
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '留言內容不能為空' },
        { status: 400 }
      );
    }

    // Create the comment
    await prisma.forum_comments.create({
      data: {
        content: content.trim(),
        post_id: postId,
        author_id: session.user.id,
      },
    });

    // Fetch the updated post with comments
    const updatedPost = await prisma.forum_posts.findUnique({
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
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!updatedPost) {
      return NextResponse.json(
        { error: '找不到該文章' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      created_at: updatedPost.created_at,
      updated_at: updatedPost.updated_at,
      author: {
        id: updatedPost.author.id,
        name: updatedPost.author.name,
        avatar: updatedPost.author.avatar,
      },
      category: updatedPost.category,
      upvotes: updatedPost.upvotes,
      downvotes: updatedPost.downvotes,
      comments: updatedPost.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatar: comment.author.avatar,
        },
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
      })),
      tags: updatedPost.tags.map(tag => tag.tag.name).join(','),
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '無法新增留言' },
      { status: 500 }
    );
  }
}

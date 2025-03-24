import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.author.id,
        name: post.author.name,
        avatar: post.author.avatar,
      },
      category: post.category,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      comments: post.comments.map(comment => ({
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
      tags: post.tags.map(tag => tag.tag.name).join(','),
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

// POST /api/forum/posts/[id]/vote
export async function POST(
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

    const { type } = await request.json();
    if (type !== 'up' && type !== 'down') {
      return NextResponse.json(
        { error: '無效的投票類型' },
        { status: 400 }
      );
    }

    const updateData = type === 'up'
      ? { upvotes: { increment: 1 } }
      : { downvotes: { increment: 1 } };

    const updatedPost = await prisma.forum_posts.update({
      where: { id: postId },
      data: updateData,
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
    console.error('Error updating post vote:', error);
    return NextResponse.json(
      { error: '無法更新投票' },
      { status: 500 }
    );
  }
}

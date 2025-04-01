import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/forum/posts/:id
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

    // 獲取文章數據，包含分類、標籤和評論
    const post = await prisma.forum_posts.findUnique({
      where: { id: postId },
      include: {
        forum_comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        forum_post_tags: {
          include: {
            tag: true
          }
        },
        category: true
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

    // 獲取點讚數量
    const likesCount = await prisma.forum_likes.count({
      where: { post_id: postId }
    });

    // 組合回應數據
    const response = {
      status: 'success',
      data: {
        post: {
          ...post,
          like_count: likesCount,
          user: {
            id: post.user_id,
            name: `User_${post.user_id}`,
            avatar: '/images/default-avatar.png'
          },
          tags: post.forum_post_tags.map(pt => pt.tag)
        }
      }
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

// 處理點讚/取消點讚
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

    const { action } = await request.json();
    const userId = 1; // 暫時使用固定用戶ID

    if (action === 'like') {
      // 檢查是否已經點讚
      const existingLike = await prisma.forum_likes.findFirst({
        where: {
          post_id: postId,
          user_id: userId
        }
      });

      if (existingLike) {
        // 如果已經點讚，則取消點讚
        await prisma.forum_likes.delete({
          where: { id: existingLike.id }
        });
      } else {
        // 如果還沒點讚，則新增點讚
        await prisma.forum_likes.create({
          data: {
            post_id: postId,
            user_id: userId
          }
        });
      }

      // 獲取最新點讚數
      const likesCount = await prisma.forum_likes.count({
        where: { post_id: postId }
      });

      return NextResponse.json({
        status: 'success',
        data: {
          likesCount,
          isLiked: !existingLike
        }
      });
    }

    return NextResponse.json(
      { error: '無效的操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling post action:', error);
    return NextResponse.json(
      { error: '操作失敗' },
      { status: 500 }
    );
  }
}

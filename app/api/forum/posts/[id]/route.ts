import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/forum/posts/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 })
    }

    // 獲取文章數據
    const post = await prisma.forum_posts.findUnique({
      where: { id: postId },
      include: {
        forum_comments: true,
        category: true,
        forum_post_tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: '找不到該文章' }, { status: 404 })
    }

    // 增加瀏覽次數
    await prisma.forum_posts.update({
      where: { id: postId },
      data: {
        view_count: {
          increment: 1,
        },
      },
    })

    // 獲取點讚數量
    const likesCount = await prisma.forum_likes.count({
      where: { post_id: postId },
    })

    // 組合回應數據
    const response = {
      status: 'success',
      data: {
        post: {
          ...post,
          like_count: likesCount,
          user_id: post.user_id,
          tags: post.forum_post_tags.map((pt) => pt.tag),
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: '無法獲取文章內容' }, { status: 500 })
  }
}

// 處理點讚/取消點讚
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    const userId = 1 // 暫時固定用戶ID為1，實際應從session獲取

    if (isNaN(postId)) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 })
    }

    const { action } = await request.json()

    if (action === 'like') {
      // 檢查是否已點讚
      const existingLike = await prisma.forum_likes.findFirst({
        where: {
          post_id: postId,
          user_id: userId,
        },
      })

      if (existingLike) {
        // 取消點讚
        await prisma.forum_likes.delete({
          where: {
            id: existingLike.id,
          },
        })
      } else {
        // 新增點讚
        await prisma.forum_likes.create({
          data: {
            post_id: postId,
            user_id: userId,
          },
        })

        // 發送通知給貼文作者（新增點讚通知）
        try {
          // 獲取貼文詳情
          const post = await prisma.forum_posts.findUnique({
            where: { id: postId },
            select: {
              title: true,
              user_id: true,
            },
          })

          if (post && post.user_id !== userId) {
            // 確保不發通知給自己
            // 發送通知給貼文作者
            await fetch(
              `${
                process.env.NEXT_PUBLIC_API_BASE_URL || ''
              }/api/notifications/add`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: post.user_id,
                  type: 'forum',
                  title: '您的貼文獲得新讚',
                  message: `您的貼文「${post.title?.substring(0, 20)}${
                    post.title && post.title.length > 20 ? '...' : ''
                  }」收到了新的讚。`,
                  link: `/forum/posts/${postId}`,
                }),
              }
            )
          }
        } catch (notifyError) {
          console.error('發送點讚通知時發生錯誤:', notifyError)
          // 不影響主流程
        }
      }

      // 獲取最新點讚數
      const likesCount = await prisma.forum_likes.count({
        where: { post_id: postId },
      })

      return NextResponse.json({
        status: 'success',
        data: {
          isLiked: !existingLike,
          likesCount,
        },
      })
    }

    return NextResponse.json({ error: '無效的操作' }, { status: 400 })
  } catch (error) {
    console.error('Error handling post action:', error)
    return NextResponse.json({ error: '操作失敗' }, { status: 500 })
  }
}

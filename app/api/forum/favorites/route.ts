import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: 獲取用戶的收藏文章列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ status: 'error', message: '未登入' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ status: 'error', message: '用戶不存在' }, { status: 404 })
    }

    const favorites = await prisma.forum_favorites.findMany({
      where: { user_id: user.id },
      include: {
        forum_posts: {
          select: {
            id: true,
            title: true,
            content: true,
            created_at: true,
            users: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })

    const formattedFavorites = favorites.map(fav => ({
      id: fav.forum_posts.id,
      title: fav.forum_posts.title,
      content: fav.forum_posts.content,
      created_at: fav.forum_posts.created_at,
      username: fav.forum_posts.users.username
    }))

    return NextResponse.json({ 
      status: 'success', 
      favorites: formattedFavorites 
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { status: 'error', message: '獲取收藏失敗' },
      { status: 500 }
    )
  }
}

// POST: 添加或移除收藏
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ status: 'error', message: '未登入' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ status: 'error', message: '用戶不存在' }, { status: 404 })
    }

    const { postId, action } = await request.json()

    if (action === 'add') {
      await prisma.forum_favorites.create({
        data: {
          user_id: user.id,
          post_id: parseInt(postId)
        }
      })
    } else if (action === 'remove') {
      await prisma.forum_favorites.deleteMany({
        where: {
          user_id: user.id,
          post_id: parseInt(postId)
        }
      })
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Error managing favorite:', error)
    return NextResponse.json(
      { status: 'error', message: '操作失敗' },
      { status: 500 }
    )
  }
}

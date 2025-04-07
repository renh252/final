import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ isFavorited: false })
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ isFavorited: false })
    }

    const favorite = await prisma.forum_favorites.findFirst({
      where: {
        user_id: user.id,
        post_id: parseInt(params.id)
      }
    })

    return NextResponse.json({ isFavorited: !!favorite })

  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json({ isFavorited: false })
  }
}

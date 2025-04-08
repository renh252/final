import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { verifyToken } from '@/app/api/_lib/jwt'

// 獲取留言列表
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const postId = url.searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 從資料庫獲取留言
    const [comments] = await db.query(
      `SELECT 
        c.*, 
        u.user_name, 
        u.user_avatar,
        u.user_level
      FROM forum_comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC`,
      [postId]
    )

    return NextResponse.json({
      success: true,
      comments,
    })
  } catch (error) {
    console.error('獲取留言列表時出錯:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// 新增留言
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未授權' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: '無效的令牌' },
        { status: 401 }
      )
    }

    const userId = payload.userId
    const body = await request.json()
    const { postId, content } = body

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 新增留言到資料庫
    const [result] = await db.query(
      `INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?)`,
      [postId, userId, content]
    )

    const commentId = result.insertId

    // 獲取貼文和作者資訊
    const [posts] = await db.query(
      `SELECT p.title, p.user_id 
       FROM forum_posts p
       WHERE p.id = ?`,
      [postId]
    )

    if (Array.isArray(posts) && posts.length > 0) {
      const post = posts[0]

      // 只有當留言者不是貼文作者時才發送通知
      if (post.user_id !== userId) {
        const postTitle =
          post.title.length > 20
            ? post.title.substring(0, 20) + '...'
            : post.title

        // 發送通知給貼文作者
        await db.query(
          `INSERT INTO notifications 
          (user_id, type, title, message, link, created_at) 
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            post.user_id,
            'forum',
            '您的貼文收到新留言',
            `您的貼文「${postTitle}」收到了新的留言`,
            `/forum/posts/${postId}#comment-${commentId}`,
          ]
        )
      }
    }

    // 獲取新創建的留言詳情
    const [comments] = await db.query(
      `SELECT 
        c.*, 
        u.user_name, 
        u.user_avatar,
        u.user_level
      FROM forum_comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.id = ?`,
      [commentId]
    )

    const comment =
      Array.isArray(comments) && comments.length > 0 ? comments[0] : null

    return NextResponse.json({
      success: true,
      message: '留言已發布',
      comment,
    })
  } catch (error) {
    console.error('發布留言時出錯:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

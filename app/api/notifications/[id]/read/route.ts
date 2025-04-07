import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
// 實際應用中需要引入資料庫連接和身份驗證
// import { db } from '@/app/lib/db';
// import { getServerSession } from 'next-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 獲取已登入用戶
    // const session = await getServerSession();
    // if (!session?.user) {
    //   return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    // }
    // const userId = session.user.id;

    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: '缺少通知ID' },
        { status: 400 }
      )
    }

    // 獲取用戶ID (從request body)
    const body = await request.json().catch(() => ({}))
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用戶ID' },
        { status: 400 }
      )
    }

    // 更新數據庫中的記錄
    const [result, error] = await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    )

    if (error) {
      console.error('標記通知已讀失敗:', error)
      return NextResponse.json(
        { success: false, message: '標記通知已讀失敗' },
        { status: 500 }
      )
    }

    console.log(`標記通知 #${notificationId} 為已讀`)

    return NextResponse.json({
      success: true,
      message: '通知已標記為已讀',
    })
  } catch (error) {
    console.error('標記通知已讀失敗:', error)
    return NextResponse.json(
      { success: false, message: '標記通知已讀失敗' },
      { status: 500 }
    )
  }
}

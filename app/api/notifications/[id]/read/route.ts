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

    // 獲取用戶ID或管理員ID (從request body)
    const body = await request.json().catch(() => ({}))
    const userId = body.userId
    const adminId = body.adminId

    if (!userId && !adminId) {
      return NextResponse.json(
        { success: false, message: '缺少用戶ID或管理員ID' },
        { status: 400 }
      )
    }

    // 根據請求類型更新不同的記錄
    let queryString = ''
    let queryParams: any[] = []

    if (adminId) {
      // 更新管理員通知，同時處理admin_id為NULL的通知
      queryString = `UPDATE notifications SET is_read = 1 WHERE id = ? AND (admin_id = ? OR admin_id IS NULL)`
      queryParams = [notificationId, adminId]
    } else {
      // 更新用戶通知
      queryString = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`
      queryParams = [notificationId, userId]
    }

    console.log('執行標記已讀查詢:', queryString, queryParams)

    // 更新數據庫中的記錄
    const [result, error] = await db.query(queryString, queryParams)

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

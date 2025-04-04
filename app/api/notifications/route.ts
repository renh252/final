import { NextRequest, NextResponse } from 'next/server'
// 實際應用中需要引入資料庫連接和身份驗證
// import { db } from '@/app/lib/db';
// import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // 獲取已登入用戶
    // const session = await getServerSession();
    // if (!session?.user) {
    //   return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    // }
    // const userId = session.user.id;

    // 模擬用戶ID，實際應用中應該從session獲取
    const userId = '123'

    // 模擬通知數據
    // 在實際應用中，應該從資料庫查詢
    // 例如: const notifications = await db.query(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [userId]);

    const notifications = [
      {
        id: 1,
        type: 'forum',
        title: '新留言通知',
        message: '有人在您的貼文「尋找愛貓新家」留言',
        link: '/forum/post/1',
        image: '/images/default-avatar.png',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'pet',
        title: '寵物領養通知',
        message: '您申請的寵物「小花」領養申請已通過初審',
        link: '/pets/2',
        image: '/images/icons/pet.png',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        type: 'system',
        title: '系統通知',
        message: '您的帳號已通過驗證',
        image: '/images/icons/system.png',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 4,
        type: 'shop',
        title: '訂單已建立',
        message: '您的訂單 #T12345 已建立成功，等待付款',
        link: '/member/orders/T12345',
        image: '/images/icons/shop.png',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 5,
        type: 'donation',
        title: '感謝您的捐款',
        message: '感謝您捐款 $500 元，您的愛心將幫助更多流浪動物',
        link: '/donate/history',
        image: '/images/icons/donation.png',
        isRead: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error('獲取通知失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知失敗' },
      { status: 500 }
    )
  }
}

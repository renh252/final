import { NextResponse } from 'next/server';

// 模拟用户数据
const mockUsers = [
  { id: 1, email: 'test@example.com', password: 'password123', name: '測試用戶' },
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '請輸入電子郵件和密碼'
      }, { status: 400 });
    }

    // 查找用户
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // 模拟生成 token
      const token = `mock_token_${user.id}_${Date.now()}`;

      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '電子郵件或密碼錯誤'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '登入時發生錯誤，請稍後再試'
    }, { status: 500 });
  }
}
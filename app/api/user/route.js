import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 这里应该是从数据库获取用户信息的逻辑
    // 以下是示例数据，您需要替换为实际的数据库查询
    const userData = {
      name: '張三',
      phone: '1234567890',
      birthday: '1990-01-01',
      forumId: 'user123',
      address: '北京市朝陽區台南市永康區南台街一號',
      avatarUrl: 'https://example.com/avatar.jpg',
      nickname: '愛心小天使'
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nickname } = await request.json();

    // 这里应该是更新数据库中用户昵称的逻辑
    // 以下是示例代码，您需要替换为实际的数据库更新操作
    console.log('Updating nickname to:', nickname);

    // 假设更新成功
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating nickname:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
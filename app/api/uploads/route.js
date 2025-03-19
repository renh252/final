import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyJwtToken } from '@/app/utils/auth'; // 假設有此工具函數
import { mkdir } from 'fs/promises';

// 確保上傳目錄存在
const ensureUploadDir = async () => {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (error) {
    console.error('建立上傳目錄失敗:', error);
    throw error;
  }
};

// 圖片上傳處理
export async function POST(request) {
  try {
    // 驗證用戶身份
    const token = request.cookies.get('token')?.value;
    const userData = await verifyJwtToken(token);
    
    if (!userData) {
      return NextResponse.json(
        { message: '未登入或session已過期' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { message: '沒有找到上傳的圖片' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: '僅支援 JPG, PNG, GIF 和 WebP 格式' },
        { status: 400 }
      );
    }

    // 驗證文件大小 (5MB 上限)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: '圖片大小不能超過 5MB' },
        { status: 400 }
      );
    }

    const uploadDir = await ensureUploadDir();
    
    // 產生唯一檔名
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 讀取文件數據並保存
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // 返回 URL
    const url = `/uploads/${fileName}`;
    
    return NextResponse.json({
      url,
      alt: file.name.replace(ext, ''),
      href: ''
    });
  } catch (error) {
    console.error('圖片上傳失敗:', error);
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

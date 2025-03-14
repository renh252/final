import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ message: '沒有上傳的檔案' }, { status: 400 });
    }
    
    // 檢查檔案類型
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ message: '只能上傳圖片檔案' }, { status: 400 });
    }
    
    // 獲取檔案後綴
    const fileExt = fileType.split('/')[1];
    
    // 生成唯一檔案名
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // 將檔案儲存到 public/uploads 目錄
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 確保上傳目錄存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    // 注意: 在生產環境中需要確保目錄存在，可能需要使用 fs.mkdir 創建目錄
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // 返回圖片 URL
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      alt: '上傳的圖片',
    });
  } catch (error) {
    console.error('圖片上傳錯誤:', error);
    return NextResponse.json({ message: '伺服器內部錯誤' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // 禁用內建的 bodyParser，因為我們手動處理 formData
  },
};
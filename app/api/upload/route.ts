import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// 確保上傳目錄存在
const uploadDir = join(process.cwd(), 'public', 'uploads');

// POST /api/upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: '沒有上傳檔案' },
        { status: 400 }
      );
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: '不支援的檔案類型，僅支援 JPG, PNG, GIF 和 WebP' },
        { status: 400 }
      );
    }

    // 檢查檔案大小 (限制為 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: '檔案大小不能超過 5MB' },
        { status: 400 }
      );
    }

    // 確保上傳目錄存在
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 生成唯一檔名
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(uploadDir, fileName);

    // 寫入檔案
    const fileBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));

    // 返回檔案URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
    });
  } catch (error) {
    console.error('上傳檔案時出錯:', error);
    return NextResponse.json(
      { success: false, message: '上傳檔案時發生錯誤' },
      { status: 500 }
    );
  }
}

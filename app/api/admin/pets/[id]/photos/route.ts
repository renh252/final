import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { unlink, mkdir } from 'fs/promises'
import * as mysql from 'mysql2/promise'
import { auth as frontAuth } from '@/app/api/_lib/auth'
import { auth } from '@/app/api/admin/_lib/auth'
import { pool } from '@/app/lib/db'
import sharp from 'sharp'

// 定義最大檔案大小限制 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// 定義允許的檔案類型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// 定義上傳路徑
const UPLOAD_DIR = 'public/uploads/pets'

// 確保上傳目錄存在
async function ensureUploadDir() {
  try {
    await mkdir(join(process.cwd(), UPLOAD_DIR), { recursive: true })
  } catch (error) {
    console.error('創建上傳目錄失敗:', error)
  }
}

// 定義照片行類型
interface PhotoRow extends mysql.RowDataPacket {
  id: number
  pet_id: number
  photo_url: string
  is_main: number
  sort_order: number
  title: string | null
  description: string | null
  created_at: string
}

// POST: 上傳新照片
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conn = await pool.getConnection()
  try {
    // 驗證管理員權限 - 使用後台認證邏輯
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: '未提供授權令牌' }, { status: 401 })
    }

    const admin = await auth.verify(token)
    if (!admin) {
      return NextResponse.json({ error: '無效的授權令牌' }, { status: 401 })
    }

    if (!auth.can(admin, 'pet_management')) {
      return NextResponse.json({ error: '沒有管理寵物的權限' }, { status: 403 })
    }

    // 檢查寵物是否存在
    const [pets] = await conn.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM pets WHERE id = ?',
      [params.id]
    )

    if (!pets[0]) {
      return NextResponse.json({ error: '寵物不存在' }, { status: 404 })
    }

    const formData = await request.formData()

    // 取得所有照片檔案
    const files: File[] = []
    const photosEntries = formData.getAll('photos')

    for (const photoEntry of photosEntries) {
      if (photoEntry instanceof File) {
        files.push(photoEntry)
      }
    }

    // 檢查是否有上傳檔案
    if (files.length === 0) {
      return NextResponse.json({ error: '未提供檔案' }, { status: 400 })
    }

    // 確保上傳目錄存在
    await ensureUploadDir()

    // 檢查是否為第一批照片
    const [existingPhotos] = await conn.execute<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM pet_photos WHERE pet_id = ?',
      [params.id]
    )
    let isFirst = existingPhotos[0].count === 0
    let firstPhotoPath: string | null = null

    // 儲存所有上傳的照片資訊
    const uploadedPhotos: Array<{
      id: number
      photo_url: string
      is_main: number
    }> = []

    // 開始資料庫交易
    await conn.beginTransaction()

    try {
      for (const file of files) {
        // 驗證檔案類型
        if (!ALLOWED_TYPES.includes(file.type)) {
          continue // 跳過不支援的檔案類型
        }

        // 驗證檔案大小
        if (file.size > MAX_FILE_SIZE) {
          continue // 跳過超過大小限制的檔案
        }

        // 生成唯一檔名
        const timestamp = Date.now() + Math.floor(Math.random() * 1000)
        const filename = `${params.id}_${timestamp}.webp`
        const filepath = join(process.cwd(), UPLOAD_DIR, filename)
        const publicPath = `/uploads/pets/${filename}`

        // 讀取檔案內容
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // 使用 sharp 處理圖片
        await sharp(buffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(filepath)

        // 儲存到資料庫
        const [result] = await conn.execute<mysql.ResultSetHeader>(
          'INSERT INTO pet_photos (pet_id, photo_url, is_main) VALUES (?, ?, ?)',
          [params.id, publicPath, isFirst ? 1 : 0]
        )

        // 如果是第一張照片，記錄路徑以便更新寵物主照片
        if (isFirst) {
          firstPhotoPath = publicPath
          // 之後的照片都不是第一張
          isFirst = false
        }

        // 添加到上傳照片列表
        uploadedPhotos.push({
          id: result.insertId,
          photo_url: publicPath,
          is_main: isFirst ? 1 : 0,
        })
      }

      // 如果有新上傳的第一張照片，更新寵物主照片
      if (firstPhotoPath) {
        await conn.execute('UPDATE pets SET main_photo = ? WHERE id = ?', [
          firstPhotoPath,
          params.id,
        ])
      }

      // 提交交易
      await conn.commit()

      return NextResponse.json({
        success: true,
        photos: uploadedPhotos,
        count: uploadedPhotos.length,
      })
    } catch (error) {
      // 發生錯誤時回滾交易
      await conn.rollback()
      throw error
    }
  } catch (error) {
    console.error('上傳照片時發生錯誤:', error)
    return NextResponse.json({ error: '上傳照片失敗' }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// DELETE: 刪除照片
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conn = await pool.getConnection()
  try {
    // 驗證管理員權限 - 使用後台認證邏輯
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: '未提供授權令牌' }, { status: 401 })
    }

    const admin = await auth.verify(token)
    if (!admin) {
      return NextResponse.json({ error: '無效的授權令牌' }, { status: 401 })
    }

    if (!auth.can(admin, 'pet_management')) {
      return NextResponse.json({ error: '沒有管理寵物的權限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: '未提供照片ID' }, { status: 400 })
    }

    // 獲取照片資訊
    const [photos] = await conn.execute<PhotoRow[]>(
      'SELECT * FROM pet_photos WHERE id = ? AND pet_id = ?',
      [photoId, params.id]
    )

    if (photos.length === 0) {
      return NextResponse.json({ error: '照片不存在' }, { status: 404 })
    }

    const photo = photos[0]

    // 如果是主照片，不允許刪除
    if (photo.is_main) {
      return NextResponse.json({ error: '無法刪除主照片' }, { status: 400 })
    }

    // 刪除資料庫記錄
    await conn.execute('DELETE FROM pet_photos WHERE id = ?', [photoId])

    // 刪除實際檔案
    const filepath = join(process.cwd(), 'public', photo.photo_url)
    await unlink(filepath).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('刪除照片時發生錯誤:', error)
    return NextResponse.json({ error: '刪除照片失敗' }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// PUT: 設置主照片
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conn = await pool.getConnection()
  try {
    // 驗證管理員權限 - 使用後台認證邏輯
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: '未提供授權令牌' }, { status: 401 })
    }

    const admin = await auth.verify(token)
    if (!admin) {
      return NextResponse.json({ error: '無效的授權令牌' }, { status: 401 })
    }

    if (!auth.can(admin, 'pet_management')) {
      return NextResponse.json({ error: '沒有管理寵物的權限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: '未提供照片ID' }, { status: 400 })
    }

    // 開始資料庫交易
    await conn.beginTransaction()

    try {
      // 取消原有主照片
      await conn.execute('UPDATE pet_photos SET is_main = 0 WHERE pet_id = ?', [
        params.id,
      ])

      // 設置新的主照片
      const [photos] = await conn.execute<PhotoRow[]>(
        'SELECT photo_url FROM pet_photos WHERE id = ? AND pet_id = ?',
        [photoId, params.id]
      )

      if (photos.length === 0) {
        throw new Error('照片不存在')
      }

      await conn.execute('UPDATE pet_photos SET is_main = 1 WHERE id = ?', [
        photoId,
      ])

      // 更新寵物主照片
      await conn.execute('UPDATE pets SET main_photo = ? WHERE id = ?', [
        photos[0].photo_url,
        params.id,
      ])

      await conn.commit()

      return NextResponse.json({ success: true })
    } catch (error) {
      await conn.rollback()
      throw error
    }
  } catch (error) {
    console.error('設置主照片時發生錯誤:', error)
    return NextResponse.json({ error: '設置主照片失敗' }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

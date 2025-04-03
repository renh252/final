// app/api/user/route.js
import { NextResponse } from 'next/server'
import { database } from '@/app/api/_lib/db' // 引入資料庫模組
import jwt from 'jsonwebtoken' // 引入 JWT
import formidable from 'formidable-serverless' // 用於處理 multipart/form-data
import fs from 'fs/promises'
import path from 'path'

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET

// Configure formidable options
const formidableConfig = {
  keepExtensions: true, // 保留檔案的原始擴展名
  maxFileSize: 2 * 1024 * 1024, // 限制檔案大小為 2MB (與前端一致)
  // uploadDir: path.join(process.cwd(), '/public/uploads/profile_photos'), // 儲存上傳檔案的目錄 (建議放在 public 資料夾內)
}

// 新的 App Router 配置方式
export const dynamic = 'force-dynamic'

async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable(formidableConfig)
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    })
  })
}

async function saveFile(file, newFilename) {
  const oldPath = file.filepath
  const newPath = path.join(
    process.cwd(),
    '/public/uploads/profile_photos',
    newFilename
  )
  await fs.mkdir(path.dirname(newPath), { recursive: true }) // 確保目錄存在
  await fs.rename(oldPath, newPath)
  return `/uploads/profile_photos/${newFilename}` // 返回儲存的路徑 (相對於 public)
}

export async function POST(request) {
  try {
    // 從請求標頭中獲取 JWT Token
    const authorizationHeader = request.headers.get('Authorization')

    if (!authorizationHeader) {
      return NextResponse.json({ message: '未提供驗證憑證' }, { status: 401 })
    }

    const [authType, token] = authorizationHeader.split(' ')

    if (!token) {
      return NextResponse.json(
        { message: '驗證憑證格式不正確' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      console.error('JWT 驗證失敗:', error.message)
      return NextResponse.json(
        { message: '驗證憑證無效', error: error.message },
        { status: 401 }
      )
    }

    let userId
    if (decoded.userId) {
      userId = decoded.userId
    } else if (decoded.uid) {
      // 根據 Firebase UID 查詢 user_id
      const [userRows] = await database.execute(
        'SELECT user_id FROM users WHERE firebase_uid = ?',
        [decoded.uid]
      )
      if (userRows.length === 0) {
        return NextResponse.json(
          { message: '找不到對應的 Google 登入使用者' },
          { status: 404 }
        )
      }
      userId = userRows[0].user_id
    } else {
      return NextResponse.json(
        { message: '無效的驗證憑證 Payload' },
        { status: 401 }
      )
    }

    // 解析 form data
    const { files } = await parseFormData(request)

    const profilePhotoFile = files.profile_photo

    if (!profilePhotoFile) {
      return NextResponse.json({ message: '未上傳圖片檔案' }, { status: 400 })
    }

    if (Array.isArray(profilePhotoFile)) {
      return NextResponse.json(
        { message: '僅允許上傳單個圖片檔案' },
        { status: 400 }
      )
    }

    // 產生新的檔案名稱 (可以根據 user_id 和時間戳記)
    const fileExtension = path.extname(profilePhotoFile.originalFilename)
    const newFilename = `profile_${userId}_${Date.now()}${fileExtension}`

    // 儲存檔案
    const publicPath = await saveFile(profilePhotoFile, newFilename)

    // 更新資料庫中的使用者資料
    const [updateResult] = await database.execute(
      'UPDATE users SET profile_picture = ? WHERE user_id = ?',
      [publicPath, userId]
    )

    if (updateResult.affectedRows > 0) {
      // 查詢更新後的的使用者資料並返回
      const [userRows] = await database.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
      )
      return NextResponse.json(userRows[0])
    } else {
      console.error('更新使用者資料庫失敗')
      // 可以考慮刪除剛上傳的檔案如果資料庫更新失敗
      await fs.unlink(path.join(process.cwd(), '/public', publicPath))
      return NextResponse.json(
        { message: '更新使用者資料失敗' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('上傳大頭照 API 錯誤:', error)
    return NextResponse.json(
      { message: '伺服器錯誤', error: error.message },
      { status: 500 }
    )
  }
}

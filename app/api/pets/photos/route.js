import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

// 獲取寵物照片 API
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')

    if (!petId) {
      return NextResponse.json(
        { error: '缺少必要參數 pet_id' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    try {
      // 獲取指定寵物的所有照片
      const [photos] = await connection.execute(
        `
        SELECT 
          id,
          pet_id,
          photo_url,
          is_main,
          sort_order,
          title,
          description,
          created_at
        FROM pet_photos
        WHERE pet_id = ?
        ORDER BY is_main DESC, sort_order ASC
        `,
        [petId]
      )

      return NextResponse.json({ photos })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('獲取寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

// 新增寵物照片 API
export async function POST(request) {
  try {
    const body = await request.json()
    const { pet_id, photo_url, is_main, sort_order, title, description } = body

    if (!pet_id || !photo_url) {
      return NextResponse.json(
        { error: '缺少必要參數 pet_id 或 photo_url' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    try {
      // 如果設置為主照片，先將該寵物的所有照片設為非主照片
      if (is_main) {
        await connection.execute(
          `
          UPDATE pet_photos
          SET is_main = 0
          WHERE pet_id = ?
          `,
          [pet_id]
        )
      }

      // 插入新照片
      const [result] = await connection.execute(
        `
        INSERT INTO pet_photos
        (pet_id, photo_url, is_main, sort_order, title, description)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          pet_id,
          photo_url,
          is_main ? 1 : 0,
          sort_order || 0,
          title || null,
          description || null,
        ]
      )

      // 如果設置為主照片，同時更新 pets 表的 main_photo 欄位
      if (is_main) {
        await connection.execute(
          `
          UPDATE pets
          SET main_photo = ?
          WHERE id = ?
          `,
          [photo_url, pet_id]
        )
      }

      return NextResponse.json({
        success: true,
        message: '照片新增成功',
        photo_id: result.insertId,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('新增寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '新增寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

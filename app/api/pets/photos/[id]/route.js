import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

// 獲取單一寵物照片
export async function GET(request, { params }) {
  try {
    const id = params.id

    const connection = await pool.getConnection()

    try {
      // 獲取指定照片
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
        WHERE id = ?
        `,
        [id]
      )

      if (photos.length === 0) {
        return NextResponse.json({ error: '找不到此照片' }, { status: 404 })
      }

      return NextResponse.json({ photo: photos[0] })
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

// 更新寵物照片
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { photo_url, is_main, sort_order, title, description } = body

    const connection = await pool.getConnection()

    try {
      // 先獲取照片信息，確認存在並獲取 pet_id
      const [photos] = await connection.execute(
        `SELECT pet_id, is_main FROM pet_photos WHERE id = ?`,
        [id]
      )

      if (photos.length === 0) {
        return NextResponse.json({ error: '找不到此照片' }, { status: 404 })
      }

      const pet_id = photos[0].pet_id
      const was_main = photos[0].is_main

      // 如果設置為主照片，先將該寵物的所有照片設為非主照片
      if (is_main && !was_main) {
        await connection.execute(
          `
          UPDATE pet_photos
          SET is_main = 0
          WHERE pet_id = ?
          `,
          [pet_id]
        )
      }

      // 更新照片信息
      const updateFields = []
      const updateValues = []

      if (photo_url !== undefined) {
        updateFields.push('photo_url = ?')
        updateValues.push(photo_url)
      }

      if (is_main !== undefined) {
        updateFields.push('is_main = ?')
        updateValues.push(is_main ? 1 : 0)
      }

      if (sort_order !== undefined) {
        updateFields.push('sort_order = ?')
        updateValues.push(sort_order)
      }

      if (title !== undefined) {
        updateFields.push('title = ?')
        updateValues.push(title)
      }

      if (description !== undefined) {
        updateFields.push('description = ?')
        updateValues.push(description)
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: '沒有提供要更新的欄位' },
          { status: 400 }
        )
      }

      await connection.execute(
        `
        UPDATE pet_photos
        SET ${updateFields.join(', ')}
        WHERE id = ?
        `,
        [...updateValues, id]
      )

      // 如果設置為主照片，同時更新 pets 表的 main_photo 欄位
      if (is_main && !was_main && photo_url) {
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
        message: '照片更新成功',
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('更新寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '更新寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

// 刪除寵物照片
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    const connection = await pool.getConnection()

    try {
      // 先獲取照片信息，確認存在並獲取 pet_id 和 is_main
      const [photos] = await connection.execute(
        `SELECT pet_id, is_main, photo_url FROM pet_photos WHERE id = ?`,
        [id]
      )

      if (photos.length === 0) {
        return NextResponse.json({ error: '找不到此照片' }, { status: 404 })
      }

      const { pet_id, is_main, photo_url } = photos[0]

      // 刪除照片
      await connection.execute(`DELETE FROM pet_photos WHERE id = ?`, [id])

      // 如果刪除的是主照片，需要更新 pets 表並設置新的主照片
      if (is_main) {
        // 查找該寵物的其他照片
        const [otherPhotos] = await connection.execute(
          `
          SELECT id, photo_url
          FROM pet_photos
          WHERE pet_id = ?
          ORDER BY sort_order ASC
          LIMIT 1
          `,
          [pet_id]
        )

        if (otherPhotos.length > 0) {
          // 將第一張照片設為主照片
          await connection.execute(
            `
            UPDATE pet_photos
            SET is_main = 1
            WHERE id = ?
            `,
            [otherPhotos[0].id]
          )

          // 更新 pets 表的 main_photo
          await connection.execute(
            `
            UPDATE pets
            SET main_photo = ?
            WHERE id = ?
            `,
            [otherPhotos[0].photo_url, pet_id]
          )
        } else {
          // 如果沒有其他照片，清空 pets 表的 main_photo
          await connection.execute(
            `
            UPDATE pets
            SET main_photo = ''
            WHERE id = ?
            `,
            [pet_id]
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: '照片刪除成功',
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('刪除寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '刪除寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

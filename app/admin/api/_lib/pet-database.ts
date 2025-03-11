import { executeQuery } from './database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// 寵物資料介面
export interface Pet {
  id?: number
  name: string
  gender: string
  species: string
  variety: string
  birthday?: string
  weight?: number
  chip_number?: string
  fixed?: number
  story?: string
  store_id?: number
  created_at?: string
  is_adopted: number
  main_photo?: string
}

// 寵物照片介面
export interface PetPhoto {
  id?: number
  pet_id: number
  photo_url: string
  is_main: number
  sort_order?: number
  title?: string
  description?: string
  created_at?: string
}

// 獲取所有寵物列表
export async function getAllPets() {
  try {
    const query = `
      SELECT 
        p.*,
        ps.name as store_name
      FROM pets p
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      ORDER BY p.id DESC
    `
    const result = await executeQuery<Pet & RowDataPacket>(query)
    return result
  } catch (error) {
    console.error('獲取寵物列表時發生錯誤：', error)
    throw error
  }
}

// 獲取單個寵物詳情
export async function getPetById(id: number) {
  try {
    const query = `
      SELECT 
        p.*,
        ps.name as store_name
      FROM pets p
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      WHERE p.id = ?
    `
    const result = await executeQuery<Pet & RowDataPacket>(query, [id])
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error(`獲取寵物 ID: ${id} 時發生錯誤：`, error)
    throw error
  }
}

// 新增寵物
export async function createPet(pet: Pet) {
  try {
    const query = `
      INSERT INTO pets (
        name, gender, species, variety, birthday, weight, 
        chip_number, fixed, story, store_id, is_adopted, main_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      pet.name,
      pet.gender,
      pet.species,
      pet.variety,
      pet.birthday || null,
      pet.weight || null,
      pet.chip_number || null,
      pet.fixed !== undefined ? pet.fixed : null,
      pet.story || null,
      pet.store_id || null,
      pet.is_adopted,
      pet.main_photo || null,
    ]

    const result = await executeQuery<ResultSetHeader>(query, values)
    const petId = result[0]?.insertId

    // 如果成功創建，獲取完整的寵物數據
    if (petId) {
      const newPet = await getPetById(petId)
      return petId
    }

    return petId
  } catch (error) {
    console.error('新增寵物時發生錯誤：', error)
    throw error
  }
}

// 更新寵物
export async function updatePet(id: number, pet: Partial<Pet>) {
  try {
    console.log(`嘗試更新寵物 ID: ${id}，數據:`, pet)

    // 構建動態更新查詢
    const updateFields: string[] = []
    const values: any[] = []

    // 檢查每個可能的欄位
    if (pet.name !== undefined) {
      updateFields.push('name = ?')
      values.push(pet.name)
    }
    if (pet.gender !== undefined) {
      updateFields.push('gender = ?')
      values.push(pet.gender)
    }
    if (pet.species !== undefined) {
      updateFields.push('species = ?')
      values.push(pet.species)
    }
    if (pet.variety !== undefined) {
      updateFields.push('variety = ?')
      values.push(pet.variety)
    }
    if (pet.birthday !== undefined) {
      updateFields.push('birthday = ?')
      values.push(pet.birthday === '' ? null : pet.birthday)
    }
    if (pet.weight !== undefined) {
      updateFields.push('weight = ?')
      // 處理 weight 可能是字符串或數字的情況
      const weightValue =
        typeof pet.weight === 'string'
          ? pet.weight === ''
            ? null
            : Number(pet.weight) || null
          : pet.weight === null
          ? null
          : pet.weight
      values.push(weightValue)
    }
    if (pet.chip_number !== undefined) {
      updateFields.push('chip_number = ?')
      values.push(pet.chip_number === '' ? null : pet.chip_number)
    }
    if (pet.fixed !== undefined) {
      updateFields.push('fixed = ?')
      values.push(Number(pet.fixed) || 0)
    }
    if (pet.story !== undefined) {
      updateFields.push('story = ?')
      values.push(pet.story === '' ? null : pet.story)
    }
    if (pet.store_id !== undefined) {
      updateFields.push('store_id = ?')
      values.push(Number(pet.store_id) || null)
    }
    if (pet.is_adopted !== undefined) {
      updateFields.push('is_adopted = ?')
      values.push(Number(pet.is_adopted) || 0)
    }
    if (pet.main_photo !== undefined) {
      updateFields.push('main_photo = ?')
      values.push(
        pet.main_photo === '' ? '/images/default_no_pet.jpg' : pet.main_photo
      )
    }

    // 如果沒有要更新的欄位，則返回
    if (updateFields.length === 0) {
      console.log(`沒有要更新的欄位，寵物 ID: ${id}`)
      return { affectedRows: 0 }
    }

    // 添加 ID 到值數組
    values.push(id)

    const query = `
      UPDATE pets
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    console.log(`執行 SQL 查詢: ${query}，參數:`, values)

    const result = await executeQuery<ResultSetHeader>(query, values)
    console.log(
      `更新寵物成功，寵物 ID: ${id}，影響行數: ${result[0]?.affectedRows}`
    )
    return { affectedRows: result[0]?.affectedRows || 0 }
  } catch (error) {
    console.error(`更新寵物 ID: ${id} 時發生錯誤：`, error)
    throw error
  }
}

// 刪除寵物
export async function deletePet(id: number) {
  try {
    const query = `DELETE FROM pets WHERE id = ?`
    const result = await executeQuery<ResultSetHeader>(query, [id])
    return { affectedRows: result[0]?.affectedRows || 0 }
  } catch (error) {
    console.error(`刪除寵物 ID: ${id} 時發生錯誤：`, error)
    throw error
  }
}

// 獲取寵物照片
export async function getPetPhotos(petId: number) {
  try {
    const query = `
      SELECT * FROM pet_photos
      WHERE pet_id = ?
      ORDER BY is_main DESC, sort_order ASC
    `
    const result = await executeQuery<PetPhoto & RowDataPacket>(query, [petId])
    return result
  } catch (error) {
    console.error(`獲取寵物 ID: ${petId} 的照片時發生錯誤：`, error)
    throw error
  }
}

// 新增寵物照片
export async function createPetPhoto(photo: PetPhoto) {
  try {
    // 如果設置為主照片，先將該寵物的所有照片設為非主照片
    if (photo.is_main) {
      await executeQuery(`UPDATE pet_photos SET is_main = 0 WHERE pet_id = ?`, [
        photo.pet_id,
      ])
    }

    const query = `
      INSERT INTO pet_photos (
        pet_id, photo_url, is_main, sort_order, title, description
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    const values = [
      photo.pet_id,
      photo.photo_url,
      photo.is_main,
      photo.sort_order || 0,
      photo.title || null,
      photo.description || null,
    ]

    const result = await executeQuery<ResultSetHeader>(query, values)

    // 如果設置為主照片，同時更新 pets 表的 main_photo 欄位
    if (photo.is_main) {
      await executeQuery(`UPDATE pets SET main_photo = ? WHERE id = ?`, [
        photo.photo_url,
        photo.pet_id,
      ])
    }

    return result[0]?.insertId
  } catch (error) {
    console.error('新增寵物照片時發生錯誤：', error)
    throw error
  }
}

// 更新寵物照片
export async function updatePetPhoto(id: number, photo: Partial<PetPhoto>) {
  try {
    // 先獲取照片信息，確認存在並獲取 pet_id
    const existingPhotoQuery = `SELECT pet_id, is_main FROM pet_photos WHERE id = ?`
    const existingPhotos = await executeQuery<PetPhoto & RowDataPacket>(
      existingPhotoQuery,
      [id]
    )

    if (existingPhotos.length === 0) {
      throw new Error('找不到此照片')
    }

    const petId = existingPhotos[0].pet_id
    const wasMain = existingPhotos[0].is_main

    // 如果設置為主照片，先將該寵物的所有照片設為非主照片
    if (photo.is_main && !wasMain) {
      await executeQuery(`UPDATE pet_photos SET is_main = 0 WHERE pet_id = ?`, [
        petId,
      ])
    }

    // 構建動態更新查詢
    const updateFields: string[] = []
    const values: any[] = []

    if (photo.photo_url !== undefined) {
      updateFields.push('photo_url = ?')
      values.push(photo.photo_url)
    }
    if (photo.is_main !== undefined) {
      updateFields.push('is_main = ?')
      values.push(photo.is_main)
    }
    if (photo.sort_order !== undefined) {
      updateFields.push('sort_order = ?')
      values.push(photo.sort_order)
    }
    if (photo.title !== undefined) {
      updateFields.push('title = ?')
      values.push(photo.title)
    }
    if (photo.description !== undefined) {
      updateFields.push('description = ?')
      values.push(photo.description)
    }

    // 如果沒有要更新的欄位，則返回
    if (updateFields.length === 0) {
      return { affectedRows: 0 }
    }

    // 添加 ID 到值數組
    values.push(id)

    const query = `
      UPDATE pet_photos
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    const result = await executeQuery<ResultSetHeader>(query, values)

    // 如果設置為主照片，同時更新 pets 表的 main_photo 欄位
    if (photo.is_main && !wasMain && photo.photo_url) {
      await executeQuery(`UPDATE pets SET main_photo = ? WHERE id = ?`, [
        photo.photo_url,
        petId,
      ])
    }

    return { affectedRows: result[0]?.affectedRows || 0 }
  } catch (error) {
    console.error(`更新寵物照片 ID: ${id} 時發生錯誤：`, error)
    throw error
  }
}

// 刪除寵物照片
export async function deletePetPhoto(id: number) {
  try {
    // 先獲取照片信息，確認存在並獲取 pet_id 和 is_main
    const existingPhotoQuery = `SELECT pet_id, is_main FROM pet_photos WHERE id = ?`
    const existingPhotos = await executeQuery<PetPhoto & RowDataPacket>(
      existingPhotoQuery,
      [id]
    )

    if (existingPhotos.length === 0) {
      throw new Error('找不到此照片')
    }

    const petId = existingPhotos[0].pet_id
    const wasMain = existingPhotos[0].is_main

    // 刪除照片
    const query = `DELETE FROM pet_photos WHERE id = ?`
    const result = await executeQuery<ResultSetHeader>(query, [id])

    // 如果刪除的是主照片，需要更新 pets 表並設置新的主照片
    if (wasMain) {
      // 查找該寵物的其他照片
      const otherPhotosQuery = `
        SELECT id, photo_url
        FROM pet_photos
        WHERE pet_id = ?
        ORDER BY sort_order ASC
        LIMIT 1
      `
      const otherPhotos = await executeQuery<PetPhoto & RowDataPacket>(
        otherPhotosQuery,
        [petId]
      )

      if (otherPhotos.length > 0) {
        // 將第一張照片設為主照片
        await executeQuery(`UPDATE pet_photos SET is_main = 1 WHERE id = ?`, [
          otherPhotos[0].id,
        ])

        // 更新 pets 表的 main_photo
        await executeQuery(`UPDATE pets SET main_photo = ? WHERE id = ?`, [
          otherPhotos[0].photo_url,
          petId,
        ])
      } else {
        // 如果沒有其他照片，清空 pets 表的 main_photo
        await executeQuery(`UPDATE pets SET main_photo = '' WHERE id = ?`, [
          petId,
        ])
      }
    }

    return { affectedRows: result[0]?.affectedRows || 0 }
  } catch (error) {
    console.error(`刪除寵物照片 ID: ${id} 時發生錯誤：`, error)
    throw error
  }
}

// 獲取所有寵物店鋪
export async function getAllPetStores() {
  try {
    const query = `SELECT id, name FROM pet_store ORDER BY name`
    const result = await executeQuery<RowDataPacket>(query)
    return result
  } catch (error) {
    console.error('獲取寵物店鋪列表時發生錯誤：', error)
    throw error
  }
}

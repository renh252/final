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

    // 處理日期格式，將 ISO 格式轉換為 YYYY-MM-DD 格式
    let birthdayValue = null
    if (pet.birthday && pet.birthday !== '') {
      try {
        // 嘗試解析日期
        const date = new Date(pet.birthday)
        // 格式化為 YYYY-MM-DD
        birthdayValue = date.toISOString().split('T')[0]
        console.log(`轉換日期格式: ${pet.birthday} -> ${birthdayValue}`)
      } catch (error) {
        console.error(`日期格式轉換錯誤: ${pet.birthday}`, error)
        birthdayValue = null
      }
    }

    const values = [
      pet.name,
      pet.gender,
      pet.species,
      pet.variety,
      birthdayValue,
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

    // 先獲取原始數據，用於比較和調試
    const originalPet = await getPetById(id)
    console.log(`更新前的原始寵物數據:`, originalPet)

    // 構建動態更新查詢
    const updateFields: string[] = []
    const values: any[] = []
    const debugChanges: any = {} // 用於記錄欄位變更

    // 檢查每個可能的欄位
    if (pet.name !== undefined && pet.name !== originalPet?.name) {
      updateFields.push('name = ?')
      values.push(pet.name)
      debugChanges.name = { old: originalPet?.name, new: pet.name }
    }
    if (pet.gender !== undefined && pet.gender !== originalPet?.gender) {
      updateFields.push('gender = ?')
      values.push(pet.gender)
      debugChanges.gender = { old: originalPet?.gender, new: pet.gender }
    }
    if (pet.species !== undefined && pet.species !== originalPet?.species) {
      updateFields.push('species = ?')
      values.push(pet.species)
      debugChanges.species = { old: originalPet?.species, new: pet.species }
    }
    if (pet.variety !== undefined && pet.variety !== originalPet?.variety) {
      updateFields.push('variety = ?')
      values.push(pet.variety)
      debugChanges.variety = { old: originalPet?.variety, new: pet.variety }
    }
    if (pet.birthday !== undefined) {
      // 處理日期格式，將 ISO 格式轉換為 YYYY-MM-DD 格式
      let birthdayValue = null
      if (pet.birthday && pet.birthday !== '') {
        try {
          // 嘗試解析日期
          const date = new Date(pet.birthday)
          // 格式化為 YYYY-MM-DD
          birthdayValue = date.toISOString().split('T')[0]
          console.log(`轉換日期格式: ${pet.birthday} -> ${birthdayValue}`)
        } catch (error) {
          console.error(`日期格式轉換錯誤: ${pet.birthday}`, error)
          birthdayValue = null
        }
      }

      // 對比轉換後的格式
      const originalBirthday = originalPet?.birthday
        ? new Date(originalPet.birthday).toISOString().split('T')[0]
        : null

      if (birthdayValue !== originalBirthday) {
        updateFields.push('birthday = ?')
        values.push(birthdayValue)
        debugChanges.birthday = { old: originalBirthday, new: birthdayValue }
      }
    }
    if (pet.weight !== undefined) {
      // 處理 weight 可能是字符串或數字的情況
      const weightValue =
        typeof pet.weight === 'string'
          ? pet.weight === ''
            ? null
            : Number(pet.weight) || null
          : pet.weight === null
          ? null
          : pet.weight

      if (weightValue !== originalPet?.weight) {
        updateFields.push('weight = ?')
        values.push(weightValue)
        debugChanges.weight = { old: originalPet?.weight, new: weightValue }
      }
    }
    if (pet.chip_number !== undefined) {
      const chipValue = pet.chip_number === '' ? null : pet.chip_number
      if (chipValue !== originalPet?.chip_number) {
        updateFields.push('chip_number = ?')
        values.push(chipValue)
        debugChanges.chip_number = {
          old: originalPet?.chip_number,
          new: chipValue,
        }
      }
    }
    if (pet.fixed !== undefined) {
      const fixedValue = Number(pet.fixed) || 0
      if (fixedValue !== originalPet?.fixed) {
        updateFields.push('fixed = ?')
        values.push(fixedValue)
        debugChanges.fixed = { old: originalPet?.fixed, new: fixedValue }
      }
    }
    if (pet.story !== undefined) {
      const storyValue = pet.story === '' ? null : pet.story
      if (storyValue !== originalPet?.story) {
        updateFields.push('story = ?')
        values.push(storyValue)
        debugChanges.story = { old: originalPet?.story, new: storyValue }
      }
    }
    if (pet.store_id !== undefined) {
      // 正確處理 store_id，Number(0) 仍應為 0，不轉為 null
      const storeIdValue = pet.store_id === null ? null : Number(pet.store_id)
      // 使用 === 嚴格比較會導致 null 和 0 無法區分，所以使用 JSON.stringify
      if (
        JSON.stringify(storeIdValue) !== JSON.stringify(originalPet?.store_id)
      ) {
        updateFields.push('store_id = ?')
        values.push(storeIdValue)
        debugChanges.store_id = {
          old: originalPet?.store_id,
          new: storeIdValue,
        }
      }
    }
    if (pet.is_adopted !== undefined) {
      const adoptedValue = Number(pet.is_adopted) || 0
      if (adoptedValue !== originalPet?.is_adopted) {
        updateFields.push('is_adopted = ?')
        values.push(adoptedValue)
        debugChanges.is_adopted = {
          old: originalPet?.is_adopted,
          new: adoptedValue,
        }
      }
    }
    if (pet.main_photo !== undefined) {
      const photoValue =
        pet.main_photo === '' ? '/images/default_no_pet.jpg' : pet.main_photo
      if (photoValue !== originalPet?.main_photo) {
        updateFields.push('main_photo = ?')
        values.push(photoValue)
        debugChanges.main_photo = {
          old: originalPet?.main_photo,
          new: photoValue,
        }
      }
    }

    // 打印欄位變更記錄，用於調試
    console.log(`欄位變更記錄:`, debugChanges)

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
      `更新寵物結果，寵物 ID: ${id}，影響行數: ${result[0]?.affectedRows}，結果:`,
      result
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

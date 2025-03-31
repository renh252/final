import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

// 計算寵物顯示年齡的函數
function calculateAgeDisplay(birthday) {
  if (!birthday) return '未知'

  const birthDate = new Date(birthday)
  const today = new Date()

  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()

  // 如果當月日期小於出生日期，減去一個月
  if (today.getDate() < birthDate.getDate()) {
    months--
  }

  // 調整年份和月份
  if (months < 0) {
    years--
    months += 12
  }

  // 根據年齡決定顯示方式
  return years > 0 ? `${years}歲` : `${months}個月`
}

export async function GET(request, { params }) {
  try {
    const id = params.id

    const connection = await pool.getConnection()

    // 獲取寵物詳情
    const [petDetails] = await connection.execute(
      `
      SELECT 
        p.*, 
        ps.name as store_name, 
        ps.address as store_address,
        ps.phone as store_phone,
        ps.lat as store_lat,
        ps.lng as store_lng
      FROM pets p
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      WHERE p.id = ?
    `,
      [id]
    )

    if (!petDetails || petDetails.length === 0) {
      connection.release()
      return NextResponse.json({ error: '找不到寵物' }, { status: 404 })
    }

    // 獲取寵物照片
    const [petPhotos] = await connection.execute(
      `
      SELECT 
        id, 
        photo_url, 
        is_main, 
        sort_order,
        title,
        description
      FROM pet_photos
      WHERE pet_id = ?
      ORDER BY is_main DESC, sort_order ASC
    `,
      [id]
    )

    // 設置主要照片
    let mainPhoto = '/images/default_no_pet.jpg'
    if (petPhotos && petPhotos.length > 0) {
      const mainPhotoObj =
        petPhotos.find((photo) => photo.is_main === 1) || petPhotos[0]
      mainPhoto = mainPhotoObj.photo_url
    }

    const pet = petDetails[0]

    // 計算年齡
    const ageDisplay = calculateAgeDisplay(pet.birthday)

    // 獲取店家資訊，用於地點顯示
    const [stores] = await connection.execute(`
      SELECT id, address, name FROM pet_store
    `)

    // 建立店家 ID 到地址的映射
    const storeMap = {}
    stores.forEach((store) => {
      storeMap[store.id] = {
        address: store.address,
        name: store.name,
      }
    })

    // 獲取寵物特質
    const [petTraits] = await connection.execute(
      `
      SELECT 
        pt.pet_id,
        pt.trait_id,
        ptl.trait_tag,
        ptl.description as trait_description
      FROM pet_trait pt
      JOIN pet_trait_list ptl ON pt.trait_id = ptl.id
      WHERE pt.pet_id = ?
      `,
      [id]
    )

    // 獲取寵物最近活動
    const [recentActivities] = await connection.execute(
      `
      SELECT 
        id,
        pet_id,
        date,
        content
      FROM pets_recent_activities
      WHERE pet_id = ?
      ORDER BY date DESC
      LIMIT 10
      `,
      [id]
    )

    // 處理年齡和位置顯示
    let locationDisplay = '未知位置'
    let storeName = null
    if (pet.store_id && storeMap[pet.store_id]) {
      const store = storeMap[pet.store_id]
      if (store.address) {
        // 從地址中提取城市名稱（假設前三個字是城市名）
        locationDisplay = store.address.substring(0, 3)
      }
      storeName = store.name
    }

    // 處理性別顯示
    const genderDisplay =
      pet.gender === '公' ? '男生' : pet.gender === '母' ? '女生' : pet.gender

    const processedPet = {
      ...pet,
      age: ageDisplay,
      location: locationDisplay,
      store_name: storeName,
      gender: pet.gender,
      gender_display: genderDisplay,
      photos: petPhotos || [],
      main_photo: mainPhoto,
      traits: petTraits,
      recent_activities: recentActivities,
    }

    connection.release()

    return NextResponse.json({ pet: processedPet })
  } catch (error) {
    console.error('獲取寵物資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

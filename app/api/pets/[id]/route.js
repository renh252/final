import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

export async function GET(request, { params }) {
  try {
    const id = params.id

    const connection = await pool.getConnection()

    // 獲取特定寵物資料
    const [pets] = await connection.execute(
      `
      SELECT 
        p.*,
        CASE 
          WHEN p.variety LIKE '%貓%' THEN '貓'
          WHEN p.variety LIKE '%犬%' OR p.variety LIKE '%狗%' THEN '狗'
          ELSE '其他'
        END as species_name,
        p.variety as breed_name
      FROM pets p
      WHERE p.id = ?
    `,
      [id]
    )

    if (pets.length === 0) {
      connection.release()
      return NextResponse.json({ error: '找不到此寵物' }, { status: 404 })
    }

    // 獲取寵物照片
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
      [id]
    )

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
    const pet = pets[0]

    // 處理年齡顯示
    const birthDate = pet.birthday ? new Date(pet.birthday) : null
    let ageDisplay = pet.age ? `${pet.age}歲` : '未知'
    let ageYear = 0
    let ageMonth = 0

    if (birthDate) {
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

      ageYear = years
      ageMonth = months

      // 根據年齡決定顯示方式
      ageDisplay = years > 0 ? `${years}歲` : `${months}個月`
    }

    // 處理位置顯示 - 根據 store_id 獲取地點
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
      age_year: ageYear,
      age_month: ageMonth,
      location: locationDisplay,
      store_name: storeName,
      gender: pet.gender,
      gender_display: genderDisplay,
      photos: photos,
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

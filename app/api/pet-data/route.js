import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const speciesId = searchParams.get('species_id')

    const connection = await pool.getConnection()

    let responseData = {}

    // 獲取物種資料
    if (type === 'all' || type === 'species') {
      const [results] = await connection.execute(`
        SELECT DISTINCT
          CASE 
            WHEN variety LIKE '%貓%' THEN '貓'
            WHEN variety LIKE '%犬%' OR variety LIKE '%狗%' THEN '狗'
            ELSE '其他'
          END as name,
          CASE 
            WHEN variety LIKE '%貓%' THEN 2
            WHEN variety LIKE '%犬%' OR variety LIKE '%狗%' THEN 1
            ELSE 3
          END as id
        FROM pets
        ORDER BY id
      `)

      // 去除重複的物種
      const species = Array.from(
        new Set(results.map((r) => JSON.stringify(r)))
      ).map((s) => JSON.parse(s))

      responseData.species = species
    }

    // 獲取品種資料
    if ((type === 'all' || type === 'breeds') && speciesId) {
      const [results] = await connection.execute(
        `
        SELECT DISTINCT
          variety as name
        FROM pets
        WHERE 
          CASE 
            WHEN ? = '1' THEN variety LIKE '%犬%' OR variety LIKE '%狗%'
            WHEN ? = '2' THEN variety LIKE '%貓%'
            ELSE NOT (variety LIKE '%貓%' OR variety LIKE '%犬%' OR variety LIKE '%狗%')
          END
        ORDER BY variety
      `,
        [speciesId, speciesId]
      )

      // 將結果轉換為帶有 id 的格式
      const breeds = results.map((breed, index) => ({
        id: index + 1,
        name: breed.name,
      }))

      responseData.breeds = breeds
    }

    // 獲取所有不重複的品種（variety）
    if (type === 'varieties') {
      let query = ''
      let params = []

      if (speciesId === '1') {
        // 狗的品種
        query = `
          SELECT DISTINCT variety
          FROM pets
          WHERE species = '狗'
          ORDER BY variety
        `
      } else if (speciesId === '2') {
        // 貓的品種
        query = `
          SELECT DISTINCT variety
          FROM pets
          WHERE species = '貓'
          ORDER BY variety
        `
      } else {
        // 所有品種
        query = `
          SELECT DISTINCT variety
          FROM pets
          ORDER BY variety
        `
      }

      console.log('品種查詢SQL:', query)
      console.log('品種查詢參數:', params)

      const [results] = await connection.execute(query, params)
      console.log('品種查詢結果:', results)

      responseData.varieties = results.map((item) => item.variety)
    }

    // 獲取寵物資料
    if (type === 'all' || type === 'pets') {
      // 獲取所有寵物資料
      const [pets] = await connection.execute(`
        SELECT 
          p.*,
          CASE 
            WHEN p.variety LIKE '%貓%' THEN '貓'
            WHEN p.variety LIKE '%犬%' OR p.variety LIKE '%狗%' THEN '狗'
            ELSE '其他'
          END as species_name,
          p.variety as breed_name
        FROM pets p
      `)

      // 獲取店家資訊，用於地點顯示
      const [stores] = await connection.execute(`
        SELECT id, address FROM pet_store
      `)

      // 建立店家 ID 到地址的映射
      const storeMap = {}
      stores.forEach((store) => {
        storeMap[store.id] = {
          address: store.address,
        }
      })

      // 處理年齡和位置顯示
      const processedPets = pets.map((pet) => {
        // 處理年齡顯示
        const birthDate = pet.birthday ? new Date(pet.birthday) : null
        let ageDisplay = pet.age ? `${pet.age}歲` : '未知'

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

          // 根據年齡決定顯示方式
          ageDisplay = years > 0 ? `${years}歲` : `${months}個月`
        }

        // 處理位置顯示 - 根據 store_id 獲取地點
        let locationDisplay = '未知位置'
        if (pet.store_id && storeMap[pet.store_id]) {
          const store = storeMap[pet.store_id]
          if (store.address) {
            // 從地址中提取城市名稱（假設前三個字是城市名）
            locationDisplay = store.address.substring(0, 3)
          }
        }

        return {
          ...pet,
          age: ageDisplay,
          location: locationDisplay,
        }
      })

      responseData.pets = processedPets
    }

    connection.release()

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

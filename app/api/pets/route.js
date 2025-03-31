import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

// 實現簡單的內存緩存
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5分鐘緩存

// 計算寵物年齡顯示
const calculateAgeDisplay = (birthDate) => {
  if (!birthDate) return '未知'

  const today = new Date()
  const birthDateTime = new Date(birthDate)
  let years = today.getFullYear() - birthDateTime.getFullYear()
  let months = today.getMonth() - birthDateTime.getMonth()

  if (today.getDate() < birthDateTime.getDate()) {
    months--
  }

  if (months < 0) {
    years--
    months += 12
  }

  return years > 0 ? `${years}歲` : `${months}個月`
}

// 處理寵物資料，添加年齡和位置顯示
const processPetData = (pet) => {
  const ageDisplay = calculateAgeDisplay(pet.birthday)

  let locationDisplay = '未知位置'
  if (pet.store_address) {
    locationDisplay = pet.store_address.substring(0, 3)
  }

  // 使用預設圖片路徑，前端會優先查詢 pet_photos 表中的圖片
  const defaultImage = '/images/default_no_pet.jpg'

  return {
    ...pet,
    age: ageDisplay,
    location: locationDisplay,
    image_url: defaultImage, // 提供預設圖片路徑，讓前端可以使用
  }
}

export async function GET(request) {
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const speciesId = searchParams.get('species_id')
    const region = searchParams.get('region')
    const storeId = searchParams.get('storeId') || searchParams.get('store')
    const breed = searchParams.get('breed')
    const userId = searchParams.get('userId')

    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    // 緩存檢查 (只用於不常變化的數據)
    const cacheable = ['meta', 'species', 'varieties', 'stores']
    const cacheKey = request.url

    if (cacheable.includes(type)) {
      const cachedData = cache.get(cacheKey)
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return NextResponse.json(cachedData.data)
      }
    }

    connection = await pool.getConnection()
    const responseData = {}

    // 擴展版: 合併基礎資料獲取 (物種、品種、商店、最新寵物)
    if (type === 'meta') {
      // 獲取物種資料
      const [speciesResults] = await connection.execute(`
        SELECT DISTINCT
          species as name,
          CASE 
            WHEN species = '狗' THEN 1
            WHEN species = '貓' THEN 2
            ELSE 3
          END as id
        FROM pets
        WHERE species IS NOT NULL
        ORDER BY id
      `)

      // 獲取所有品種資料
      const [varietiesResults] = await connection.execute(`
        SELECT DISTINCT variety
        FROM pets
        ORDER BY variety
      `)

      // 獲取商店資料
      const [storesResults] = await connection.execute(`
        SELECT 
          id, 
          name, 
          address, 
          phone, 
          mail, 
          open_hours, 
          lat, 
          lng,
          SUBSTRING(address, 1, 3) as region
        FROM pet_store
        ORDER BY region, id
      `)

      const storesByRegion = storesResults.reduce((acc, store) => {
        const region = store.region || '其他'
        if (!acc[region]) {
          acc[region] = []
        }
        acc[region].push(store)
        return acc
      }, {})

      const uniqueSpecies = Array.from(
        new Set(speciesResults.map((r) => JSON.stringify(r)))
      ).map((s) => JSON.parse(s))

      // 獲取最新寵物（限制數量）
      const [latestPets] = await connection.execute(`
        SELECT 
          p.id, p.name, p.species, p.variety, p.gender, 
          p.store_id, p.birthday, ps.address as store_address
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        WHERE p.is_adopted = 0
        ORDER BY p.created_at DESC
        LIMIT 10
      `)

      // 獲取熱門寵物 (收藏數量最多的)
      const [popularPets] = await connection.execute(`
        SELECT p.id, p.name, p.species, p.variety, p.gender,
              p.store_id, p.birthday, ps.address as store_address,
              COUNT(pl.pet_id) as like_count
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        LEFT JOIN pets_like pl ON p.id = pl.pet_id
        WHERE p.is_adopted = 0
        GROUP BY p.id
        ORDER BY like_count DESC, p.created_at DESC
        LIMIT 10
      `)

      responseData.species = uniqueSpecies
      responseData.varieties = varietiesResults.map((item) => item.variety)
      responseData.stores = storesResults
      responseData.storesByRegion = storesByRegion
      responseData.latestPets = latestPets.map(processPetData)
      responseData.popularPets = popularPets.map(processPetData)

      // 儲存到緩存
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      })

      return NextResponse.json(responseData)
    }

    // 獲取物種資料 - 直接使用 species 欄位
    if (type === 'all' || type === 'species') {
      const [results] = await connection.execute(`
        SELECT DISTINCT
          species as name,
          CASE 
            WHEN species = '狗' THEN 1
            WHEN species = '貓' THEN 2
            ELSE 3
          END as id
        FROM pets
        WHERE species IS NOT NULL
        ORDER BY id
      `)

      const uniqueSpecies = Array.from(
        new Set(results.map((r) => JSON.stringify(r)))
      ).map((s) => JSON.parse(s))

      responseData.species = uniqueSpecies

      // 儲存到緩存
      if (type === 'species') {
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
        })
      }
    }

    // 獲取品種資料 - 根據 species 篩選
    if ((type === 'all' || type === 'breeds') && speciesId) {
      const [results] = await connection.execute(
        `
        SELECT DISTINCT
          variety as name
        FROM pets
        WHERE 
          CASE 
            WHEN ? = '1' THEN species = '狗'
            WHEN ? = '2' THEN species = '貓'
            ELSE species != '狗' AND species != '貓'
          END
        ORDER BY variety
      `,
        [speciesId, speciesId]
      )
      const breeds = results.map((breed, index) => ({
        id: index + 1,
        name: breed.name,
      }))
      responseData.breeds = breeds

      // 儲存到緩存
      if (type === 'breeds') {
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
        })
      }
    }

    // 獲取所有不重複的品種（variety）- 使用 species 欄位篩選
    if (type === 'varieties') {
      let query = ''
      let params = []
      if (speciesId === '1') {
        query = `
          SELECT DISTINCT variety
          FROM pets
          WHERE species = '狗'
          ORDER BY variety
        `
      } else if (speciesId === '2') {
        query = `
          SELECT DISTINCT variety
          FROM pets
          WHERE species = '貓'
          ORDER BY variety
        `
      } else {
        query = `
          SELECT DISTINCT variety
          FROM pets
          ORDER BY variety
        `
      }
      const [results] = await connection.execute(query, params)
      responseData.varieties = results.map((item) => item.variety)

      // 儲存到緩存
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      })
    }

    // 在 stores 查詢部分增加地區分組
    if (type === 'stores') {
      const [results] = await connection.execute(`
        SELECT 
          id, 
          name, 
          address, 
          phone, 
          mail, 
          open_hours, 
          lat, 
          lng,
          SUBSTRING(address, 1, 3) as region
        FROM pet_store
        ORDER BY region, id
      `)
      const storesByRegion = results.reduce((acc, store) => {
        const region = store.region || '其他'
        if (!acc[region]) {
          acc[region] = []
        }
        acc[region].push(store)
        return acc
      }, {})

      responseData.stores = results
      responseData.storesByRegion = storesByRegion

      // 儲存到緩存
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      })
    }

    // 獲取寵物資料
    if (type === 'pets') {
      // 構建查詢條件
      const conditions = []
      const queryParams = []

      // 篩選條件: 物種
      if (speciesId) {
        conditions.push(
          `CASE 
            WHEN ? = '1' THEN species = '狗'
            WHEN ? = '2' THEN species = '貓'
            ELSE species != '狗' AND species != '貓'
          END`
        )
        queryParams.push(speciesId, speciesId)
      }

      // 篩選條件: 品種
      if (breed) {
        conditions.push('variety LIKE ?')
        queryParams.push(`%${breed}%`)
      }

      // 篩選條件: 地區
      if (region) {
        conditions.push('SUBSTRING(ps.address, 1, 3) = ?')
        queryParams.push(region)
      }

      // 篩選條件: 商店
      if (storeId) {
        conditions.push('p.store_id = ?')
        queryParams.push(storeId)
      }

      // 排除已領養的寵物
      const excludeAdopted = searchParams.get('excludeAdopted') === 'true'
      if (excludeAdopted) {
        conditions.push('p.is_adopted = 0')
      }

      // 組合查詢條件
      const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

      // 查詢總數
      const [countResult] = await connection.execute(
        `
        SELECT COUNT(*) as total
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        ${whereClause}
      `,
        queryParams
      )
      const total = countResult[0].total

      // 查詢寵物列表
      const [pets] = await connection.execute(
        `
        SELECT 
          p.id, p.name, p.species, p.variety, p.gender, 
          p.birthday, p.is_adopted,
          p.store_id, ps.name as store_name, ps.address as store_address,
          ps.lat as store_lat, ps.lng as store_lng, ps.phone as store_phone,
          SUBSTRING(ps.address, 1, 3) as region
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `,
        queryParams
      )

      // 如果提供了 userId，獲取該用戶的收藏信息
      let userFavorites = {}
      if (userId) {
        const [favorites] = await connection.execute(
          'SELECT pet_id FROM pets_like WHERE user_id = ?',
          [userId]
        )

        userFavorites = favorites.reduce((acc, fav) => {
          acc[fav.pet_id] = true
          return acc
        }, {})
      }

      // 處理寵物數據並添加收藏狀態
      const processedPets = pets.map((pet) => ({
        ...processPetData(pet),
        isFavorite: userFavorites[pet.id] || false,
      }))

      responseData.pets = processedPets
      responseData.pagination = {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }

    // 獲取收藏列表
    if (type === 'favorites') {
      if (!userId) {
        return NextResponse.json({ error: '需要用戶ID' }, { status: 400 })
      }
      const [favorites] = await connection.execute(
        'SELECT pet_id FROM pets_like WHERE user_id = ?',
        [userId]
      )
      return NextResponse.json({ favorites })
    }

    // 獲取最新上架寵物 - 使用分頁
    if (type === 'latest') {
      const limit = parseInt(searchParams.get('limit') || '5')

      const [latestPets] = await connection.execute(
        `
        SELECT 
          p.id, p.name, p.species, p.variety, p.gender, 
          p.birthday, p.store_id, p.is_adopted,
          ps.name as store_name,
          ps.address as store_address,
          COUNT(pl.pet_id) as like_count
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        LEFT JOIN pets_like pl ON p.id = pl.pet_id
        WHERE p.is_adopted = 0
        GROUP BY p.id 
        ORDER BY p.created_at DESC
        LIMIT ${limit}
        `
      )

      // 處理寵物數據
      const processedPets = latestPets.map(processPetData)

      // 如果有用戶ID，獲取收藏狀態
      if (userId) {
        // 獲取用戶收藏信息
        const [favorites] = await connection.execute(
          'SELECT pet_id FROM pets_like WHERE user_id = ?',
          [userId]
        )

        const favoriteIds = favorites.map((f) => f.pet_id)

        // 在寵物列表中標記收藏狀態
        processedPets.forEach((pet) => {
          pet.isFavorite = favoriteIds.includes(pet.id)
        })
      }

      responseData.pets = processedPets
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function POST(request) {
  let connection
  try {
    const body = await request.json()
    const { userId, petId, action } = body

    // 驗證必要參數
    if (!userId || !petId || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '無效的請求參數' },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()

    // 如果是添加收藏
    if (action === 'add') {
      try {
        // 檢查該收藏是否已存在
        const [existingLike] = await connection.execute(
          'SELECT * FROM pets_like WHERE user_id = ? AND pet_id = ?',
          [userId, petId]
        )

        // 如果已經存在，返回成功
        if (existingLike && existingLike.length > 0) {
          return NextResponse.json({
            success: true,
            message: '已經收藏過此寵物',
          })
        }

        // 檢查寵物是否存在
        const [petResult] = await connection.execute(
          'SELECT id, is_adopted FROM pets WHERE id = ?',
          [petId]
        )

        // 如果寵物不存在
        if (!petResult || petResult.length === 0) {
          return NextResponse.json(
            { success: false, message: '寵物不存在或ID無效' },
            { status: 404 }
          )
        }

        // 如果寵物已被領養
        if (petResult[0].is_adopted === 1) {
          return NextResponse.json(
            { success: false, message: '此寵物已被領養，無法收藏' },
            { status: 400 }
          )
        }

        // 插入新的收藏記錄
        await connection.execute(
          'INSERT INTO pets_like (user_id, pet_id) VALUES (?, ?)',
          [userId, petId]
        )

        return NextResponse.json({ success: true, message: '成功添加收藏' })
      } catch (error) {
        console.error('收藏寵物時發生錯誤:', error)
        return NextResponse.json(
          {
            success: false,
            message: '處理收藏時發生錯誤',
            error: error.message,
          },
          { status: 500 }
        )
      }
    }

    // 如果是移除收藏
    if (action === 'remove') {
      // 刪除收藏記錄
      await connection.execute(
        'DELETE FROM pets_like WHERE user_id = ? AND pet_id = ?',
        [userId, petId]
      )

      return NextResponse.json({ success: true, message: '成功移除收藏' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('處理寵物收藏時發生錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

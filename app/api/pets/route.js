import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

export async function GET(request) {
  let connection
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const speciesId = searchParams.get('species_id')
    const species = searchParams.get('species')
    const region = searchParams.get('region')
    const storeId = searchParams.get('storeId') || searchParams.get('store')
    const breed = searchParams.get('breed')

    connection = await pool.getConnection()
    const responseData = {}

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
    }

    // 獲取寵物資料 - 使用 species 欄位篩選
    if (type === 'all' || type === 'pets') {
      let conditions = []
      let params = []
      let query = `
        SELECT 
          p.*,
          p.species as species_name,
          p.variety as breed_name,
          ps.name as store_name,
          ps.address as store_address,
          COUNT(pl.pet_id) as like_count
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        LEFT JOIN pets_like pl ON p.id = pl.pet_id
      `

      // 物種篩選 - 直接使用 species 欄位
      if (species) {
        conditions.push(`
          CASE 
            WHEN ? = 'dog' THEN p.species = '狗'
            WHEN ? = 'cat' THEN p.species = '貓'
            ELSE p.species != '狗' AND p.species != '貓'
          END
        `)
        params.push(species, species)
      } else if (speciesId) {
        conditions.push(`
          CASE 
            WHEN ? = '1' THEN p.species = '狗'
            WHEN ? = '2' THEN p.species = '貓'
            ELSE p.species != '狗' AND p.species != '貓'
          END
        `)
        params.push(speciesId, speciesId)
      }

      // 品種篩選
      if (breed) {
        conditions.push('p.variety = ?')
        params.push(breed)
      }

      // 地區篩選
      if (region) {
        conditions.push('ps.address LIKE ?') 
        params.push(`${region}%`)
      }

      // 商店篩選
      if (storeId) {
        conditions.push('p.store_id = ?')
        params.push(storeId)
      }

      // WHERE 子句和分組
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
      query += ` GROUP BY p.id ORDER BY p.created_at DESC`

      const [pets] = await connection.execute(query, params)

      const processedPets = pets.map((pet) => {
        const birthDate = pet.birthday ? new Date(pet.birthday) : null
        let ageDisplay = '未知'

        if (birthDate) {
          const today = new Date()
          let years = today.getFullYear() - birthDate.getFullYear()
          let months = today.getMonth() - birthDate.getMonth()

          if (today.getDate() < birthDate.getDate()) {
            months--
          }

          if (months < 0) {
            years--
            months += 12
          }

          ageDisplay = years > 0 ? `${years}歲` : `${months}個月`
        }

        let locationDisplay = '未知位置'
        if (pet.store_address) {
          locationDisplay = pet.store_address.substring(0, 3)
        }

        return {
          ...pet,
          age: ageDisplay,
          location: locationDisplay,
        }
      })

      responseData.pets = processedPets
    }

    // 獲取收藏列表
    if (type === 'favorites') {
      const userId = searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ error: '需要用戶ID' }, { status: 400 })
      }
      const [favorites] = await connection.execute(
        'SELECT pet_id FROM pets_like WHERE user_id = ?',
        [userId]
      )
      return NextResponse.json({ favorites })
    }

    // 獲取最新上架寵物 - 也更新為使用 species 欄位
    if (type === 'latest') {
      const [latestPets] = await connection.execute(`
        SELECT 
          p.*,
          p.species as species_name,
          p.variety as breed_name,
          ps.name as store_name,
          ps.address as store_address,
          COUNT(pl.pet_id) as like_count
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        LEFT JOIN pets_like pl ON p.id = pl.pet_id
        GROUP BY p.id 
        ORDER BY p.created_at DESC
        LIMIT 5
      `)

      // 處理年齡和位置顯示
      const processedPets = latestPets.map((pet) => {
        const birthDate = pet.birthday ? new Date(pet.birthday) : null
        let ageDisplay = '未知'

        if (birthDate) {
          const today = new Date()
          let years = today.getFullYear() - birthDate.getFullYear()
          let months = today.getMonth() - birthDate.getMonth()

          if (today.getDate() < birthDate.getDate()) {
            months--
          }

          if (months < 0) {
            years--
            months += 12
          }

          ageDisplay = years > 0 ? `${years}歲` : `${months}個月`
        }

        let locationDisplay = '未知位置'
        if (pet.store_address) {
          locationDisplay = pet.store_address.substring(0, 3)
        }

        return {
          ...pet,
          age: ageDisplay,
          location: locationDisplay,
        }
      })

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

    if (!userId || !petId || !action) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    connection = await pool.getConnection()

    if (action === 'add') {
      await connection.execute(
        'INSERT INTO pets_like (user_id, pet_id) VALUES (?, ?)',
        [userId, petId]
      )
    } else if (action === 'remove') {
      await connection.execute(
        'DELETE FROM pets_like WHERE user_id = ? AND pet_id = ?',
        [userId, petId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: '資料庫錯誤' }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

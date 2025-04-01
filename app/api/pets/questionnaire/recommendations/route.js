import { NextResponse } from 'next/server'
import { database } from '../../../_lib/db'

// 獲取寵物推薦
export async function GET(request) {
  try {
    // 從查詢參數獲取問卷 ID
    const { searchParams } = new URL(request.url)
    const questionnaireId = searchParams.get('id')

    if (!questionnaireId || isNaN(Number(questionnaireId))) {
      return NextResponse.json({ message: '無效的問卷 ID' }, { status: 400 })
    }

    // 獲取問卷數據
    const questionnaireSql = `
      SELECT 
        id, 
        user_id, 
        living_environment, 
        activity_level, 
        experience_level, 
        time_available, 
        preferred_size, 
        preferred_age, 
        preferred_traits, 
        allergies, 
        has_children, 
        has_other_pets
      FROM user_questionnaire
      WHERE id = ?
      LIMIT 1
    `

    const [questionnaireResults, questionnaireError] =
      await database.executeSecureQuery(questionnaireSql, [questionnaireId])

    if (questionnaireError) {
      console.error('獲取問卷數據時出錯:', questionnaireError)
      return NextResponse.json(
        { message: '獲取問卷數據時出錯' },
        { status: 500 }
      )
    }

    if (!questionnaireResults || questionnaireResults.length === 0) {
      return NextResponse.json({ message: '未找到該問卷' }, { status: 404 })
    }

    const questionnaire = questionnaireResults[0]
    const preferredTraits = JSON.parse(questionnaire.preferred_traits || '[]')

    // 建立推薦條件
    const conditions = []
    const params = []

    // 處理寵物體型偏好
    if (
      questionnaire.preferred_size &&
      questionnaire.preferred_size !== 'any'
    ) {
      const sizeMap = {
        small: 'weight <= 10',
        medium: 'weight > 10 AND weight <= 25',
        large: 'weight > 25',
      }
      if (sizeMap[questionnaire.preferred_size]) {
        conditions.push(`(${sizeMap[questionnaire.preferred_size]})`)
      }
    }

    // 處理寵物年齡偏好
    if (questionnaire.preferred_age && questionnaire.preferred_age !== 'any') {
      const yearInMilliseconds = 365 * 24 * 60 * 60 * 1000
      const now = new Date()
      let ageCondition = ''

      if (questionnaire.preferred_age === 'young') {
        // 2歲以下
        const twoYearsAgo = new Date(now.getTime() - 2 * yearInMilliseconds)
        ageCondition = 'birthday >= ?'
        params.push(twoYearsAgo.toISOString().split('T')[0])
      } else if (questionnaire.preferred_age === 'adult') {
        // 2-8歲
        const twoYearsAgo = new Date(now.getTime() - 2 * yearInMilliseconds)
        const eightYearsAgo = new Date(now.getTime() - 8 * yearInMilliseconds)
        ageCondition = 'birthday BETWEEN ? AND ?'
        params.push(eightYearsAgo.toISOString().split('T')[0])
        params.push(twoYearsAgo.toISOString().split('T')[0])
      } else if (questionnaire.preferred_age === 'senior') {
        // 8歲以上
        const eightYearsAgo = new Date(now.getTime() - 8 * yearInMilliseconds)
        ageCondition = 'birthday <= ?'
        params.push(eightYearsAgo.toISOString().split('T')[0])
      }

      if (ageCondition) {
        conditions.push(`(${ageCondition})`)
      }
    }

    // 處理過敏情況
    if (questionnaire.allergies) {
      conditions.push(`(p.species = 'cat' AND pt.trait_id IN (29))`) // 假設特徵ID 29是'毛髮稀疏'
    }

    // 對於有小孩的家庭，優先溫和的寵物
    if (questionnaire.has_children) {
      conditions.push(`(pt.trait_id IN (2, 9, 12, 16))`) // 溫和、親和力強、忠心、適應力強
    }

    // 寵物狀態 - 只考慮未領養的寵物
    conditions.push('p.is_adopted = 0')

    // 構建 SQL 查詢獲取潛在的匹配寵物
    let petSql = `
      SELECT DISTINCT 
        p.id, 
        p.name, 
        p.gender, 
        p.species, 
        p.variety, 
        p.birthday, 
        TIMESTAMPDIFF(YEAR, p.birthday, CURDATE()) as age,
        p.weight, 
        p.fixed,
        p.story, 
        p.store_id,
        ps.name as store_name,
        MAX(pp.photo_url) as main_photo
      FROM pets p
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      LEFT JOIN pet_trait pt ON p.id = pt.pet_id
      LEFT JOIN pet_photos pp ON p.id = pp.pet_id AND pp.is_main = 1
    `

    if (conditions.length > 0) {
      petSql += ` WHERE ${conditions.join(' AND ')}`
    }

    petSql += ' GROUP BY p.id ORDER BY p.id ASC'

    const [petsResults, petsError] = await database.executeSecureQuery(
      petSql,
      params
    )

    if (petsError) {
      console.error('獲取寵物數據時出錯:', petsError)
      return NextResponse.json(
        { message: '獲取寵物數據時出錯' },
        { status: 500 }
      )
    }

    // 如果沒有匹配的寵物，獲取所有可領養的寵物作為備選
    if (petsResults.length === 0) {
      const fallbackSql = `
        SELECT DISTINCT 
          p.id, 
          p.name, 
          p.gender, 
          p.species, 
          p.variety, 
          p.birthday, 
          TIMESTAMPDIFF(YEAR, p.birthday, CURDATE()) as age,
          p.weight, 
          p.fixed,
          p.story, 
          p.store_id,
          ps.name as store_name,
          MAX(pp.photo_url) as main_photo
        FROM pets p
        LEFT JOIN pet_store ps ON p.store_id = ps.id
        LEFT JOIN pet_photos pp ON p.id = pp.pet_id AND pp.is_main = 1
        WHERE p.is_adopted = 0
        GROUP BY p.id
        ORDER BY p.id ASC
        LIMIT 10
      `

      const [fallbackResults, fallbackError] =
        await database.executeSecureQuery(fallbackSql)

      if (fallbackError) {
        console.error('獲取備選寵物數據時出錯:', fallbackError)
        return NextResponse.json(
          { message: '獲取備選寵物數據時出錯' },
          { status: 500 }
        )
      }

      // 簡單計算匹配分數
      const recommendations = await calculateMatchScores(
        fallbackResults,
        preferredTraits,
        questionnaire
      )

      return NextResponse.json({
        message: '沒有完全符合條件的寵物，以下是可能的建議',
        recommendations: recommendations,
      })
    }

    // 計算匹配分數
    const recommendations = await calculateMatchScores(
      petsResults,
      preferredTraits,
      questionnaire
    )

    // 保存推薦結果到資料庫
    await saveRecommendations(recommendations, questionnaire.user_id)

    return NextResponse.json({
      message: '成功獲取推薦結果',
      recommendations: recommendations,
    })
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}

// 計算匹配分數
async function calculateMatchScores(pets, preferredTraits, questionnaire) {
  if (!pets || pets.length === 0) {
    return []
  }

  // 獲取所有寵物的特徵
  const petIds = pets.map((pet) => pet.id)
  const petTraitsSql = `
    SELECT pt.pet_id, pt.trait_id, ptl.trait_tag, ptl.description
    FROM pet_trait pt
    JOIN pet_trait_list ptl ON pt.trait_id = ptl.id
    WHERE pt.pet_id IN (${petIds.map(() => '?').join(',')})
  `

  const [petTraitsResults, petTraitsError] = await database.executeSecureQuery(
    petTraitsSql,
    petIds
  )

  if (petTraitsError) {
    console.error('獲取寵物特徵時出錯:', petTraitsError)
    return pets.map((pet) => ({ ...pet, match_score: 0.5, traits: [] }))
  }

  // 組織寵物特徵數據
  const petTraitsMap = {}
  petTraitsResults.forEach((trait) => {
    if (!petTraitsMap[trait.pet_id]) {
      petTraitsMap[trait.pet_id] = []
    }
    petTraitsMap[trait.pet_id].push({
      trait_id: trait.trait_id,
      trait_tag: trait.trait_tag,
      description: trait.description,
    })
  })

  // 計算匹配分數
  const scoredPets = pets.map((pet) => {
    const petTraits = petTraitsMap[pet.id] || []
    let matchScore = 0.5 // 基礎分數
    let scoreFactors = []

    // 特徵匹配分數 (最高 0.4)
    const petTraitIds = petTraits.map((trait) => trait.trait_id)
    const matchingTraits = preferredTraits.filter((traitId) =>
      petTraitIds.includes(Number(traitId))
    )

    if (preferredTraits.length > 0) {
      const traitMatchScore =
        (matchingTraits.length / preferredTraits.length) * 0.4
      matchScore += traitMatchScore
      scoreFactors.push({ factor: 'traits', score: traitMatchScore })
    }

    // 活動程度匹配 (最高 0.2)
    let activityScore = 0
    if (
      questionnaire.activity_level === 'low' &&
      petTraitIds.some((id) => [14, 23].includes(id))
    ) {
      // 宅在家, 瞌睡蟲
      activityScore = 0.2
    } else if (
      questionnaire.activity_level === 'medium' &&
      petTraitIds.some((id) => [16, 9].includes(id))
    ) {
      // 適應力強, 親和力強
      activityScore = 0.2
    } else if (
      questionnaire.activity_level === 'high' &&
      petTraitIds.some((id) => [1, 13, 24].includes(id))
    ) {
      // 活蹦亂跳, 戶外派, 散步狂
      activityScore = 0.2
    }
    matchScore += activityScore
    scoreFactors.push({ factor: 'activity', score: activityScore })

    // 經驗程度匹配 (最高 0.2)
    let experienceScore = 0
    if (
      questionnaire.experience_level === 'none' &&
      petTraitIds.some((id) => [2, 16, 9].includes(id))
    ) {
      // 溫柔似水, 適應力強, 親和力強
      experienceScore = 0.2
    } else if (
      questionnaire.experience_level === 'some' &&
      !petTraitIds.some((id) => [8, 5].includes(id))
    ) {
      // 不固執, 不膽小
      experienceScore = 0.15
    } else if (questionnaire.experience_level === 'experienced') {
      experienceScore = 0.2 // 有經驗的飼主可以處理各種性格的寵物
    }
    matchScore += experienceScore
    scoreFactors.push({ factor: 'experience', score: experienceScore })

    // 時間可用性匹配 (最高 0.2)
    let timeScore = 0
    if (
      questionnaire.time_available === 'little' &&
      petTraitIds.some((id) => [14, 23, 19].includes(id))
    ) {
      // 宅在家, 瞌睡蟲, 愛乾淨
      timeScore = 0.2
    } else if (
      questionnaire.time_available === 'moderate' &&
      petTraitIds.some((id) => [16, 9].includes(id))
    ) {
      // 適應力強, 親和力強
      timeScore = 0.15
    } else if (questionnaire.time_available === 'plenty') {
      timeScore = 0.2 // 時間充足可以照顧各種寵物
    }
    matchScore += timeScore
    scoreFactors.push({ factor: 'time', score: timeScore })

    // 修正超過1的分數
    matchScore = Math.min(matchScore, 1)

    return {
      ...pet,
      match_score: parseFloat(matchScore.toFixed(2)),
      score_factors: scoreFactors,
      traits: petTraits,
    }
  })

  // 按匹配分數排序
  return scoredPets.sort((a, b) => b.match_score - a.match_score)
}

// 保存推薦結果到資料庫
async function saveRecommendations(recommendations, userId) {
  if (!userId || !recommendations || recommendations.length === 0) {
    return
  }

  try {
    // 首先清除該用戶的舊推薦
    const clearSql = `DELETE FROM pet_recommendation WHERE user_id = ?`
    await database.executeSecureQuery(clearSql, [userId])

    // 插入新的推薦結果
    const insertSql = `
      INSERT INTO pet_recommendation (
        user_id, 
        pet_id, 
        match_score
      ) VALUES 
      ${recommendations.map(() => '(?, ?, ?)').join(',')}
    `

    const params = []
    recommendations.forEach((pet) => {
      params.push(userId, pet.id, pet.match_score)
    })

    await database.executeSecureQuery(insertSql, params)
  } catch (error) {
    console.error('保存推薦結果時出錯:', error)
    // 這裡我們只記錄錯誤，但不中斷流程
  }
}

import db from '@/app/lib/db'

// api路由(Route Handler)- 獲取多筆資料
export async function GET(request) {
  try {
    const query = `
      SELECT 
        cases.id, 
        cases.title, 
        cases.content, 
        COALESCE(GROUP_CONCAT(DISTINCT case_images.image_url ORDER BY case_images.image_url ASC), '') AS images 
      FROM cases
      LEFT JOIN case_images ON cases.id = case_images.case_id
      GROUP BY cases.id, cases.title, cases.content
    `

    // 記錄 SQL 查詢
    console.log('Running query:', query)

    const [cases] = await db.query(query)

    // 檢查資料是否正確返回
    if (!cases) {
      throw new Error('No cases found.')
    }

    // 把 images 轉換成陣列
    const formattedCases = cases.map((c) => ({
      ...c,
      images: c.images ? c.images.split(',') : [], // 確保 images 是陣列
    }))

    return Response.json({ status: 'success', data: { cases: formattedCases } })
  } catch (error) {
    console.error('Error fetching cases:', error)

    // 如果是 SQL 執行錯誤，會打印錯誤訊息
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
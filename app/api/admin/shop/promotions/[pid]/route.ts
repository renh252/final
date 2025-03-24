import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取單個折扣活動詳情
export const GET = guard.api(
  guard.perm('shop:promotions:read')(
    async (req: NextRequest, { params }: { params?: { pid?: string } }) => {
      try {
        // 從URL解析pid
        let pid: string | null = null

        // 嘗試從params獲取pid
        if (params && params.pid) {
          pid = params.pid
        }
        // 如果params不可用，嘗試從URL解析
        else {
          const urlParts = req.url.split('/')
          pid = urlParts[urlParts.length - 1].split('?')[0] // 移除查詢參數
          // 檢查是否為數字
          if (!/^\d+$/.test(pid)) {
            pid = null
          }
        }

        console.log('獲取折扣活動 - 參數檢查:', {
          params: params,
          url: req.url,
          pid: pid,
        })

        if (!pid) {
          return NextResponse.json(
            { success: false, message: '缺少折扣活動ID' },
            { status: 400 }
          )
        }

        // 查詢折扣活動詳情
        const [promotions] = await db.query(
          `
        SELECT 
          promotion_id,
          promotion_name,
          promotion_description,
          start_date,
          end_date,
          discount_percentage,
          CASE 
            WHEN start_date > CURRENT_DATE() THEN 'inactive'
            WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE() THEN 'expired'
            ELSE 'active'
          END as status,
          updated_at,
          photo
        FROM 
          promotions
        WHERE 
          promotion_id = ?
      `,
          [pid]
        )

        if (!Array.isArray(promotions) || promotions.length === 0) {
          return NextResponse.json(
            { success: false, message: '找不到該折扣活動' },
            { status: 404 }
          )
        }

        // 查詢關聯的商品和類別
        const [relatedProducts] = await db.query(
          `
        SELECT 
          pp.promotion_product_id,
          pp.product_id,
          pp.variant_id,
          pp.category_id
        FROM 
          promotion_products pp
        WHERE 
          pp.promotion_id = ?
      `,
          [pid]
        )

        return NextResponse.json({
          success: true,
          promotion: promotions[0],
          related_products: Array.isArray(relatedProducts)
            ? relatedProducts
            : [],
        })
      } catch (error) {
        console.error('獲取折扣活動詳情失敗:', error)
        return NextResponse.json(
          { success: false, message: '獲取折扣活動詳情失敗' },
          { status: 500 }
        )
      }
    }
  )
)

// 更新折扣活動
export const PUT = guard.api(
  guard.perm('shop:promotions:write')(
    async (req: NextRequest, { params }: { params?: { pid?: string } }) => {
      try {
        // 修改：直接從URL獲取pid，確保都能取到值
        let pid: string | null = null

        // 嘗試從params獲取pid
        if (params && params.pid) {
          pid = params.pid
        }
        // 如果params不可用，嘗試從URL解析
        else {
          const urlParts = req.url.split('/')
          pid = urlParts[urlParts.length - 1]
          // 檢查是否為數字
          if (!/^\d+$/.test(pid)) {
            pid = null
          }
        }

        console.log('更新折扣活動 - 參數檢查:', {
          params: params,
          url: req.url,
          pid: pid,
        })

        // 確保pid存在
        if (!pid) {
          return NextResponse.json(
            { success: false, message: '缺少折扣活動ID' },
            { status: 400 }
          )
        }

        const data = await req.json()

        // 詳細記錄請求
        console.log('收到更新促銷活動請求:', {
          promotionId: pid,
          requestData: data,
        })

        const {
          promotion_name,
          promotion_description,
          discount_percentage,
          start_date,
          end_date,
          photo,
        } = data

        // 確保必填欄位
        if (!promotion_name) {
          return NextResponse.json(
            { success: false, message: '促銷活動名稱不能為空' },
            { status: 400 }
          )
        }

        try {
          // 檢查折扣活動是否存在
          const [existing] = await db.query<any[]>(
            'SELECT promotion_id FROM promotions WHERE promotion_id = ?',
            [pid]
          )

          if (!existing || existing.length === 0) {
            return NextResponse.json(
              { success: false, message: '找不到指定的折扣活動' },
              { status: 404 }
            )
          }

          // 處理日期格式
          let formattedStartDate = null
          let formattedEndDate = null

          try {
            formattedStartDate = start_date ? formatDate(start_date) : null
            console.log('處理的開始日期:', {
              原始: start_date,
              格式化後: formattedStartDate,
            })

            formattedEndDate = end_date ? formatDate(end_date) : null
            console.log('處理的結束日期:', {
              原始: end_date,
              格式化後: formattedEndDate,
            })
          } catch (dateError) {
            console.error('日期格式化錯誤:', dateError)
            return NextResponse.json(
              {
                success: false,
                message: '日期格式無效，請使用YYYY-MM-DD格式',
                error: String(dateError),
              },
              { status: 400 }
            )
          }

          console.log('準備執行SQL更新，參數:', {
            promotion_name,
            promotion_description: promotion_description || '',
            discount_percentage: discount_percentage || 0,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            photo: photo || null,
            pid,
          })

          // 更新折扣活動 - 使用預處理語句並詳細記錄
          const updateResult = await db.exec(
            `
        UPDATE promotions SET
          promotion_name = ?,
          promotion_description = ?,
          discount_percentage = ?,
          start_date = ?,
          end_date = ?,
          photo = ?,
          updated_at = NOW()
        WHERE promotion_id = ?
      `,
            [
              promotion_name,
              promotion_description || '',
              discount_percentage || 0,
              formattedStartDate,
              formattedEndDate,
              photo || null,
              pid,
            ]
          )

          console.log('更新結果:', updateResult)

          if (updateResult[0] === false) {
            throw new Error(`SQL更新失敗: ${updateResult[1]}`)
          }

          // 獲取更新後的折扣活動
          const [updatedPromotion] = await db.query<any[]>(
            `SELECT 
          promotion_id,
          promotion_name,
          promotion_description,
          start_date,
          end_date,
          discount_percentage,
          CASE 
            WHEN start_date > CURRENT_DATE() THEN 'inactive'
            WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE() THEN 'expired'
            ELSE 'active'
          END as status,
          updated_at,
          photo
        FROM promotions WHERE promotion_id = ?`,
            [pid]
          )

          if (!updatedPromotion || updatedPromotion.length === 0) {
            throw new Error('更新後無法找到促銷活動')
          }

          return NextResponse.json({
            success: true,
            message: '折扣活動更新成功',
            promotion: updatedPromotion[0],
          })
        } catch (dbError) {
          console.error('資料庫操作錯誤:', dbError)
          return NextResponse.json(
            {
              success: false,
              message: '資料庫操作失敗',
              error: String(dbError),
            },
            { status: 500 }
          )
        }
      } catch (error) {
        console.error('更新折扣活動失敗:', error)
        return NextResponse.json(
          {
            success: false,
            message: '更新折扣活動失敗',
            error: String(error),
          },
          { status: 500 }
        )
      }
    }
  )
)

// 日期格式化輔助函數
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null
  try {
    // 如果已經是YYYY-MM-DD格式，則直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // 嘗試轉換日期
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error(`無效的日期格式: ${dateString}`)
      return null
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.error(`日期格式化錯誤:`, error)
    return null
  }
}

// 刪除折扣活動
export const DELETE = guard.api(
  guard.perm('shop:promotions:delete')(
    async (req: NextRequest, { params }: { params?: { pid?: string } }) => {
      try {
        // 從URL解析pid
        let pid: string | null = null

        // 嘗試從params獲取pid
        if (params && params.pid) {
          pid = params.pid
        }
        // 如果params不可用，嘗試從URL解析
        else {
          const urlParts = req.url.split('/')
          pid = urlParts[urlParts.length - 1].split('?')[0] // 移除查詢參數
          // 檢查是否為數字
          if (!/^\d+$/.test(pid)) {
            pid = null
          }
        }

        console.log('刪除折扣活動 - 參數檢查:', {
          params: params,
          url: req.url,
          pid: pid,
        })

        if (!pid) {
          return NextResponse.json(
            { success: false, message: '缺少折扣活動ID' },
            { status: 400 }
          )
        }

        // 檢查折扣活動是否存在
        const [existing] = await db.query(
          'SELECT promotion_id FROM promotions WHERE promotion_id = ?',
          [pid]
        )

        if (!Array.isArray(existing) || existing.length === 0) {
          return NextResponse.json(
            { success: false, message: '找不到指定的折扣活動' },
            { status: 404 }
          )
        }

        // 刪除促銷活動
        await db.execute('DELETE FROM promotions WHERE promotion_id = ?', [pid])

        // 同時刪除相關聯的促銷商品關係
        await db.execute(
          'DELETE FROM promotion_products WHERE promotion_id = ?',
          [pid]
        )

        return NextResponse.json({
          success: true,
          message: '折扣活動已成功刪除',
        })
      } catch (error) {
        console.error('刪除折扣活動失敗:', error)
        return NextResponse.json(
          { success: false, message: '刪除折扣活動失敗', error: String(error) },
          { status: 500 }
        )
      }
    }
  )
)

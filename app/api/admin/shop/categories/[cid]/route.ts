import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取特定分類詳情
export const GET = guard.api(
  guard.perm('shop:categories:read')(
    async (req: NextRequest, { params }: { params: { cid: string } }) => {
      const { cid } = params

      try {
        // 從資料庫獲取分類
        const [categories] = await db.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [cid]
        )

        if (categories.length === 0) {
          return NextResponse.json(
            { success: false, message: '分類不存在' },
            { status: 404 }
          )
        }

        // 獲取該分類下的商品數量
        const [productCount] = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_deleted = 0',
          [cid]
        )

        // 組合返回數據
        const categoryData = {
          ...categories[0],
          product_count: productCount[0].count,
        }

        return NextResponse.json({
          success: true,
          data: categoryData,
        })
      } catch (error) {
        console.error('獲取分類詳情失敗:', error)
        return NextResponse.json(
          { success: false, message: '獲取分類詳情失敗' },
          { status: 500 }
        )
      }
    }
  )
)

// 更新分類
export const PUT = guard.api(
  guard.perm('shop:categories:write')(
    async (req: NextRequest, { params }: { params: { cid: string } }) => {
      const { cid } = params

      try {
        const data = await req.json()
        const { category_name, category_tag, category_description, parent_id } =
          data

        // 驗證必填欄位
        if (!category_name) {
          return NextResponse.json(
            { success: false, message: '分類名稱不能為空' },
            { status: 400 }
          )
        }

        // 檢查分類是否存在
        const [existingCategory] = await db.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [cid]
        )

        if (existingCategory.length === 0) {
          return NextResponse.json(
            { success: false, message: '分類不存在' },
            { status: 404 }
          )
        }

        // 生成標籤
        const tag =
          category_tag || category_name.toLowerCase().replace(/\s+/g, '-')

        // 檢查標籤是否已被其他分類使用
        const [existingTag] = await db.query(
          'SELECT * FROM categories WHERE category_tag = ? AND category_id != ?',
          [tag, cid]
        )

        if (existingTag.length > 0) {
          return NextResponse.json(
            { success: false, message: '分類標籤已存在' },
            { status: 400 }
          )
        }

        // 防止循環引用：檢查parent_id不能是自身或子分類
        if (parent_id && parent_id === parseInt(cid)) {
          return NextResponse.json(
            { success: false, message: '分類不能設置自身為父分類' },
            { status: 400 }
          )
        }

        // 如果有父分類，檢查父分類是否存在
        if (parent_id) {
          const [parent] = await db.query(
            'SELECT * FROM categories WHERE category_id = ?',
            [parent_id]
          )

          if (parent.length === 0) {
            return NextResponse.json(
              { success: false, message: '父分類不存在' },
              { status: 400 }
            )
          }
        }

        // 更新分類
        await db.query(
          `UPDATE categories 
         SET category_name = ?, category_tag = ?, category_description = ?, parent_id = ?, updated_at = NOW()
         WHERE category_id = ?`,
          [
            category_name,
            tag,
            category_description || '',
            parent_id || null,
            cid,
          ]
        )

        // 獲取更新後的分類
        const [updatedCategory] = await db.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [cid]
        )

        // 記錄操作日誌
        try {
          const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1')
            .split(',')[0]
            .trim()

          await db.query(
            `INSERT INTO admin_operation_logs 
            (admin_id, action_type, module, target_id, details, ip_address, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              req.auth?.id || 0,
              '更新',
              'categories',
              cid,
              `更新商品分類：${category_name}`,
              ip,
            ]
          )
        } catch (logError) {
          console.error('記錄操作日誌失敗:', logError)
        }

        return NextResponse.json({
          success: true,
          message: '分類更新成功',
          data: updatedCategory[0],
        })
      } catch (error) {
        console.error('更新分類失敗:', error)
        return NextResponse.json(
          { success: false, message: '更新分類失敗' },
          { status: 500 }
        )
      }
    }
  )
)

// 刪除分類
export const DELETE = guard.api(
  guard.perm('shop:categories:write')(
    async (req: NextRequest, { params }: { params: { cid: string } }) => {
      const { cid } = params

      try {
        // 檢查分類是否存在
        const [existingCategory] = await db.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [cid]
        )

        if (existingCategory.length === 0) {
          return NextResponse.json(
            { success: false, message: '分類不存在' },
            { status: 404 }
          )
        }

        // 檢查分類下是否有商品
        const [productCount] = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_deleted = 0',
          [cid]
        )

        if (productCount[0].count > 0) {
          return NextResponse.json(
            { success: false, message: '分類下存在商品，無法刪除' },
            { status: 400 }
          )
        }

        // 檢查是否有子分類
        const [childCategories] = await db.query(
          'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
          [cid]
        )

        if (childCategories[0].count > 0) {
          return NextResponse.json(
            { success: false, message: '分類下存在子分類，無法刪除' },
            { status: 400 }
          )
        }

        // 刪除分類
        await db.query('DELETE FROM categories WHERE category_id = ?', [cid])

        // 記錄管理操作
        const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1')
          .split(',')[0]
          .trim()

        try {
          await db.query(
            `INSERT INTO admin_operation_logs 
            (admin_id, action_type, module, target_id, details, ip_address, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              req.auth?.id || 0,
              '刪除',
              'categories',
              cid,
              `刪除商品分類：${existingCategory[0].category_name}`,
              ip,
            ]
          )
        } catch (logError) {
          console.error('記錄操作日誌失敗:', logError)
        }

        return NextResponse.json({
          success: true,
          message: '分類刪除成功',
        })
      } catch (error) {
        console.error('刪除分類失敗:', error)
        return NextResponse.json(
          { success: false, message: '刪除分類失敗' },
          { status: 500 }
        )
      }
    }
  )
)

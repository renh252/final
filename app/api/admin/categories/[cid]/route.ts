import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/app/db'
import { verifyAdmin } from '@/app/api/admin/_lib/auth'

// 請求體驗證 schema
const categorySchema = z.object({
  category_name: z.string().min(1, '分類名稱不能為空'),
  category_tag: z.string().min(1, '分類標籤不能為空'),
  category_description: z.string().optional(),
  parent_id: z.number().nullable(),
})

// PUT /api/admin/categories/[cid]
export async function PUT(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 驗證管理員權限
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '未授權的訪問' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(params.cid)
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: '無效的分類ID' },
        { status: 400 }
      )
    }

    // 檢查分類是否存在
    const existingCategory = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId]
    )
    if (existingCategory.length === 0) {
      return NextResponse.json(
        { success: false, message: '分類不存在' },
        { status: 404 }
      )
    }

    // 驗證請求體
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // 檢查分類標籤是否已被其他分類使用
    const tagExists = await db.query(
      'SELECT * FROM categories WHERE category_tag = ? AND category_id != ?',
      [validatedData.category_tag, categoryId]
    )
    if (tagExists.length > 0) {
      return NextResponse.json(
        { success: false, message: '分類標籤已被使用' },
        { status: 400 }
      )
    }

    // 檢查父分類是否形成循環引用
    if (validatedData.parent_id) {
      if (validatedData.parent_id === categoryId) {
        return NextResponse.json(
          { success: false, message: '不能將自己設為父分類' },
          { status: 400 }
        )
      }

      // 檢查父分類是否存在
      const parentCategory = await db.query(
        'SELECT * FROM categories WHERE category_id = ?',
        [validatedData.parent_id]
      )
      if (parentCategory.length === 0) {
        return NextResponse.json(
          { success: false, message: '父分類不存在' },
          { status: 400 }
        )
      }

      // 檢查是否會形成循環引用
      const checkCircular = async (
        parentId: number,
        targetId: number
      ): Promise<boolean> => {
        if (parentId === targetId) return true
        const children = await db.query(
          'SELECT category_id FROM categories WHERE parent_id = ?',
          [parentId]
        )
        for (const child of children) {
          if (await checkCircular(child.category_id, targetId)) return true
        }
        return false
      }

      if (await checkCircular(categoryId, validatedData.parent_id)) {
        return NextResponse.json(
          { success: false, message: '不能選擇子分類作為父分類' },
          { status: 400 }
        )
      }
    }

    // 更新分類
    await db.query(
      `UPDATE categories 
      SET category_name = ?, 
          category_tag = ?, 
          category_description = ?, 
          parent_id = ?
      WHERE category_id = ?`,
      [
        validatedData.category_name,
        validatedData.category_tag,
        validatedData.category_description || '',
        validatedData.parent_id,
        categoryId,
      ]
    )

    // 獲取更新後的分類資料
    const updatedCategory = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId]
    )

    return NextResponse.json({
      success: true,
      message: '分類更新成功',
      data: updatedCategory[0],
    })
  } catch (error: any) {
    console.error('更新分類失敗:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '資料驗證失敗', error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: '更新分類失敗', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[cid]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 驗證管理員權限
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '未授權的訪問' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(params.cid)
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: '無效的分類ID' },
        { status: 400 }
      )
    }

    // 檢查分類是否存在
    const existingCategory = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId]
    )
    if (existingCategory.length === 0) {
      return NextResponse.json(
        { success: false, message: '分類不存在' },
        { status: 404 }
      )
    }

    // 檢查是否有子分類
    const hasChildren = await db.query(
      'SELECT * FROM categories WHERE parent_id = ?',
      [categoryId]
    )
    if (hasChildren.length > 0) {
      return NextResponse.json(
        { success: false, message: '此分類包含子分類，請先刪除子分類' },
        { status: 400 }
      )
    }

    // 檢查是否有關聯的商品
    const hasProducts = await db.query(
      'SELECT * FROM products WHERE category_id = ?',
      [categoryId]
    )
    if (hasProducts.length > 0) {
      return NextResponse.json(
        { success: false, message: '此分類包含商品，請先移除或更改商品的分類' },
        { status: 400 }
      )
    }

    // 刪除分類
    await db.query('DELETE FROM categories WHERE category_id = ?', [categoryId])

    return NextResponse.json({
      success: true,
      message: '分類刪除成功',
    })
  } catch (error: any) {
    console.error('刪除分類失敗:', error)
    return NextResponse.json(
      { success: false, message: '刪除分類失敗', error: error.message },
      { status: 500 }
    )
  }
}

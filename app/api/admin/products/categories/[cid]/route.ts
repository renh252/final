import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../../_lib/data-export'
import { executeQuery } from '../../../_lib/database'

// 獲取單個商品分類
export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const categoryId = params.cid

    // 獲取分類信息
    const category = await executeQuery(
      `SELECT * FROM categories WHERE category_id = ?`,
      [categoryId]
    )

    if (!category || category.length === 0) {
      return NextResponse.json({ error: '商品分類不存在' }, { status: 404 })
    }

    // 獲取該分類下的商品
    const products = await executeQuery(
      `SELECT 
        product_id,
        product_name,
        product_price,
        product_image,
        product_stock,
        product_status,
        created_at
      FROM products 
      WHERE product_category = ?
      ORDER BY created_at DESC`,
      [categoryId]
    )

    // 獲取子分類
    const subCategories = await executeQuery(
      `SELECT * FROM categories WHERE parent_id = ?`,
      [categoryId]
    )

    return NextResponse.json({
      category: category[0],
      products,
      subCategories,
    })
  } catch (error) {
    console.error('獲取商品分類詳情時發生錯誤:', error)
    return NextResponse.json({ error: '獲取商品分類詳情失敗' }, { status: 500 })
  }
}

// 更新商品分類
export async function PUT(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const categoryId = params.cid
    const data = await request.json()

    // 檢查分類是否存在
    const existingCategory = await executeQuery(
      `SELECT * FROM categories WHERE category_id = ?`,
      [categoryId]
    )

    if (!existingCategory || existingCategory.length === 0) {
      return NextResponse.json({ error: '商品分類不存在' }, { status: 404 })
    }

    // 如果更改了分類名稱，檢查新名稱是否已存在
    if (
      data.category_name &&
      data.category_name !== existingCategory[0].category_name
    ) {
      const nameCheck = await executeQuery(
        `SELECT * FROM categories WHERE category_name = ? AND category_id != ?`,
        [data.category_name, categoryId]
      )

      if (nameCheck && nameCheck.length > 0) {
        return NextResponse.json({ error: '分類名稱已存在' }, { status: 400 })
      }
    }

    // 檢查父分類是否形成循環引用
    if (data.parent_id) {
      // 不能將自己設為父分類
      if (data.parent_id === categoryId) {
        return NextResponse.json(
          { error: '不能將自己設為父分類' },
          { status: 400 }
        )
      }

      // 檢查選擇的父分類是否是當前分類的子分類
      const checkCircular = async (
        parentId: string,
        targetId: string
      ): Promise<boolean> => {
        if (parentId === targetId) return true

        const children = await executeQuery(
          `SELECT category_id FROM categories WHERE parent_id = ?`,
          [parentId]
        )

        for (const child of children) {
          if (await checkCircular(child.category_id, targetId)) {
            return true
          }
        }

        return false
      }

      if (await checkCircular(categoryId, data.parent_id)) {
        return NextResponse.json(
          { error: '不能選擇子分類作為父分類' },
          { status: 400 }
        )
      }
    }

    // 更新分類信息
    await executeQuery(
      `UPDATE categories SET
        category_name = ?,
        category_description = ?,
        parent_id = ?,
        category_tag = ?,
        updated_at = NOW()
      WHERE category_id = ?`,
      [
        data.category_name || existingCategory[0].category_name,
        data.category_description !== undefined
          ? data.category_description
          : existingCategory[0].category_description,
        data.parent_id !== undefined
          ? data.parent_id
          : existingCategory[0].parent_id,
        data.category_tag || existingCategory[0].category_tag,
        categoryId,
      ]
    )

    // 獲取更新後的分類信息
    const updatedCategory = await executeQuery(
      `SELECT * FROM categories WHERE category_id = ?`,
      [categoryId]
    )

    return NextResponse.json({
      message: '商品分類更新成功',
      category: updatedCategory[0],
    })
  } catch (error) {
    console.error('更新商品分類時發生錯誤:', error)
    return NextResponse.json({ error: '更新商品分類失敗' }, { status: 500 })
  }
}

// 刪除商品分類
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const categoryId = params.cid

    // 檢查分類是否存在
    const existingCategory = await executeQuery(
      `SELECT * FROM categories WHERE category_id = ?`,
      [categoryId]
    )

    if (!existingCategory || existingCategory.length === 0) {
      return NextResponse.json({ error: '商品分類不存在' }, { status: 404 })
    }

    // 檢查是否有子分類
    const subCategories = await executeQuery(
      `SELECT * FROM categories WHERE parent_id = ?`,
      [categoryId]
    )

    if (subCategories && subCategories.length > 0) {
      return NextResponse.json(
        { error: '無法刪除含有子分類的分類' },
        { status: 400 }
      )
    }

    // 檢查是否有商品使用此分類
    const products = await executeQuery(
      `SELECT * FROM products WHERE product_category = ?`,
      [categoryId]
    )

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: '無法刪除含有商品的分類' },
        { status: 400 }
      )
    }

    // 刪除分類
    await executeQuery(`DELETE FROM categories WHERE category_id = ?`, [
      categoryId,
    ])

    return NextResponse.json({ message: '商品分類刪除成功' })
  } catch (error) {
    console.error('刪除商品分類時發生錯誤:', error)
    return NextResponse.json({ error: '刪除商品分類失敗' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '../../_lib/data-export'
import { processFileUpload, validateImportData } from '../../_lib/data-import'
import { executeQuery } from '../../_lib/database'

// 導入商品數據
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // 處理文件上傳
    const formData = await request.formData()
    const fileResult = await processFileUpload(formData)

    if (!fileResult.success || !fileResult.data) {
      return NextResponse.json(
        { error: fileResult.error || '文件處理失敗' },
        { status: 400 }
      )
    }

    const importData = fileResult.data

    // 驗證導入數據
    const validationResult = validateImportData(importData, [
      'product_name',
      'product_price',
      'product_stock',
    ])

    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.errors.join(', ') },
        { status: 400 }
      )
    }

    // 導入結果統計
    const results = {
      total: importData.length,
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    }

    // 獲取所有商品類別
    const categories = await executeQuery(
      'SELECT category_id, category_name FROM categories'
    )
    const categoryMap = new Map(
      categories.map((cat: any) => [cat.category_name, cat.category_id])
    )

    // 處理每一條記錄
    for (let i = 0; i < importData.length; i++) {
      const product = importData[i]
      try {
        // 驗證必填字段
        if (!product.product_name) {
          throw new Error('商品名稱不能為空')
        }

        if (!product.product_price || isNaN(Number(product.product_price))) {
          throw new Error('商品價格必須是有效數字')
        }

        if (!product.product_stock || isNaN(Number(product.product_stock))) {
          throw new Error('商品庫存必須是有效數字')
        }

        // 處理商品類別
        let categoryId = null
        if (product.product_category) {
          // 如果提供了類別名稱，查找對應的類別ID
          categoryId = categoryMap.get(product.product_category)

          // 如果找不到類別，創建新類別
          if (!categoryId && product.product_category.trim() !== '') {
            const newCategory = await executeQuery(
              'INSERT INTO categories (category_name, category_tag) VALUES (?, ?)',
              [
                product.product_category,
                product.product_category.toLowerCase().replace(/\s+/g, '_'),
              ]
            )
            categoryId = newCategory[0].insertId
            // 更新類別映射
            categoryMap.set(product.product_category, categoryId)
          }
        }

        // 轉換狀態值
        let productStatus = product.product_status
        if (product.product_status === 'active') {
          productStatus = '上架'
        } else if (product.product_status === 'inactive') {
          productStatus = '下架'
        }

        // 檢查商品是否已存在（根據名稱）
        const existingProduct = await executeQuery(
          'SELECT product_id FROM products WHERE product_name = ? AND is_deleted = 0',
          [product.product_name]
        )

        let productId
        if (existingProduct && existingProduct.length > 0) {
          // 更新現有商品
          productId = existingProduct[0].product_id
          await executeQuery(
            `UPDATE products SET
              price = ?,
              product_description = ?,
              image_url = ?,
              stock_quantity = ?,
              product_status = ?,
              category_id = ?,
              updated_at = NOW()
            WHERE product_id = ?`,
            [
              Number(product.product_price),
              product.product_description || '',
              product.product_image || '',
              Number(product.product_stock),
              productStatus,
              categoryId,
              productId,
            ]
          )
        } else {
          // 創建新商品
          const newProduct = await executeQuery(
            `INSERT INTO products (
              product_name,
              price,
              product_description,
              image_url,
              stock_quantity,
              product_status,
              category_id,
              is_deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.product_name,
              Number(product.product_price),
              product.product_description || '',
              product.product_image || '',
              Number(product.product_stock),
              productStatus,
              categoryId,
              0, // 默認未刪除
            ]
          )
          productId = newProduct[0].insertId
        }

        // 處理商品變體（如果有）
        if (product.variants && typeof product.variants === 'string') {
          try {
            const variants = JSON.parse(product.variants)
            if (Array.isArray(variants)) {
              // 刪除現有變體
              await executeQuery(
                'DELETE FROM product_variants WHERE product_id = ?',
                [productId]
              )

              // 添加新變體
              for (const variant of variants) {
                if (variant.variant_name) {
                  await executeQuery(
                    `INSERT INTO product_variants (
                      product_id,
                      variant_name,
                      price,
                      stock_quantity
                    ) VALUES (?, ?, ?, ?)`,
                    [
                      productId,
                      variant.variant_name,
                      Number(variant.variant_price) ||
                        Number(product.product_price),
                      Number(variant.variant_stock) ||
                        Number(product.product_stock),
                    ]
                  )
                }
              }
            }
          } catch (e) {
            console.warn(
              `解析商品 ${product.product_name} 的變體數據時出錯:`,
              e
            )
          }
        }

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: i + 1, // 行號從1開始
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `成功導入 ${results.success} 個商品，失敗 ${results.failed} 個`,
      results,
    })
  } catch (error) {
    console.error('導入商品數據時發生錯誤:', error)
    return NextResponse.json({ error: '導入商品數據失敗' }, { status: 500 })
  }
}

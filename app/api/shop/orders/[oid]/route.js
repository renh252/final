import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

// 獲取訂單詳情
export async function GET(request, { params }) {
  try {
    const id = params.oid
    const connection = await pool.getConnection()
    let responseData = {}

    // 獲取訂單
    const [order] = await connection.execute(
      `
          SELECT * FROM orders  WHERE order_id = ?
          `,
      [id]
    )

    if (order.length === 0) {
      connection.release()
      return NextResponse.json({ error: '找不到此商品' }, { status: 404 })
    }
    responseData.order = order[0]

    // 獲取訂單明細與評價
    const [products] = await connection.execute(
      `
        SELECT 
          oi.*,
          p.product_name,
          CASE
            WHEN pv.image_url IS NOT NULL AND pv.image_url != '' THEN pv.image_url
            ELSE p.image_url
          END AS image_url,
          pv.variant_name,
          pr.rating,
          pr.review_text,
          pr.created_at AS review_created_at
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id AND oi.product_id = pv.product_id
        LEFT JOIN product_reviews pr ON oi.order_item_id = pr.order_item_id
        WHERE oi.order_id = ?
        ORDER BY 
          CASE WHEN pr.created_at IS NULL THEN 0 ELSE 1 END,
          pr.created_at DESC
          `,
      [id]
    )
    responseData.products = products

    // 释放连接
    connection.release()

    // 返回数据
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

// 提交評價
export async function POST(request, { params }) {
  let connection
  try {
    const { orderItemId, productId, variantId, rating, reviewText, userId } =
      await request.json()
    const orderId = params.oid

    if (!orderItemId || !productId || !variantId || !rating) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }
    console.log({
      orderItemId: orderItemId,
      productId: productId,
      variantId: variantId,
      rating: rating,
      reviewText: reviewText,
      orderId: orderId,
      user_id: userId,
    })

    connection = await pool.getConnection()

    // 驗證訂單項目是否屬於該訂單
    const [orderItems] = await connection.execute(
      `
      SELECT * FROM order_items 
      WHERE order_id = ? AND order_item_id = ? AND product_id = ?
    `,
      [orderId, orderItemId, productId]
    )

    if (orderItems.length === 0) {
      return NextResponse.json({ error: '無效的訂單項目' }, { status: 400 })
    }

    // 檢查是否已經評價過
    const [existingReviews] = await connection.execute(
      `
      SELECT * FROM product_reviews 
      WHERE order_item_id = ?
    `,
      [orderItemId]
    )

    if (existingReviews.length > 0) {
      return NextResponse.json({ error: '該商品已經評價過' }, { status: 400 })
    }

    // 插入評價
    await connection.execute(
      `
      INSERT INTO product_reviews 
      (order_item_id, user_id, product_id, variant_id, rating, review_text, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
      [orderItemId, userId, productId, variantId, rating, reviewText]
    )

    // 發送通知給管理員(假設管理員ID為1)
    try {
      // 獲取商品名稱
      const [products] = await connection.execute(
        `
        SELECT product_name FROM products WHERE product_id = ?
      `,
        [productId]
      )

      const productName =
        products.length > 0 ? products[0].product_name : `商品 #${productId}`

      // 用戶發表評價通知
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/notifications/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 1, // 假設管理員ID為1
            type: 'review',
            title: '收到新商品評價',
            message: `商品「${productName}」收到了 ${rating} 星評價${
              reviewText ? '：' + reviewText : ''
            }`,
            link: `/admin/shop/products/${productId}`,
          }),
        }
      )

      // 也給用戶發送一個確認通知
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/notifications/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            type: 'review',
            title: '評價提交成功',
            message: `您對「${productName}」的評價已成功提交，感謝您的反饋。`,
            link: `/member/orders/${orderId}`,
          }),
        }
      )
    } catch (notifyError) {
      console.error('發送評價通知時發生錯誤:', notifyError)
      // 不影響主流程，僅記錄錯誤
    }

    return NextResponse.json({ message: '評價提交成功' }, { status: 200 })
  } catch (error) {
    console.error('提交評價時發生錯誤：', error)
    return NextResponse.json({ error: '提交評價時發生錯誤' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

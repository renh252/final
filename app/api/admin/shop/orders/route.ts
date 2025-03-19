import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取訂單列表
export const GET = guard.api(
  guard.perm('shop:orders:read')(async (req: NextRequest) => {
    try {
      // 查詢所有訂單及相關信息
      const [rows] = await db.query(`
        SELECT 
          o.*,
          u.user_name,
          u.user_email,
          u.user_number,
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as items_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
      `)

      // 訂單處理
      const orders = await Promise.all(
        rows.map(async (order) => {
          // 獲取訂單項目
          const [items] = await db.query(
            `SELECT 
              oi.*,
              p.product_name,
              p.image_url
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?`,
            [order.order_id]
          )

          return {
            ...order,
            items,
            recipient_name:
              order.recipient_name || order.user_name || '未知用戶',
          }
        })
      )

      return NextResponse.json({
        success: true,
        orders,
      })
    } catch (error: any) {
      console.error('獲取訂單列表失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '獲取訂單列表失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

// 新增訂單（管理員代下單）
export const POST = guard.api(
  guard.perm('shop:orders:write')(async (req: NextRequest) => {
    try {
      const data = await req.json()

      // 驗證必要欄位
      if (
        !data.user_id ||
        !data.items ||
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: '用戶ID和訂單項目為必填欄位',
          },
          { status: 400 }
        )
      }

      // 開始事務
      await db.query('START TRANSACTION')

      try {
        // 計算訂單總金額
        let totalPrice = 0
        for (const item of data.items) {
          // 獲取商品信息
          const [products] = await db.query(
            'SELECT price FROM products WHERE product_id = ?',
            [item.product_id]
          )

          if (products.length === 0) {
            throw new Error(`商品ID ${item.product_id} 不存在`)
          }

          totalPrice += products[0].price * item.quantity
        }

        // 生成訂單ID (例如: ORD202405010001)
        const orderDate = new Date()
        const orderPrefix =
          'ORD' +
          orderDate.getFullYear() +
          String(orderDate.getMonth() + 1).padStart(2, '0') +
          String(orderDate.getDate()).padStart(2, '0')

        // 查詢當天最後一筆訂單編號
        const [lastOrders] = await db.query(
          `SELECT order_id FROM orders 
           WHERE order_id LIKE ? 
           ORDER BY order_id DESC LIMIT 1`,
          [`${orderPrefix}%`]
        )

        let orderSeq = 1
        if (lastOrders.length > 0) {
          const lastSeq = parseInt(lastOrders[0].order_id.slice(-4))
          orderSeq = lastSeq + 1
        }

        const orderId = `${orderPrefix}${String(orderSeq).padStart(4, '0')}`

        // 插入訂單記錄
        await db.query(
          `INSERT INTO orders (
            order_id,
            user_id,
            order_status,
            payment_status,
            payment_method,
            shipping_method,
            total_price,
            shipping_address,
            recipient_name,
            recipient_phone,
            recipient_email,
            remark,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            orderId,
            data.user_id,
            data.order_status || '待出貨',
            data.payment_status || '未付款',
            data.payment_method || '信用卡',
            data.shipping_method || '宅配',
            totalPrice,
            data.shipping_address || '',
            data.recipient_name || '',
            data.recipient_phone || '',
            data.recipient_email || '',
            data.remark || '',
          ]
        )

        // 插入訂單項目
        for (const item of data.items) {
          await db.query(
            `INSERT INTO order_items (
              order_id,
              product_id,
              quantity,
              price
            ) VALUES (?, ?, ?, (SELECT price FROM products WHERE product_id = ?))`,
            [orderId, item.product_id, item.quantity, item.product_id]
          )

          // 更新庫存
          await db.query(
            `UPDATE products 
             SET stock_quantity = stock_quantity - ? 
             WHERE product_id = ?`,
            [item.quantity, item.product_id]
          )
        }

        // 提交事務
        await db.query('COMMIT')

        // 獲取新建訂單的完整信息
        const [orders] = await db.query(
          `
          SELECT 
            o.*,
            u.user_name,
            u.user_email,
            u.user_number
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.user_id
          WHERE o.order_id = ?
        `,
          [orderId]
        )

        if (orders.length === 0) {
          throw new Error('無法獲取新建訂單信息')
        }

        // 獲取訂單項目
        const [items] = await db.query(
          `SELECT 
            oi.*,
            p.product_name,
            p.image_url
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ?`,
          [orderId]
        )

        const orderData = {
          ...orders[0],
          items,
          recipient_name:
            orders[0].recipient_name || orders[0].user_name || '未知用戶',
        }

        return NextResponse.json({
          success: true,
          message: '訂單建立成功',
          order: orderData,
        })
      } catch (error) {
        // 回滾事務
        await db.query('ROLLBACK')
        throw error
      }
    } catch (error: any) {
      console.error('建立訂單失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '建立訂單失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

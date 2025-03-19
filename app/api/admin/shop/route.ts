import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { guard } from '@/app/api/admin/_lib/guard'

// 獲取商店概覽統計
export const GET = guard.api(
  guard.perm('shop:read')(async (req: NextRequest) => {
    try {
      // 統計商品總數和狀態分佈
      const [productStats] = await db.query(`
        SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN product_status = '上架' THEN 1 ELSE 0 END) as active_products,
          SUM(CASE WHEN product_status = '下架' THEN 1 ELSE 0 END) as inactive_products
        FROM products
        WHERE is_deleted = 0
      `)

      // 統計訂單相關數據
      const [orderStats] = await db.query(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN order_status = '待出貨' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN order_status = '已出貨' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN order_status = '已完成' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN order_status = '已取消' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN order_status != '已取消' THEN total_price ELSE 0 END) as total_revenue
        FROM orders
      `)

      // 統計月度收入和訂單數量
      const [monthlyStats] = await db.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as order_count,
          SUM(total_price) as revenue
        FROM orders
        WHERE order_status != '已取消'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `)

      // 統計庫存低的商品數量
      const [lowStockStats] = await db.query(`
        SELECT COUNT(*) as low_stock_count
        FROM products
        WHERE stock_quantity < 10 
        AND is_deleted = 0
        AND product_status = '上架'
      `)

      // 獲取最近5筆訂單
      const [recentOrders] = await db.query(`
        SELECT 
          o.order_id,
          o.created_at,
          o.total_price,
          o.order_status,
          u.user_name,
          u.user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `)

      // 獲取銷售量前5名的商品
      const [topProducts] = await db.query(`
        SELECT 
          p.product_id,
          p.product_name,
          p.price,
          p.image_url,
          SUM(oi.quantity) as sold_quantity
        FROM products p
        JOIN order_items oi ON p.product_id = oi.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_status != '已取消'
        GROUP BY p.product_id
        ORDER BY sold_quantity DESC
        LIMIT 5
      `)

      return NextResponse.json({
        success: true,
        stats: {
          products: productStats[0] || {
            total_products: 0,
            active_products: 0,
            inactive_products: 0,
          },
          orders: orderStats[0] || {
            total_orders: 0,
            pending_orders: 0,
            shipped_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            total_revenue: 0,
          },
          monthly: monthlyStats || [],
          low_stock: lowStockStats[0]?.low_stock_count || 0,
          recent_orders: recentOrders || [],
          top_products: topProducts || [],
        },
      })
    } catch (error: any) {
      console.error('獲取商店統計數據失敗:', error)
      return NextResponse.json(
        {
          success: false,
          message: '獲取商店統計數據失敗',
          error: error.message,
        },
        { status: 500 }
      )
    }
  })
)

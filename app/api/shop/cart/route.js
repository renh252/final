import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { searchParams } from 'next/dist/server/api-utils'

// 获取用户购物车中的商品列表
export const GET = async(request) => {
  const output = { success: false, data: null, error: "" };


  try{
    // 从请求中获取用户信息，例如：
    // const userId = await getUserIdFromRequest(request);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      output.error = "未提供用户ID";
      return NextResponse.json(output, { status: 400 });
    }
    
    const connection = await pool.getConnection()
    
    
    // const [cart] = await connection.execute(`
    const [cart] = await connection.execute(`
      SELECT 
        cart.id AS cart_id,
        cart.product_id,
        cart.variant_id,
        cart.quantity,
        products.product_name,
        variants.variant_name,
        COALESCE(variants.price, products.price) AS price,
        COALESCE(variants.image_url, products.image_url) AS image_url,
        promo.promotion_id,
        promo.promotion_name,
        promo.discount_percentage,
        promo.start_date,
        promo.end_date
      FROM 
        shopping_cart AS cart
      JOIN 
        products ON cart.product_id = products.product_id
      LEFT JOIN 
        product_variants AS variants ON cart.variant_id = variants.variant_id
      LEFT JOIN (
        SELECT 
          pp.product_id,
          p.promotion_id,
          p.promotion_name,
          p.discount_percentage,
          p.start_date,
          p.end_date,
          ROW_NUMBER() OVER (PARTITION BY pp.product_id ORDER BY p.start_date DESC) as rn
        FROM 
          promotion_products pp
        JOIN 
          promotions p ON pp.promotion_id = p.promotion_id
        WHERE 
          p.start_date <= CURDATE() AND (p.end_date IS NULL OR p.end_date >= CURDATE())
      ) AS promo ON cart.product_id = promo.product_id AND promo.rn = 1
      WHERE 
        cart.user_id = ?
    `, [userId]);

    connection.release(); 
    
    if (cart.length == 0) {
      output.error = "購物車目前沒有商品";
    } else {
      output.success = true;
      
      // 处理返回的数据，将活动信息整合到每个商品中
      output.data = cart.map(item => {
        const productInfo = {
          cart_id: item.cart_id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          product_name: item.product_name,
          variant_name: item.variant_name,
          price: item.price,
          image_url: item.image_url,
        };

        if (item.promotion_id) {
          productInfo.promotion = {
            promotion_id: item.promotion_id,
            promotion_name: item.promotion_name,
            description: item.promotion_description,
            discount_percentage: item.discount_percentage,
            discount_value: item.discount_value,
            start_date: item.start_date,
            end_date: item.end_date
          };
        }

        return productInfo;
      });

      // 計算商品總數量
      output.totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    return NextResponse.json(output);

  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}

// 新增：删除用户购物车所有商品的 DELETE 方法
export async function DELETE(request) {
  const output = { success: false, error: "" };

  try {
    // 从请求中获取用户信息，例如：
    // const userId = await getUserIdFromRequest(request);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      output.error = "未提供用户ID";
      return NextResponse.json(output, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    // 删除该用户购物车中的所有商品
    const [result] = await connection.execute('DELETE FROM shopping_cart WHERE user_id = ?', [userId]);
    
    connection.release(); // 释放连接

    if (result.affectedRows > 0) {
      output.success = true;
    } else {
      output.error = "購物車已經是空的";
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error('刪除購物車商品時發生錯誤：', error)
    return NextResponse.json({ error: '刪除購物車商品時發生錯誤' }, { status: 500 })
  }
}

// 從商品頁面新增商品到購物車
export async function POST(request) {
  try {
    const { productId, variantId, quantity , userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: '未提供用户ID' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // 檢查商品是否已經在購物車中
    const [existingItem] = await connection.execute(
      'SELECT id, quantity FROM shopping_cart WHERE user_id = ? AND product_id = ? AND variant_id = ?',
      [userId, productId, variantId]
    );

    let result;
    if (existingItem.length > 0) {
      // 如果商品已經在購物車中，更新數量
      const newQuantity = existingItem[0].quantity + quantity;
      [result] = await connection.execute(
        'UPDATE shopping_cart SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem[0].id]
      );
    } else {
      // 如果商品不在購物車中，新增項目
      [result] = await connection.execute(
        'INSERT INTO shopping_cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
        [userId, productId, variantId, quantity]
      );
    }

    connection.release();

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: '購物車更新成功' });
    } else {
      return NextResponse.json({ success: false, message: '購物車更新失敗' }, { status: 400 });
    }
  } catch (error) {
    console.error('更新購物車時發生錯誤：', error);
    return NextResponse.json({ success: false, message: '更新購物車時發生錯誤' }, { status: 500 });
  }
}
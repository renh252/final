import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export const GET = async(request) => {
  const output = { success: false, data: null, error: "" };


  try{
    // 从请求中获取用户信息，例如：
    // const userId = await getUserIdFromRequest(request);
    const userId = 1;
    if (!userId) {
      output.error = "未登入";
      return NextResponse.json(output); 
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
  COALESCE(variants.image_url, products.image_url) AS image_url
FROM 
  shopping_cart AS cart
JOIN 
  products ON cart.product_id = products.product_id
LEFT JOIN 
  product_variants AS variants ON cart.variant_id = variants.variant_id
WHERE 
  cart.user_id = ?

      `, [userId]);
      
      connection.release(); 
      
      if (cart.length == 0) {
        output.error = "購物車為空";
      }else{
        output.success = true;
        output.data = cart;
        
      }
      
      
      
      
    return NextResponse.json(output);

  }catch (error) {
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
    const userId = 1; // 临时使用固定值，实际应该从请求中获取

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
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function PUT(request, { params }) {
  const { pid } = params;
  const { quantity, userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ success: false, message: '未提供用戶ID' }, { status: 400 });
  }

  try {
    const connection = await pool.getConnection();

    // 更新購物車商品數量
    const [result] = await connection.execute(
      'UPDATE shopping_cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, pid, userId]
    );

    connection.release();

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: '購物車更新成功' });
    } else {
      return NextResponse.json({ success: false, message: '找不到指定的購物車項目' }, { status: 404 });
    }
  } catch (error) {
    console.error('更新購物車時發生錯誤：', error);
    return NextResponse.json({ success: false, message: '更新購物車時發生錯誤' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { pid } = params;
  try {
    const connection = await pool.getConnection();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return NextResponse.json({ success: false, message: '未提供用戶ID' }, { status: 400 });
    }

    // 更新購物車商品數量
    const [result] = await connection.execute(
      'DELETE FROM shopping_cart WHERE id = ? AND user_id = ?',
      [pid, userId]
    );

    connection.release();

    
    if (result.affectedRows > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '商品已成功從購物車中刪除' });
    } else {
      return NextResponse.json({ 
        success: false, message: '找不到指定的購物車項目' }, 
        { status: 404 });
    }

  }catch (error) {
    console.error('刪除購物車商品時發生錯誤：', error);
    return NextResponse.json({ success: false, message: '刪除購物車時發生錯誤' }, { status: 500 });
  }
}
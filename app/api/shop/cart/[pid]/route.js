import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function PUT(request, { params }) {
  const { pid } = params;
  const { quantity } = await request.json();

  try {
    const connection = await pool.getConnection();

    // 更新購物車商品數量
    const [result] = await connection.execute(
      'UPDATE shopping_cart SET quantity = ? WHERE id = ?',
      [quantity, pid]
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
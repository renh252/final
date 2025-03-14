import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request, { params }) {
  try{
    const id = params.pid
    let responseData = {}
    const connection = await pool.getConnection()



  }catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM pets LIMIT 10')

    return NextResponse.json({ pets: rows })
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}

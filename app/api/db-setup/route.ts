import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// POST /api/db-setup
export async function POST() {
  try {
    // Add image_url column to forum_posts table if it doesn't exist
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pet_proj' 
      AND TABLE_NAME = 'forum_posts' 
      AND COLUMN_NAME = 'image_url'
    `
    
    const columnExists = await executeQuery(checkColumnQuery) as any[]
    
    if (columnExists.length === 0) {
      // Column doesn't exist, add it
      const alterTableQuery = `
        ALTER TABLE forum_posts 
        ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER content
      `
      await executeQuery(alterTableQuery)
      return NextResponse.json({ status: 'success', message: 'image_url column added successfully' })
    }
    
    return NextResponse.json({ status: 'success', message: 'image_url column already exists' })
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

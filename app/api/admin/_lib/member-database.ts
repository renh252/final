import { executeQuery } from './database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// 會員資料介面
export interface Member {
  user_id: number
  user_email: string
  user_password?: string
  user_name: string
  user_number: string
  user_address: string
  user_birthday: string | null
  user_level: string | null
  profile_picture: string | null
  user_status: string
}

// 獲取所有會員列表
export async function getAllMembers(): Promise<Member[]> {
  const query = `
    SELECT 
      user_id,
      user_email,
      user_name,
      user_number,
      user_address,
      DATE_FORMAT(user_birthday, '%Y-%m-%d') as user_birthday,
      user_level,
      profile_picture,
      user_status
    FROM users
    ORDER BY user_id DESC
  `

  try {
    const results = await executeQuery<Member & RowDataPacket>(query)
    return results
  } catch (error) {
    console.error('Error fetching members:', error)
    throw error
  }
}

// 獲取單個會員詳情
export async function getMemberById(id: number): Promise<Member | null> {
  try {
    const query = `
      SELECT 
        user_id,
        user_email,
        user_name,
        user_number,
        user_address,
        DATE_FORMAT(user_birthday, '%Y-%m-%d') as user_birthday,
        user_level,
        profile_picture,
        user_status
      FROM users
      WHERE user_id = ?
    `
    const results = await executeQuery<Member & RowDataPacket>(query, [id])
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error('Error fetching member:', error)
    throw error
  }
}

// 新增會員
export async function createMember(
  member: Omit<Member, 'user_id'>
): Promise<number> {
  try {
    const query = `
      INSERT INTO users (
        user_email,
        user_password,
        user_name,
        user_number,
        user_address,
        user_birthday,
        user_level,
        profile_picture,
        user_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      member.user_email,
      member.user_password,
      member.user_name,
      member.user_number,
      member.user_address,
      member.user_birthday,
      member.user_level,
      member.profile_picture,
      member.user_status,
    ]

    const [result] = await executeQuery<ResultSetHeader>(query, values)
    return result.insertId
  } catch (error) {
    console.error('Error creating member:', error)
    throw error
  }
}

// 更新會員資料
export async function updateMember(
  id: number,
  member: Partial<Member>
): Promise<boolean> {
  try {
    const updateFields = []
    const values = []

    if (member.user_email !== undefined) {
      updateFields.push('user_email = ?')
      values.push(member.user_email)
    }
    if (member.user_password !== undefined) {
      updateFields.push('user_password = ?')
      values.push(member.user_password)
    }
    if (member.user_name !== undefined) {
      updateFields.push('user_name = ?')
      values.push(member.user_name)
    }
    if (member.user_number !== undefined) {
      updateFields.push('user_number = ?')
      values.push(member.user_number)
    }
    if (member.user_address !== undefined) {
      updateFields.push('user_address = ?')
      values.push(member.user_address)
    }
    if (member.user_birthday !== undefined) {
      updateFields.push('user_birthday = ?')
      values.push(member.user_birthday)
    }
    if (member.user_level !== undefined) {
      updateFields.push('user_level = ?')
      values.push(member.user_level)
    }
    if (member.profile_picture !== undefined) {
      updateFields.push('profile_picture = ?')
      values.push(member.profile_picture)
    }
    if (member.user_status !== undefined) {
      updateFields.push('user_status = ?')
      values.push(member.user_status)
    }

    if (updateFields.length === 0) return false

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE user_id = ?
    `
    values.push(id)

    const [result] = await executeQuery<ResultSetHeader>(query, values)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating member:', error)
    throw error
  }
}

// 刪除會員
export async function deleteMember(id: number): Promise<boolean> {
  try {
    const query = 'DELETE FROM users WHERE user_id = ?'
    const [result] = await executeQuery<ResultSetHeader>(query, [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error deleting member:', error)
    throw error
  }
}

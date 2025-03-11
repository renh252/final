import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AdminPayload } from './jwt'

// 從請求中提取和驗證 JWT
export async function isAuthenticated(
  request: NextRequest
): Promise<AdminPayload | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  return await verifyToken(token)
}

// 檢查管理員是否擁有特定權限
export function hasPermission(
  admin: AdminPayload | null,
  requiredArea: string | string[]
): boolean {
  if (!admin) return false

  // 超級管理員權限
  if (admin.privileges === '111') return true

  // 處理可能的複合權限（用逗號分隔）
  const adminPrivileges = admin.privileges.split(',')

  // 檢查是否有該權限區域的存取權
  if (Array.isArray(requiredArea)) {
    return requiredArea.some((area) => adminPrivileges.includes(area))
  }

  return adminPrivileges.includes(requiredArea)
}

// 產生未授權的回應
export function unauthorizedResponse(message = '未授權的請求') {
  return NextResponse.json({ success: false, message }, { status: 401 })
}

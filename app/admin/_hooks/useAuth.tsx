import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../_components/LoadingSpinner'
import { useAdmin } from '../AdminContext'

// 授權介面
interface Auth {
  id: number
  role: string
  perms: string[]
}

// 使用授權 Hook
export function useAuth(requiredPerm?: string) {
  const [auth, setAuth] = useState<Auth | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { admin, isLoading, checkAuth } = useAdmin()

  useEffect(() => {
    const verify = async () => {
      try {
        // 檢查認證狀態
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.push('/admin/login')
          return
        }

        if (!admin) {
          router.push('/admin/login')
          return
        }

        // 確保 privileges 有值
        const privileges = admin.privileges || ''
        const isSuperAdmin = privileges === '111'

        // 設置授權資訊
        setAuth({
          id: admin.id,
          role: isSuperAdmin ? 'super' : 'admin',
          perms: privileges ? privileges.split(',') : [],
        })

        // 檢查權限 - 超級管理員總是有權限，不需要檢查
        if (
          requiredPerm &&
          !isSuperAdmin && // 超級管理員跳過權限檢查
          privileges &&
          !privileges.split(',').includes(requiredPerm)
        ) {
          console.log('權限檢查失敗：', {
            需要權限: requiredPerm,
            當前權限: privileges,
            是否超級管理員: isSuperAdmin,
          })
          router.push('/admin/403')
          return
        }
      } catch (error) {
        console.error('驗證錯誤:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [router, requiredPerm, admin, checkAuth])

  return {
    auth,
    loading: loading || isLoading,
    isAuthenticated: !!auth,
    can: (perm: string) =>
      auth ? auth.role === 'super' || auth.perms.includes(perm) : false,
  }
}

// 授權 HOC
export function withAuth<
  P extends { auth?: Auth; can?: (perm: string) => boolean }
>(Component: React.ComponentType<P>, requiredPerm?: string) {
  return function AuthComponent(props: Omit<P, 'auth' | 'can'>) {
    const { auth, loading, can } = useAuth(requiredPerm)

    if (loading) {
      return <LoadingSpinner />
    }

    if (!auth) {
      return null
    }

    return <Component {...(props as P)} auth={auth} can={can} />
  }
}

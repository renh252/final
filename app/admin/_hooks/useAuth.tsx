import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../_components/LoadingSpinner'
import Cookies from 'js-cookie'
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

        // 設置授權資訊
        setAuth({
          id: admin.id,
          role: admin.privileges === '111' ? 'super' : 'admin',
          perms: admin.privileges.split(','),
        })

        // 檢查權限
        if (
          requiredPerm &&
          !admin.privileges.split(',').includes(requiredPerm)
        ) {
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

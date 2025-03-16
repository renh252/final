'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/shop')
  }, [router])

  return <div>載入中...</div> 
}
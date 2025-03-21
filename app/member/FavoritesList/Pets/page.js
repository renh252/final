'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function PetLikePage() {
  const { user } = useAuth()


  if (!user) {
    return null
  }

  return (
    <>
      <div>寵物收藏</div>
      <div>用戶資訊：</div>
      <div>ID: {user.id}</div>
      <div>名稱: {user.name}</div>
      <div>Email: {user.email}</div>
      <button onClick={()=>{user.logout()}}>登出</button>
    </>
  )
}

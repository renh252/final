'use client'

import React, { useState, useEffect } from 'react'
import { usePageTitle } from '@/app/context/TitleContext'

export default function ArticleLikePage(props) {
  usePageTitle('收藏文章')

  return (
    <>
      <div>文章收藏</div>
    </>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import EcpayCheckout from '@/app/_components/ecpaycheckout'

export default function FlowPage(props) {
  return (
    <>
      <EcpayCheckout />
      <div>Flow Page</div>
    </>
  )
}

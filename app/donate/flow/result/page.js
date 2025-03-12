import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ClientReturn() {
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams) {
      setMessage('交易成功，謝謝您的購買！')
    }
  }, [searchParams])

  return (
    <div>
      <h1>{message}</h1>
    </div>
  )
}

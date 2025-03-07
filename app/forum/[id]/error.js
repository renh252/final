"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container py-5 text-center">
      <h1>Something went wrong!</h1>
      <p className="mb-4">{error?.message || "An unexpected error occurred"}</p>
      <button onClick={() => reset()} className="btn btn-primary me-3">
        Try again
      </button>
      <Link href="/forum/list" className="btn btn-outline-secondary">
        Return to forum
      </Link>
    </div>
  )
}


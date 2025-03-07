"use client"

import { useState } from "react"
import { Search } from "react-bootstrap-icons"

export default function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex justify-content-end">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="搜尋"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          <Search size={18} />
        </button>
      </div>
    </form>
  )
}


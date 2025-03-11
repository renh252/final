// FILEPATH: c:/Users/Martin/Desktop/final/app/forum/_components/SearchBox.js

"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap'
import { Search } from "react-bootstrap-icons"

const SearchBox = () => {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`)
    }
  }

  return (
    <Form onSubmit={handleSearch}>
      <InputGroup>
        <InputGroup.Text id="search-addon" className="bg-white border-right-0">
          <Search />
        </InputGroup.Text>
        <FormControl
          type="text"
          placeholder="搜尋文章..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="搜尋"
          aria-describedby="search-addon"
          className="border-left-0"
        />
        <Button variant="primary" type="submit">
          搜尋
        </Button>
      </InputGroup>
    </Form>
  )
}

export default SearchBox
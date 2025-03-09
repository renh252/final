// FILEPATH: c:/Users/Martin/Desktop/final/app/forum/_components/Navigation.js

"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Nav } from 'react-bootstrap'

const navItems = [
  { id: "popular", name: "熱門" },
  { id: "latest", name: "最新" },
  { id: "rules", name: "板規" },
]

export default function Navigation() {
  const [activeItem, setActiveItem] = useState("latest")
  const router = useRouter()

  const handleNavClick = (itemId) => {
    setActiveItem(itemId)
    router.push(`?view=${itemId}`)
  }

  return (
    <Nav className="mb-3">
      {navItems.map((item) => (
        <Nav.Item key={item.id}>
          <Nav.Link
            onClick={() => handleNavClick(item.id)}
            active={activeItem === item.id}
            className={`text-sm font-medium transition-colors ${
              activeItem === item.id ? "border-bottom border-primary" : ""
            }`}
          >
            {item.name}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  )
}
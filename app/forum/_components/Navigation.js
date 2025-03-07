"use client"

export default function Navigation({ activeItem, onNavChange }) {
  const navItems = [
    { id: "popular", name: "熱門" },
    { id: "latest", name: "最新" },
    { id: "rules", name: "板規" },
  ]

  return (
    <ul className="nav nav-pills">
      {navItems.map((item) => (
        <li className="nav-item" key={item.id}>
          <button className={`nav-link ${activeItem === item.id ? "active" : ""}`} onClick={() => onNavChange(item.id)}>
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  )
}


'use client'

import styles from './petFilterBar.module.css'

export default function PetFilterBar({
  searchTerm,
  setSearchTerm,
  selectedSpecies,
  setSelectedSpecies,
  selectedGender,
  setSelectedGender,
  pets,
}) {
  const uniqueLocations = Array.from(
    new Set(pets.map((pet) => pet.location).filter(Boolean))
  )
  return (
    <div className={styles.filterBar}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜尋名字"
        className={styles.input}
      />

      <select
        value={selectedSpecies}
        onChange={(e) => setSelectedSpecies(e.target.value)}
        className={styles.select}
      >
        <option value="">全部物種</option>
        <option value="狗">狗</option>
        <option value="貓">貓</option>
      </select>

      <select
        value={selectedGender}
        onChange={(e) => setSelectedGender(e.target.value)}
        className={styles.select}
      >
        <option value="">全部性別</option>
        <option value="公">男生</option>
        <option value="母">女生</option>
      </select>

    </div>
  )
}

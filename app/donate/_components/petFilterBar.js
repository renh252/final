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
        placeholder="搜尋毛寶名字"
        className={styles.input}
      />

      <select
        value={selectedSpecies}
        onChange={(e) => setSelectedSpecies(e.target.value)}
        className={styles.select}
      >
        <option value="">選擇物種</option>
        <option value="狗">狗</option>
        <option value="貓">貓</option>
      </select>

      <select
        value={selectedGender}
        onChange={(e) => setSelectedGender(e.target.value)}
        className={styles.select}
      >
        <option value="">選擇性別</option>
        <option value="公">公</option>
        <option value="母">母</option>
      </select>

    </div>
  )
}

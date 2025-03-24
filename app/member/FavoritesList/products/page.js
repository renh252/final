'use client'

import React, { useState, useEffect } from 'react'
import styles from './product_like.module.css'
import FilterGroup from '@/app/member/_components/sideFilter';


export default function ShopLikePage(props) {

  const [selectedFilters, setSelectedFilters] = useState({});

  const filters = [
    {
      title: "品種",
      name: "breed",
      options: ["貓", "狗", "兔子", "倉鼠"]
    },
    {
      title: "年齡",
      name: "age",
      options: ["幼年", "成年", "老年"]
    },
    {
      title: "性別",
      name: "gender",
      options: ["公", "母"]
    }
  ];

  const handleFilterChange = (filterName, option, isChecked) => {
    setSelectedFilters(prevFilters => {
      const updatedFilter = { ...prevFilters };
      
      if (!updatedFilter[filterName]) {
        updatedFilter[filterName] = [];
      }

      if (isChecked) {
        updatedFilter[filterName] = [...updatedFilter[filterName], option];
      } else {
        updatedFilter[filterName] = updatedFilter[filterName].filter(item => item !== option);
      }

      return updatedFilter;
    });
  };
  console.log(selectedFilters);
  

  return (
    <>
     <div className={styles.container}>
      <div className={styles.header}>商品收藏名單</div>
      <div className={styles.summary}>
        <p>
          符合條件：<strong>1</strong> 筆 ／ 總數：
          <strong>1</strong> 筆
        </p>
      </div>
      <div className={styles.row}>
        <div className={styles.list}>
        <FilterGroup filters={filters} onChange={handleFilterChange} />
        </div>
        <div className={styles.items}>商品</div>
      </div>
     </div>
    </>
  )
}

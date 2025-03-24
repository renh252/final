// FILEPATH: c:/iSpan/final/app/member/_components/sideFilter.js

// 引用方式
// import React, { useState } from 'react';
// import FilterGroup from '@/app/member/_components/sideFilter';

/* 設定狀態
  const [selectedFilters, setSelectedFilters] = useState({});

  // 自訂篩選條件
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
  ];

  // 處理篩選變化
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


  
*/

/* 使用元件
  <FilterGroup filters={filters} onChange={handleFilterChange} />
  <div>
    <h3>觀察已选择的过滤器：</h3>
    {Object.entries(selectedFilters).map(([filterName, options]) => (
      <div key={filterName}>
        <strong>{filterName}:</strong> {options.join(', ')}
      </div>
    ))}
  </div>
*/

import React from 'react';
import styles from './sideFilter.module.css';

const FilterGroup = ({ filters, onChange }) => {
  return (
    <div className={styles.sideFilter}>
      {filters.map((filter, index) => (
        <React.Fragment key={index}>
          <fieldset className="filter-group">
            <legend className="list-title">{filter.title}</legend>
            {filter.options.map((option) => (
              <label key={option}>
                <input 
                  name={filter.name} 
                  type="checkbox" 
                  value={option} 
                  onChange={(e) => onChange(filter.name, option, e.target.checked)}
                /> 
                {option}
              </label>
            ))}
          </fieldset>
          {index < filters.length - 1 && <hr className={styles.divider} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FilterGroup;
'use client'

import L from 'leaflet'

// 使用 SVG 創建自定義圖標
const createCustomIcon = (color = '#0d6efd', size = 25) => {
  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
        <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
      </svg>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        filter: blur(2px);
      "></div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

// 寵物標記圖標 - 使用愛心形狀，改為藍色
const petIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="#3498db">

      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    <div style="
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      filter: blur(2px);
    "></div>
  `,
  className: 'custom-div-icon',
  iconSize: [25, 25],
  iconAnchor: [12.5, 25],
  popupAnchor: [0, -25],
})

// 預設圖標
const defaultIcon = createCustomIcon()

// 選定位置圖標 - 保持紅色
const selectedIcon = createCustomIcon('#dc3545', 30)

// 商店圖標 - 紫色
const storeIcon = createCustomIcon('#8e44ad', 30)

// 用戶位置圖標 - 藍色，帶有脈衝效果
const userLocationIcon = L.divIcon({
  html: `
    <div class="user-location-marker">
      <div class="user-location-dot"></div>
      <div class="user-location-pulse"></div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})


export { defaultIcon, selectedIcon, storeIcon, userLocationIcon, petIcon }

export const legendConfig = [
  {
    name: '用戶位置',
    icon: userLocationIcon,
    className: 'user-location-legend',
  },
  {
    name: '選中位置',
    icon: selectedIcon,
    className: 'selected-location-legend',
  },
  {
    name: '寵物',
    icon: petIcon,
    className: 'pet-legend',
  },
  {
    name: '店家',
    icon: storeIcon,
    className: 'store-legend',
  },
]

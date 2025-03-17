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

// 預設圖標
const defaultIcon = createCustomIcon()

// 地區圖標 - 藍色
const regionIcon = createCustomIcon('#0d6efd', 30)

// 選定位置圖標 - 紅色
const selectedIcon = createCustomIcon('#dc3545', 30)

// 商店圖標 - 紫色
const storeIcon = createCustomIcon('#8e44ad', 30)

// 用戶位置圖標 - 綠色，帶有脈衝效果
const userLocationIcon = L.divIcon({
  html: `
    <div class="user-location-marker">
      <div class="user-location-dot"></div>
      <div class="user-location-pulse"></div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

export { defaultIcon, regionIcon, selectedIcon, storeIcon, userLocationIcon }

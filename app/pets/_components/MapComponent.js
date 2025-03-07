'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { defaultIcon, regionIcon, selectedIcon } from './CustomMarker'

// 地圖中心點更新組件
function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

// 地圖點擊事件處理組件
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect({ lat, lng })
    },
  })
  return null
}

// 自動打開彈出窗口的標記組件
const MarkerWithOpenPopup = ({ position, icon, children }) => {
  const markerRef = useRef(null)

  useEffect(() => {
    if (markerRef.current) {
      // 使用 setTimeout 確保在渲染完成後打開彈出窗口
      setTimeout(() => {
        markerRef.current.openPopup()
      }, 100)
    }
  }, [position]) // 當位置變化時重新打開彈出窗口

  return (
    <Marker position={position} icon={icon} ref={markerRef}>
      {children}
    </Marker>
  )
}

export default function MapComponent({
  center = [25.033, 121.5654], // 預設為台北市中心
  zoom = 13,
  markers = [],
  onLocationSelect = () => {},
  regionName = null,
}) {
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)

  // 確保客戶端渲染
  useEffect(() => {
    setMapReady(true)
  }, [])

  // 添加自定義樣式
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 添加自定義樣式到 head
      const style = document.createElement('style')
      style.innerHTML = `
        .custom-div-icon {
          background: none;
          border: none;
        }
        
        /* 確保所有地圖文字為黑色 */
        .leaflet-container,
        .leaflet-control,
        .leaflet-control a,
        .leaflet-popup-content-wrapper,
        .leaflet-popup-content {
          color: #000000 !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  if (!mapReady) {
    return <div>地圖載入中...</div>
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <TileLayer
          attribution='<span style="color: #000000">&copy; <a style="color: #000000" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</span>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, idx) => {
          // 根據標記類型選擇圖標
          let markerIcon = defaultIcon
          if (marker.isSelected) {
            markerIcon = selectedIcon
          } else if (marker.isRegion) {
            markerIcon = regionIcon
          }

          // 使用標記的 id 作為 key，如果沒有 id 則使用索引
          const key = marker.id || idx

          return (
            <MarkerWithOpenPopup
              key={key}
              position={[marker.lat, marker.lng]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ color: '#000000' }}>
                  {marker.name || (regionName ? regionName : '選定位置')}
                  <br />
                  {marker.description ||
                    `座標: ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`}
                </div>
              </Popup>
            </MarkerWithOpenPopup>
          )
        })}
      </MapContainer>

      {/* 地圖圖例 */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'white',
          padding: '8px',
          borderRadius: '5px',
          fontSize: '12px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          color: '#000000',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="#0d6efd"
          >
            <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
          </svg>
          <span style={{ marginLeft: '5px', color: '#000000' }}>地區位置</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="#dc3545"
          >
            <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
          </svg>
          <span style={{ marginLeft: '5px', color: '#000000' }}>選定位置</span>
        </div>
      </div>

      {/* 操作提示 */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'white',
          padding: '5px',
          borderRadius: '5px',
          fontSize: '12px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          color: '#000000',
        }}
      >
        {regionName ? `目前顯示: ${regionName}` : '點擊地圖選擇位置'}
      </div>
    </>
  )
}

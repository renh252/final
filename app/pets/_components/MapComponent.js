'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
  Polyline,
  Tooltip,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  defaultIcon,
  regionIcon,
  selectedIcon,
  storeIcon,
  userLocationIcon,
  petIcon,
} from './CustomMarker'
import styles from './MapComponent.module.css'

// 地圖中心點更新組件
function ChangeView({ center, zoom }) {
  const map = useMap()
  const prevCenter = useRef(center)
  const prevZoom = useRef(zoom)

  useEffect(() => {
    // 檢查中心點或縮放等級是否真的改變了
    const centerChanged =
      Math.abs(prevCenter.current[0] - center[0]) > 0.0001 ||
      Math.abs(prevCenter.current[1] - center[1]) > 0.0001

    const zoomChanged = prevZoom.current !== zoom

    if (centerChanged || zoomChanged) {
      // 更新參考值
      prevCenter.current = center
      prevZoom.current = zoom

      // 使用延遲確保地圖有足夠時間準備好
      const updateTimer = setTimeout(() => {
        if (map) {
          // 如果只是縮放變化，使用單獨的 setZoom
          if (!centerChanged && zoomChanged) {
            map.setZoom(zoom, {
              animate: true,
              duration: 0.5,
            })
          }
          // 如果中心點變化，同時設置中心和縮放
          else {
            map.setView(center, zoom, {
              animate: true,
              duration: 0.5,
            })
          }
        }
      }, 150)

      return () => clearTimeout(updateTimer)
    }
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
  const [isMarkerReady, setIsMarkerReady] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(position)

  // 當收到新位置時更新內部狀態
  useEffect(() => {
    setCurrentPosition(position)
  }, [position[0], position[1]]) // 只有當實際座標變化時才更新

  // 處理位置更新
  useEffect(() => {
    if (markerRef.current && markerRef.current._latlng) {
      // 如果標記已存在並且位置不同，更新位置
      const currentLat = markerRef.current._latlng.lat
      const currentLng = markerRef.current._latlng.lng

      if (
        Math.abs(currentLat - currentPosition[0]) > 0.0000001 ||
        Math.abs(currentLng - currentPosition[1]) > 0.0000001
      ) {
        // 使用短延遲確保更新穩定
        setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.setLatLng(currentPosition)
          }
        }, 50)
      }
    }
  }, [currentPosition])

  // 追蹤標記就緒狀態
  useEffect(() => {
    const checkMarkerReady = () => {
      if (
        markerRef.current &&
        typeof markerRef.current.openPopup === 'function'
      ) {
        setIsMarkerReady(true)
      } else {
        // 如果標記尚未準備好，繼續檢查
        setTimeout(checkMarkerReady, 100)
      }
    }

    checkMarkerReady()

    return () => {
      setIsMarkerReady(false)
    }
  }, [currentPosition]) // 當位置改變時，重新檢查標記就緒狀態

  // 僅在標記準備就緒時才嘗試打開彈出窗口
  useEffect(() => {
    if (isMarkerReady && markerRef.current) {
      try {
        // 增加延遲，確保 Leaflet 完全初始化
        const popupTimer = setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.openPopup()
          }
        }, 350) // 增加延遲時間

        return () => {
          clearTimeout(popupTimer) // 清除定時器
        }
      } catch (error) {
        console.warn('無法打開彈出窗口:', error)
      }
    }
  }, [isMarkerReady])

  return (
    <Marker position={currentPosition} icon={icon} ref={markerRef}>
      {children}
    </Marker>
  )
}

// 計算兩點之間的距離（使用 Haversine 公式）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // 地球半徑（公里）
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance.toFixed(2)
}

export default function MapComponent({
  center = [25.033, 121.5654], // 預設為台北市中心
  zoom = 13,
  markers = [],
  onLocationSelect = () => {},
  regionName = null,
  showLegend = true,
  searchRadius = 20, // 新增：搜尋範圍參數，預設 20 公里
  userLocation = null, // 新增：用戶位置參數
  selectedStoreLocation = null, // 新增：選中的店家位置，用於繪製直線
  pets = [], // 新增：寵物資料陣列
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
        
        .custom-distance-tooltip .leaflet-tooltip-content {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          font-weight: bold;
          color: #dc3545;
          border: 1px solid #dc3545;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .custom-radius-tooltip .leaflet-tooltip-content {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          font-weight: bold;
          color: #2d8a30;
          border: 1px solid #2d8a30;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .custom-distance-tooltip:before,
        .custom-radius-tooltip:before {
          display: none;
        }
        
        /* 用戶位置標記樣式 */
        .user-location-marker {
          width: 16px;
          height: 16px;
          background-color: rgba(33, 150, 243, 0.8);
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .user-location-dot {
          width: 8px;
          height: 8px;
          background-color: #2196f3;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
          position: relative;
          z-index: 2;
        }
        
        .user-location-pulse {
          position: absolute;
          top: -2px;
          left: -2px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(33, 150, 243, 1);
          animation: locationPulse 1.5s infinite;
          z-index: -1;
        }
        
        @keyframes locationPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0.3;
          }
        }
        
        /* 移除強制黑色文字顏色，使用 Bootstrap 的自適應顏色 */
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 添加搜尋範圍圓圈 */}
        {userLocation && searchRadius > 0 && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={searchRadius * 1000} // 轉換公里為米
              pathOptions={{
                color: '#2d8a30',
                fillColor: '#2d8a30',
                fillOpacity: 0.15,
                weight: 3,
                dashArray: '5, 5',
                lineCap: 'round',
              }}
            >
              <Tooltip
                permanent
                direction="center"
                className="custom-radius-tooltip"
                offset={[0, (-searchRadius * 1000) / 2]} // 將提示放在圓的上半部
              >
                搜尋範圍: {searchRadius} 公里
              </Tooltip>
            </Circle>
          </>
        )}

        {/* 添加用戶到選中店家的直線 */}
        {userLocation && selectedStoreLocation && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedStoreLocation.lat, selectedStoreLocation.lng],
            ]}
            pathOptions={{
              color: '#dc3545',
              weight: 4,
              opacity: 0.9,
              dashArray: '10, 10',
            }}
          >
            <Tooltip
              permanent
              direction="center"
              className="custom-distance-tooltip"
              offset={[0, 0]}
            >
              距離:{' '}
              {calculateDistance(
                userLocation.lat,
                userLocation.lng,
                selectedStoreLocation.lat,
                selectedStoreLocation.lng
              )}{' '}
              公里
            </Tooltip>
          </Polyline>
        )}

        {/* 顯示寵物標記 */}
        {pets &&
          pets.length > 0 &&
          pets.map((pet) => {
            // 檢查座標是否為有效數字
            const lat = parseFloat(pet.offsetLat)
            const lng = parseFloat(pet.offsetLng)

            if (isNaN(lat) || isNaN(lng)) {
              console.log('Invalid coordinates for pet:', pet.id, pet.name)
              return null
            }

            return (
              <Marker
                key={`pet-${pet.id}`}
                position={[lat, lng]}
                icon={petIcon}
              >
                <Popup>
                  <div className={styles.petPopup}>
                    <h3>{pet.name}</h3>
                    <p>
                      {pet.species} - {pet.variety || '未知品種'}
                    </p>
                    <p>收容所：{pet.store?.name || '未知'}</p>
                    <a href={`/pets/${pet.id}`} className={styles.detailLink}>
                      查看詳情
                    </a>
                  </div>
                </Popup>
              </Marker>
            )
          })}

        {markers.map((marker, idx) => {
          // 根據標記類型選擇圖標
          let markerIcon = defaultIcon
          if (marker.isUserLocation) {
            markerIcon = userLocationIcon
          } else if (marker.isSelected) {
            markerIcon = selectedIcon
          } else if (marker.isRegion) {
            markerIcon = regionIcon
          } else if (marker.isStore) {
            // 所有商店使用相同圖標，不再使用突出顯示圖標
            markerIcon = storeIcon
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
                {marker.isStore ? (
                  <div className="store-popup">
                    <h5
                      style={{
                        margin: '0 0 8px 0',
                        color: '#8e44ad',
                        fontWeight: 'bold',
                      }}
                    >
                      {marker.name}
                    </h5>
                    {marker.description && (
                      <div>
                        <div
                          style={{ fontSize: '0.9rem', marginBottom: '5px' }}
                        >
                          {marker.description.includes('距離') ? (
                            <>
                              <p style={{ margin: '0 0 5px 0' }}>
                                {marker.description.split('-')[0].trim()}
                              </p>
                              <p
                                style={{
                                  margin: '0',
                                  color: '#dc3545',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                }}
                              >
                                {marker.description.split('-')[1].trim()}
                              </p>
                            </>
                          ) : (
                            <p style={{ margin: '0' }}>{marker.description}</p>
                          )}
                        </div>
                        {marker.distance && (
                          <div
                            style={{
                              marginTop: '5px',
                              padding: '5px',
                              background: '#f5f5f5',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.9rem',
                            }}
                          >
                            <span
                              style={{ fontWeight: 'bold', marginRight: '5px' }}
                            >
                              距離：
                            </span>
                            <span
                              style={{ color: '#dc3545', fontWeight: 'bold' }}
                            >
                              {marker.distance.toFixed(2)} 公里
                            </span>
                          </div>
                        )}
                        {userLocation && (
                          <div
                            style={{
                              marginTop: '10px',
                              fontSize: '0.85rem',
                              color: '#666',
                              fontStyle: 'italic',
                            }}
                          >
                            點擊店家在地圖上顯示直線距離
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {marker.name || (regionName ? regionName : '選定位置')}
                    <br />
                    {marker.description ||
                      `座標: ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(
                        4
                      )}`}
                  </div>
                )}
              </Popup>
            </MarkerWithOpenPopup>
          )
        })}
      </MapContainer>

      {/* 地圖圖例 - 只在 showLegend 為 true 時顯示 */}
      {showLegend && (
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
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px',
            }}
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
            <span style={{ marginLeft: '5px' }}>地區位置</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="#8e44ad"
            >
              <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
            </svg>
            <span style={{ marginLeft: '5px' }}>商店位置</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="#dc3545"
            >
              <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
            </svg>
            <span style={{ marginLeft: '5px' }}>選定位置</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#2196f3',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(33, 150, 243, 0.3)',
                  animation: 'ripple 2s infinite ease-in-out',
                }}
              />
            </div>
            <span style={{ marginLeft: '5px' }}>您的位置</span>
          </div>
        </div>
      )}

      {/* 操作提示 - 只在 showLegend 為 true 時顯示 */}
      {showLegend && (
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
          }}
        >
          {regionName ? `目前顯示: ${regionName}` : '點擊地圖選擇位置'}
        </div>
      )}
    </>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Form } from 'react-bootstrap'
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaSearch,
} from 'react-icons/fa'
import styles from '../pets.module.css'

export default function MapDrawer({
  children,
  viewMode,
  onViewModeChange,
  searchRadius,
  onRadiusChange,
  selectedLocation,
  onClearLocation,
  nearbyStores,
  onNearbyStoreClick,
  getUserLocation,
  isGettingLocation,
  locationError,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 確保只在客戶端渲染
  useEffect(() => {
    setMounted(true)

    // 從 localStorage 讀取狀態
    const savedState = localStorage.getItem('mapDrawerState')
    if (savedState) {
      setIsOpen(savedState === 'open')
    }
  }, [])

  // 保存抽屜開關狀態
  const toggleDrawer = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem('mapDrawerState', newState ? 'open' : 'closed')
  }

  // 更新地圖容器類名
  useEffect(() => {
    const mapContainer = document.querySelector(`.${styles.fullMapContainer}`)
    if (mapContainer) {
      if (isOpen) {
        mapContainer.classList.add(styles.shifted)
      } else {
        mapContainer.classList.remove(styles.shifted)
      }

      // 通知地圖組件大小已變更，需要重新調整
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 300)
    }
  }, [isOpen])

  // 只在客戶端渲染時才使用 Portal
  if (!mounted) return null

  return ReactDOM.createPortal(
    <>
      {/* 左側抽屜 */}
      <div className={`${styles.leftSideDrawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderContent}>
            <h4>搜尋與篩選</h4>
            <Form.Check
              type="switch"
              id="drawer-view-mode-switch"
              label={viewMode === 'map' ? '地圖檢視' : '列表檢視'}
              checked={viewMode === 'map'}
              onChange={onViewModeChange}
              className={styles.viewModeSwitch}
            />
          </div>
        </div>
        <div className={styles.drawerContent}>
          {/* 位置與搜尋範圍 */}
          <div className={styles.drawerSection}>
            <h5 className={styles.sectionTitle}>
              <FaMapMarkerAlt /> 位置與搜尋範圍
            </h5>

            <Form.Group className="mb-3">
              <button
                className={styles.locationButton}
                onClick={getUserLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? '獲取位置中...' : '使用我的位置'}
              </button>
              {locationError && (
                <div className={styles.locationError}>{locationError}</div>
              )}

              {/* 搜尋範圍設定 */}
              {selectedLocation && (
                <div className={styles.radiusSelector}>
                  <Form.Label>搜尋範圍：{searchRadius} 公里</Form.Label>
                  <Form.Range
                    min={1}
                    max={100}
                    step={1}
                    value={searchRadius}
                    onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                  />
                </div>
              )}
            </Form.Group>

            {selectedLocation && (
              <div className={styles.selectedLocation}>
                <span>已選擇位置：</span>
                <span className="mx-2">
                  緯度 {selectedLocation.lat.toFixed(4)}
                </span>
                <span className="mx-2">
                  經度 {selectedLocation.lng.toFixed(4)}
                </span>
                <button
                  className="mx-2 btn btn-outline-secondary btn-sm"
                  onClick={onClearLocation}
                >
                  清除位置
                </button>
              </div>
            )}
          </div>

          {/* 附近商店列表區塊 */}
          <div className={styles.drawerSection}>
            <h5 className={styles.sectionTitle}>
              <FaSearch /> 附近寵物商店
            </h5>

            {selectedLocation ? (
              <div className={styles.nearbyStores}>
                <h5>附近寵物商店 (搜尋範圍：{searchRadius}公里)</h5>
                {searchRadius < 1 ? (
                  <div className={styles.noStores}>
                    <p>搜尋範圍太小</p>
                    <p>請設定較大的搜尋範圍以查看附近商店</p>
                  </div>
                ) : nearbyStores.length > 0 ? (
                  <div className={styles.storeList}>
                    {nearbyStores.map((store) => (
                      <div key={store.id} className={styles.storeItem}>
                        <button
                          className={styles.storeButton}
                          onClick={() => onNearbyStoreClick(store)}
                          aria-label={`前往 ${
                            store.name
                          }，距離 ${store.distance.toFixed(2)} 公里`}
                        >
                          <span className={styles.storeName}>{store.name}</span>
                          <span className={styles.storeDistance}>
                            {store.distance.toFixed(2)} 公里
                          </span>
                          <p className={styles.storeAddress}>{store.address}</p>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noStores}>
                    <p>在{searchRadius}公里範圍內未找到寵物商店</p>
                    <p>我們的資料庫中可能沒有此區域的商店資訊</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.mapInfoPlaceholder}>
                <p>點擊「使用我的位置」按鈕獲取附近商店</p>
                <p>或在大地圖上點擊選擇位置</p>
              </div>
            )}
          </div>

          {/* 進階篩選內容 */}
          {children}
        </div>
      </div>

      {/* 收合按鈕 - 獨立定位，不再是抽屜的子元素 */}
      <div className={styles.drawerToggleContainer}>
        <button
          className={styles.drawerToggleFixed}
          onClick={toggleDrawer}
          aria-label={isOpen ? '收起面板' : '展開面板'}
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
    </>,
    document.body
  )
}

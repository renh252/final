'use client'

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import styles from './pets.module.css'
import Card from '@/app/_components/ui/Card'
import Link from 'next/link'
import { Breadcrumbs } from '../_components/breadcrumbs'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import useSWR from 'swr'
import {
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
} from 'react-bootstrap'
import dynamic from 'next/dynamic'
import locationData from './_components/locationData'
import {
  FaHeart,
  FaSearch,
  FaPaw,
  FaArrowRight,
  FaRegHeart,
  FaMapMarkerAlt,
} from 'react-icons/fa'

const fetcher = (url) => fetch(url).then((res) => res.json())

// 動態導入 MapComponent，避免 SSR 問題
const MapComponent = dynamic(
  () => import('@/app/pets/_components/MapComponent'),
  { ssr: false }
)

// 計算兩點之間的距離（使用 Haversine 公式）- 移到組件外部
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
  return R * c
}

// 計算適合同時顯示用戶位置和店家位置的最佳縮放等級 - 移到組件外部
const calculateOptimalZoom = (point1, point2) => {
  if (!point1 || !point2) return 15 // 預設值

  // 計算兩點的距離 (公里)
  const distance = calculateDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  )

  // 根據距離決定縮放等級
  if (distance < 0.5) return 16 // 500米以內
  if (distance < 1) return 15 // 1公里以內
  if (distance < 3) return 14 // 3公里以內
  if (distance < 7) return 13 // 7公里以內
  if (distance < 15) return 12 // 15公里以內
  if (distance < 30) return 11 // 30公里以內
  if (distance < 70) return 10 // 70公里以內
  return 9 // 更大距離
}

// 計算地圖的中心點 - 移到組件外部
const calculateMapCenter = (point1, point2) => {
  if (!point1 || !point2) {
    return point1
      ? [point1.lat, point1.lng]
      : point2
      ? [point2.lat, point2.lng]
      : [25.033, 121.5654] // 預設台北市中心
  }

  // 計算兩點的中心
  return [(point1.lat + point2.lat) / 2, (point1.lng + point2.lng) / 2]
}

// 附近商店列表組件
const NearbyStoresList = ({ stores, searchRadius, handleNearbyStoreClick }) => (
  <div className={styles.nearbyStores}>
    <h5>附近寵物商店 (搜尋範圍：{searchRadius}公里)</h5>
    {searchRadius < 1 ? (
      <div className={styles.noStores}>
        <p>搜尋範圍太小</p>
        <p>請設定較大的搜尋範圍以查看附近商店</p>
      </div>
    ) : stores.length > 0 ? (
      <ul>
        {stores.map((store) => (
          <li key={store.id} className={styles.storeItem}>
            <button
              className={styles.storeButton}
              onClick={() => handleNearbyStoreClick(store)}
              aria-label={`前往 ${store.name}，距離 ${store.distance.toFixed(
                2
              )} 公里`}
            >
              <span className={styles.storeName}>{store.name}</span>
              <span className={styles.storeDistance}>
                {store.distance.toFixed(2)} 公里
              </span>
              <p className={styles.storeAddress}>{store.address}</p>
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <div className={styles.noStores}>
        <p>在{searchRadius}公里範圍內未找到寵物商店</p>
        <p>我們的資料庫中可能沒有此區域的商店資訊</p>
      </div>
    )}
  </div>
)

// 可搜尋的下拉選單組件
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const selectRef = useRef(null)

  // 過濾選項
  const filteredOptions =
    options?.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 選擇選項
  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  // 鍵盤事件處理 - keyDown
  const handleKeyDown = (e) => {
    // 阻止所有可能觸發下拉選單的按鍵
    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === ' ' ||
      e.key === 'Enter'
    ) {
      e.preventDefault()
    }
  }

  // 鍵盤事件處理 - keyUp
  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!disabled) {
        setIsOpen(!isOpen)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 選項的鍵盤事件處理
  const handleOptionKeyDown = (e, option = '') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(option)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 防止預設下拉選單行為
  const handleSelectClick = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsOpen(!isOpen)

      // 阻止原生下拉選單打開
      if (selectRef.current) {
        selectRef.current.blur()
      }
    }
  }

  // 防止預設下拉選單行為 - 焦點事件
  const handleFocus = () => {
    // 立即取消焦點，防止預設選單顯示
    if (selectRef.current) {
      setTimeout(() => {
        selectRef.current.blur()
      }, 0)
    }
  }

  return (
    <div className={styles.searchableSelect} ref={dropdownRef}>
      <div className={styles.customSelect}>
        <Form.Select
          ref={selectRef}
          value={value || ''}
          onChange={() => {}} // 實際選擇由下拉選單處理
          onClick={handleSelectClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <option value="">{value || placeholder}</option>
        </Form.Select>
      </div>

      {isOpen && !disabled && (
        <div className={styles.bootstrapDropdown} role="listbox">
          <InputGroup className="mb-2">
            <FormControl
              placeholder="搜尋品種..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              ref={(input) => input && setTimeout(() => input.focus(), 100)}
              className={styles.searchInput}
            />
          </InputGroup>

          <div className={styles.optionsList}>
            {value && (
              <div
                className={`${styles.option} ${styles.clearOption}`}
                onClick={() => handleSelect('')}
                onKeyDown={(e) => handleOptionKeyDown(e, '')}
                role="option"
                aria-selected={value === ''}
                tabIndex={0}
              >
                清除選擇
              </div>
            )}
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className={`${styles.option} ${
                  value === option ? styles.selected : ''
                }`}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                role="option"
                aria-selected={value === option}
                tabIndex={0}
              >
                {option}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className={styles.noResults}>沒有符合的結果</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PetsPage() {
  const latestRef = useRef(null)
  const popularRef = useRef(null)
  const fullMapRef = useRef(null)

  // 狀態管理
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [mapMarkers, setMapMarkers] = useState([])
  const [mapCenter, setMapCenter] = useState([22.9997, 120.227])
  const [mapZoom, setMapZoom] = useState(13)
  const [viewMode, setViewMode] = useState('list')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [nearbyStores, setNearbyStores] = useState([])
  const [searchRadius, setSearchRadius] = useState(2)
  const [selectedStoreLocation, setSelectedStoreLocation] = useState(null)
  const [favorites, setFavorites] = useState({})
  const [showFavorites, setShowFavorites] = useState(false)
  // 新增分頁控制狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // 每頁顯示的寵物數量改為10筆

  // 優化API調用: 合併基礎資料請求
  const { data: metaData } = useSWR('/api/pets?type=meta', fetcher)

  // 從metaData中獲取數據
  const speciesData = useMemo(() => {
    return metaData?.species || null
  }, [metaData])

  const varietiesData = useMemo(() => {
    if (!metaData?.varieties) return null

    // 如果選擇了特定物種，則過濾品種
    if (selectedSpecies === '1') {
      return metaData.varieties.filter((variety) => {
        // 根據狗的品種過濾邏輯，可能需要調整
        return true
      })
    } else if (selectedSpecies === '2') {
      return metaData.varieties.filter((variety) => {
        // 根據貓的品種過濾邏輯，可能需要調整
        return true
      })
    }
    return metaData.varieties
  }, [metaData, selectedSpecies])

  const storesData = useMemo(() => {
    if (!metaData?.stores) return null
    return {
      stores: metaData.stores,
      storesByRegion: metaData.storesByRegion,
    }
  }, [metaData])

  // 從metaData中獲取最新寵物資料
  const latestPets = useMemo(() => {
    if (!metaData?.latestPets || !Array.isArray(metaData.latestPets)) return []
    return metaData.latestPets
  }, [metaData])

  // 使用服務器端分頁獲取寵物資料
  const {
    data: petsData,
    error: petsError,
    mutate: mutatePets,
  } = useSWR(() => {
    const params = new URLSearchParams()
    params.set('type', 'pets')
    if (selectedSpecies) params.set('species_id', selectedSpecies)
    if (selectedBreed) params.set('breed', selectedBreed)
    if (selectedRegion) params.set('region', selectedRegion)
    if (selectedStore) params.set('store', selectedStore)
    params.set('page', currentPage.toString())
    params.set('pageSize', itemsPerPage.toString())
    params.set('userId', '1') // 暫時hardcode userId=1
    return `/api/pets?${params.toString()}`
  }, fetcher)

  // 使用useMemo處理收藏狀態
  useEffect(() => {
    if (petsData?.pets) {
      const favoritesMap = {}
      petsData.pets.forEach((pet) => {
        if (pet.isFavorite) {
          favoritesMap[pet.id] = true
        }
      })
      setFavorites(favoritesMap)
    }
  }, [petsData])

  // 處理篩選結果的寵物
  const filteredPets = useMemo(() => {
    if (!petsData?.pets || !Array.isArray(petsData.pets)) return []

    // 如果顯示收藏，需要額外篩選
    if (showFavorites) {
      return petsData.pets.filter((pet) => pet.isFavorite)
    }

    return petsData.pets
  }, [petsData, showFavorites])

  // 使用伺服器返回的分頁資訊
  const totalPages = useMemo(() => {
    return petsData?.pagination?.totalPages || 1
  }, [petsData])

  // 使用useCallback記憶化函數
  // 尋找附近商店
  const findNearbyStores = useCallback(
    (latitude, longitude) => {
      if (!storesData?.stores || storesData.stores.length === 0) {
        return []
      }

      if (searchRadius < 1) {
        return [] // 當搜尋範圍小於1公里時，返回空列表
      }

      // 計算所有商店的距離
      const storesWithDistance = storesData.stores
        .filter((store) => store.lat && store.lng) // 確保商店有坐標
        .map((store) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            store.lat,
            store.lng
          )
          return { ...store, distance }
        })

      // 按距離排序並根據搜尋範圍篩選
      return storesWithDistance
        .sort((a, b) => a.distance - b.distance)
        .filter((store) => store.distance <= searchRadius)
        .slice(0, 10) // 最多顯示10個最近的商店
    },
    [storesData, searchRadius]
  )

  // 獲取用戶位置
  const getUserLocation = useCallback(() => {
    // 重置錯誤狀態
    setLocationError(null)
    setNearbyStores([]) // 重置附近商店
    setIsGettingLocation(true)

    // 檢查瀏覽器是否支持地理位置 API
    if (!navigator.geolocation) {
      setLocationError('您的瀏覽器不支持地理位置功能')
      setIsGettingLocation(false)
      return
    }

    // 獲取用戶位置
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 成功獲取位置
        const { latitude, longitude } = position.coords

        // 清除商店和地區選擇
        setSelectedRegion('')
        setSelectedStore('')

        // 設置用戶位置
        const userLocation = { lat: latitude, lng: longitude }
        setSelectedLocation(userLocation)

        // 查找附近商店但不直接顯示標記
        const nearby = findNearbyStores(latitude, longitude)
        setNearbyStores(nearby)

        // 切換到地圖視圖模式
        setViewMode('map')

        // 延遲更新地圖相關狀態
        setTimeout(() => {
          const markersArray = [
            {
              lat: latitude,
              lng: longitude,
              name: '您的位置',
              isSelected: true,
              id: 'user-location',
              isUserLocation: true,
            },
          ]

          setMapCenter([latitude, longitude])
          setMapZoom(15)
          setMapMarkers(markersArray)
          setIsGettingLocation(false)
        }, 200)
      },
      (error) => {
        // 處理錯誤
        let errorMessage = '無法獲取您的位置'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒絕了位置請求，請在瀏覽器設置中允許位置訪問'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '獲取位置超時'
            break
        }
        setLocationError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [
    findNearbyStores,
    setLocationError,
    setNearbyStores,
    setIsGettingLocation,
    setSelectedRegion,
    setSelectedStore,
    setSelectedLocation,
    setViewMode,
    setMapCenter,
    setMapZoom,
    setMapMarkers,
  ])

  // 處理收藏功能
  const handleToggleFavorite = useCallback(
    async (event, petId) => {
      event.preventDefault()
      event.stopPropagation()

      const userId = 1 // 暫時hardcode userId=1
      const newFavoriteStatus = !favorites[petId]

      try {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            petId,
            action: newFavoriteStatus ? 'add' : 'remove',
          }),
        })

        if (response.ok) {
          setFavorites((prev) => ({
            ...prev,
            [petId]: newFavoriteStatus,
          }))
          // 重新獲取寵物列表以更新收藏狀態
          mutatePets()
        } else {
          console.error('收藏操作失敗')
        }
      } catch (error) {
        console.error('收藏操作錯誤:', error)
      }
    },
    [favorites, mutatePets]
  )

  // 處理地區選擇
  const handleRegionChange = useCallback(
    (e) => {
      const region = e.target.value
      setSelectedRegion(region)
      // 清除商店選擇
      setSelectedStore('')
      // 重新刷新寵物資料以應用篩選
      mutatePets()

      if (region && locationData[region]) {
        const { lat, lng, zoom } = locationData[region]
        setMapCenter([lat, lng])
        setMapZoom(zoom)
        // 添加一個唯一的 id，確保標記更新時彈出窗口會重新打開
        setMapMarkers([
          { lat, lng, name: region, isRegion: true, id: Date.now() },
        ])
        // 清除手動選擇的位置
        setSelectedLocation(null)
      } else {
        // 如果選擇了「請選擇地區」，清除標記
        setMapMarkers([])
      }
    },
    [
      mutatePets,
      setSelectedRegion,
      setSelectedStore,
      setMapCenter,
      setMapZoom,
      setMapMarkers,
      setSelectedLocation,
    ]
  )

  // 處理商店選擇
  const handleStoreChange = useCallback(
    (e) => {
      const storeId = e.target.value
      setSelectedStore(storeId)
      setSelectedRegion('')
      // 重新刷新寵物資料以應用篩選
      mutatePets()

      if (storeId && storesData?.stores) {
        const store = storesData.stores.find(
          (store) => store.id.toString() === storeId
        )

        if (store && store.lat && store.lng) {
          setMapCenter([parseFloat(store.lat), parseFloat(store.lng)])
          setMapZoom(15)
          setMapMarkers([
            {
              lat: parseFloat(store.lat),
              lng: parseFloat(store.lng),
              name: store.name,
              description: `${store.address} (${store.phone})`,
              isStore: true,
              id: Date.now(),
            },
          ])
          setSelectedLocation(null)
        } else {
          // 如果商店沒有有效的坐標，使用預設值
          setMapCenter([25.033, 121.5654])
          setMapZoom(13)
          setMapMarkers([])
        }
      } else {
        // 重置地圖狀態
        setMapMarkers([])
        setMapCenter([25.033, 121.5654])
        setMapZoom(13)
      }
    },
    [
      storesData,
      mutatePets,
      setSelectedStore,
      setSelectedRegion,
      setMapCenter,
      setMapZoom,
      setMapMarkers,
      setSelectedLocation,
    ]
  )

  // 修改視圖切換邏輯
  const handleViewModeChange = useCallback(() => {
    const newViewMode = viewMode === 'map' ? 'list' : 'map'

    // 確保切換回列表視圖時重置地圖狀態
    if (newViewMode === 'list') {
      // 保存當前位置信息但重置地圖狀態
      const currentLocation = selectedLocation
      const currentStore = selectedStoreLocation

      setMapMarkers([])
      setMapCenter([25.033, 121.5654]) // 預設台北市中心
      setMapZoom(13)

      // 延遲後恢復標記，確保地圖元件已經重新渲染
      setTimeout(() => {
        if (currentLocation) {
          const markers = [
            {
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              name: '您的位置',
              isSelected: true,
              id: 'user-location',
              isUserLocation: true,
            },
          ]

          if (currentStore) {
            markers.push({
              lat: currentStore.lat,
              lng: currentStore.lng,
              name: currentStore.name,
              isStore: true,
              id: `store-${Date.now()}`,
            })
          }

          setMapMarkers(markers)
        } else if (selectedRegion && locationData[selectedRegion]) {
          const { lat, lng } = locationData[selectedRegion]
          setMapMarkers([
            {
              lat,
              lng,
              name: selectedRegion,
              isRegion: true,
              id: Date.now(),
            },
          ])
        }
      }, 100)
    }

    setViewMode(newViewMode)
  }, [
    viewMode,
    selectedLocation,
    selectedStoreLocation,
    selectedRegion,
    setViewMode,
    setMapMarkers,
    setMapCenter,
    setMapZoom,
  ])

  // 滾動功能
  const scroll = useCallback((direction, ref) => {
    const container = ref.current
    const cardWidth = 280 // 卡片寬度
    const gap = 30 // gap 值轉換為像素
    const scrollAmount = (cardWidth + gap) * 4 // 每次滾動四個卡片的寬度加上間距

    const currentScroll = container.scrollLeft
    const targetScroll = currentScroll + direction * scrollAmount

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }, [])

  // 頁面變更
  const handlePageChange = useCallback(
    (pageNumber) => {
      setCurrentPage(pageNumber)
      // 滾動到頂部
      window.scrollTo({
        top: document.querySelector(`.${styles.contain_title}`).offsetTop - 100,
        behavior: 'smooth',
      })
    },
    [setCurrentPage]
  )

  // 清除所有篩選條件
  const clearAllFilters = useCallback(() => {
    setSelectedSpecies('')
    setSelectedBreed('')
    setSelectedRegion('')
    setSelectedStore('')
    setShowFavorites(false)
    setCurrentPage(1) // 重置回第一頁
    // 重新刷新寵物資料
    mutatePets()
  }, [
    mutatePets,
    setSelectedSpecies,
    setSelectedBreed,
    setSelectedRegion,
    setSelectedStore,
    setShowFavorites,
    setCurrentPage,
  ])

  // 在結果區塊加入篩選結果統計
  const ResultsHeader = () => (
    <div className={styles.resultsHeader}>
      <h2>寵物搜尋結果 ({petsData?.pagination?.total || 0})</h2>
      <div className={styles.activeFilters}>
        {selectedSpecies && (
          <span className={styles.filterTag}>
            物種:{' '}
            {selectedSpecies === '1'
              ? '狗'
              : selectedSpecies === '2'
              ? '貓'
              : '其他'}
          </span>
        )}
        {selectedBreed && (
          <span className={styles.filterTag}>品種: {selectedBreed}</span>
        )}
        {selectedRegion && (
          <span className={styles.filterTag}>地區: {selectedRegion}</span>
        )}
        {selectedStore && storesData?.stores && (
          <span className={styles.filterTag}>
            商店:{' '}
            {
              storesData.stores.find((s) => s.id === parseInt(selectedStore))
                ?.name
            }
          </span>
        )}
      </div>
    </div>
  )

  // 初始化地圖標記 - 已經不需要，在選擇地區時會自動設置標記
  useEffect(() => {
    // 空的依賴數組，只在組件初次渲染時執行一次
    // 初始不設置任何標記，只在用戶選擇時才顯示
  }, [])

  // 更新 URL 查詢參數
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedSpecies) params.set('species', selectedSpecies)
    if (selectedBreed) params.set('breed', selectedBreed)
    if (selectedRegion) params.set('region', selectedRegion)
    if (selectedStore) params.set('store', selectedStore)
    if (showFavorites) params.set('favorites', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [
    selectedSpecies,
    selectedBreed,
    selectedRegion,
    selectedStore,
    showFavorites,
    currentPage,
  ])

  if (!petsData) return <div>載入中...</div>
  if (petsError) return <div>發生錯誤</div>

  return (
    <div className={styles.petsContainer}>
      <Breadcrumbs
        title="寵物領養"
        items={[
          {
            label: '首頁',
            href: '/',
          },
          {
            label: '寵物列表',
            href: '/pets',
          },
        ]}
      />

      <div className={styles.pageTitle}>
        <h1>尋找您的完美寵物夥伴</h1>
        <p>
          我們有各種可愛的寵物等待一個溫暖的家，透過篩選或問卷推薦找到最適合您的毛孩
        </p>
      </div>

      {/* 問卷推薦入口 */}
      <div className={styles.questionnaireSection}>
        <div className={styles.questionnaireCard}>
          <div className={styles.questionnaireContent}>
            <div className={styles.questionnaireIcon}>
              <FaPaw />
            </div>
            <div className={styles.questionnaireText}>
              <h3>不確定適合哪種寵物？</h3>
              <p>
                完成我們的簡短問卷，我們將根據您的生活方式和偏好推薦最適合您的寵物
              </p>
            </div>
            <a
              href="/pets/questionnaire"
              className={styles.questionnaireButton}
            >
              開始問卷{' '}
              <span>
                <FaArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <Row>
            <Col md={6}>
              <div className={styles.filterForm}>
                <Form>
                  <div className={styles.formGroupRow}>
                    <Form.Check
                      type="checkbox"
                      label="已收藏"
                      className="mb-0"
                      checked={showFavorites}
                      onChange={(e) => setShowFavorites(e.target.checked)}
                    />
                    <div className={styles.viewModeSwitchWrapper}>
                      <Form.Check
                        type="switch"
                        id="view-mode-switch"
                        label={viewMode === 'map' ? '地圖檢視' : '列表檢視'}
                        checked={viewMode === 'map'}
                        onChange={handleViewModeChange}
                        className={styles.viewModeSwitch}
                      />
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>物種</Form.Label>
                    <Form.Select
                      value={selectedSpecies}
                      onChange={(e) => setSelectedSpecies(e.target.value)}
                    >
                      <option value="">請選擇物種</option>
                      {speciesData?.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>品種</Form.Label>
                    {/* 使用自定義的可搜尋下拉選單 */}
                    <SearchableSelect
                      options={varietiesData || []}
                      value={selectedBreed}
                      onChange={setSelectedBreed}
                      placeholder="請選擇品種"
                      disabled={!varietiesData || varietiesData.length === 0}
                    />
                    <div className={styles.varietyInfo}>
                      {varietiesData
                        ? `已找到 ${varietiesData.length} 個品種`
                        : '正在載入品種資料...'}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>地區</Form.Label>
                    <Form.Select
                      value={selectedRegion}
                      onChange={handleRegionChange}
                    >
                      <option value="">請選擇地區</option>
                      <option>台北市</option>
                      <option>新北市</option>
                      <option>桃園市</option>
                      <option>台南市</option>
                      <option>高雄市</option>
                      <option>基隆市</option>
                      <option>新竹市</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>據點位置</Form.Label>
                    <Form.Select
                      value={selectedStore}
                      onChange={handleStoreChange}
                    >
                      <option value="">請選擇據點</option>
                      {storesData?.stores
                        ?.filter(
                          (store) =>
                            // 如果有選擇地區，只顯示該地區的商店
                            !selectedRegion ||
                            store.address.startsWith(selectedRegion)
                        )
                        .map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} - {store.address}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Button
                      variant="outline-primary"
                      className={styles.locationButton}
                      onClick={getUserLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? '獲取位置中...' : '使用我的位置'}
                    </Button>
                    {locationError && (
                      <div className={styles.locationError}>
                        {locationError}
                      </div>
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
                          onChange={(e) =>
                            setSearchRadius(parseInt(e.target.value))
                          }
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
                      <Button
                        className="mx-2"
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedLocation(null)
                          setSelectedStoreLocation(null)
                          setMapMarkers([])
                        }}
                      >
                        清除位置
                      </Button>
                    </div>
                  )}

                  {/* 清除所有篩選按鈕 */}
                  <div className={styles.clearFiltersContainer}>
                    <Button
                      variant="outline-primary"
                      onClick={clearAllFilters}
                      className={styles.clearFiltersButton}
                    >
                      <FaSearch className="me-2" />
                      清除所有篩選條件
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
            <Col md={6}>
              {viewMode === 'list' && (
                <div className={styles.mapContainer}>
                  <MapComponent
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={mapMarkers}
                    onLocationSelect={(location) => {
                      setSelectedLocation(location)
                      setSelectedStoreLocation(null)
                      setMapMarkers([
                        {
                          ...location,
                          name: '已選擇的位置',
                          isSelected: true,
                          id: Date.now(),
                        },
                      ])
                      setSelectedRegion('')
                    }}
                    regionName={selectedRegion}
                    showLegend={false}
                    searchRadius={searchRadius}
                    userLocation={selectedLocation}
                    selectedStoreLocation={selectedStoreLocation}
                  />
                </div>
              )}
              {viewMode === 'map' && (
                <div className={styles.sideInfoContainer}>
                  {selectedLocation ? (
                    <>
                      <NearbyStoresList
                        stores={nearbyStores}
                        searchRadius={searchRadius}
                        handleNearbyStoreClick={(store) => {
                          setSelectedStoreLocation(store)
                          setViewMode('map')
                        }}
                      />
                    </>
                  ) : (
                    <div className={styles.mapInfoPlaceholder}>
                      <p>點擊「使用我的位置」按鈕獲取附近商店</p>
                      <p>或在大地圖上點擊選擇位置</p>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* 根據視圖模式顯示不同內容 */}
      {viewMode === 'map' ? (
        <div className={styles.fullMapContainer} ref={fullMapRef}>
          <MapComponent
            center={mapCenter}
            zoom={mapZoom}
            markers={mapMarkers}
            onLocationSelect={(location) => {
              setSelectedLocation(location)
              setSelectedStoreLocation(null)
              setMapMarkers([
                {
                  ...location,
                  name: '已選擇的位置',
                  isSelected: true,
                  id: Date.now(),
                },
              ])
              setSelectedRegion('')
            }}
            regionName={selectedRegion}
            showLegend={true}
            searchRadius={searchRadius}
            userLocation={selectedLocation}
            selectedStoreLocation={selectedStoreLocation}
          />
        </div>
      ) : (
        <main>
          <div className={styles.cardSections}>
            {/* 篩選結果區塊 */}
            <div className={styles.contain}>
              <div className={styles.contain_title}>
                <ResultsHeader />
              </div>
              <div className={styles.group}>
                <div
                  className={`${styles.gridContainer} ${styles.flexContainer}`}
                >
                  {filteredPets.length > 0 ? (
                    filteredPets.map((pet) => (
                      <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={`${styles.cardLink} ${styles.flexItem}`}
                      >
                        <Card
                          image={
                            pet.main_photo ||
                            pet.image_url ||
                            '/images/default_no_pet.jpg'
                          }
                          title={pet.name}
                          className={styles.petCard}
                        >
                          <div className={styles.petCardContent}>
                            <div className={styles.petCardInfo}>
                              <p>
                                <span className={styles.label}>品種</span>
                                {pet.variety || '未知'}
                              </p>
                              <p>
                                <span className={styles.label}>年齡</span>
                                {pet.age || '未知'}
                                <span className={styles.separator}>・</span>
                                {pet.gender === 'M' ? '男生' : '女生'}
                              </p>
                            </div>
                            <div className={styles.petCardLocation}>
                              <FaMapMarkerAlt />
                              {pet.location || '地點未提供'}
                            </div>
                          </div>
                          <button
                            className={styles.likeButton}
                            onClick={(e) => handleToggleFavorite(e, pet.id)}
                            aria-label={
                              favorites[pet.id] ? '取消收藏' : '加入收藏'
                            }
                          >
                            {favorites[pet.id] ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.noResults}>
                      <FaSearch />
                      <p>沒有符合條件的寵物，請調整篩選條件</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 分頁控制 */}
              {petsData.pagination &&
                petsData.pagination.total > itemsPerPage && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      顯示 {petsData.pagination.total} 個結果中的
                      {(currentPage - 1) * itemsPerPage + 1} -
                      {Math.min(
                        currentPage * itemsPerPage,
                        petsData.pagination.total
                      )}{' '}
                      項
                    </div>
                    <div className={styles.paginationControls}>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        首頁
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        &laquo; 上一頁
                      </Button>

                      {/* 頁碼按鈕 */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // 計算要顯示的頁碼，確保當前頁在中間
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum
                                  ? 'primary'
                                  : 'outline-secondary'
                              }
                              onClick={() => handlePageChange(pageNum)}
                              className={styles.paginationButton}
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                      )}

                      <Button
                        variant="outline-secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        下一頁 &raquo;
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        末頁
                      </Button>
                    </div>
                  </div>
                )}
            </div>

            {/* 最新上架區 */}
            <div className={styles.contain}>
              <div className={styles.contain_title}>
                <h2>最新上架</h2>
              </div>
              <div className={styles.group}>
                <div className={styles.groupBody}>
                  <CardSwitchButton
                    direction="left"
                    onClick={() => scroll(-1, latestRef)}
                    aria-label="向左滑動"
                  />
                  <div
                    className={`${styles.cardGroup} ${styles.flexGroup}`}
                    ref={latestRef}
                  >
                    {latestPets && latestPets.length > 0 ? (
                      latestPets.map((pet) => (
                        <Link
                          href={`/pets/${pet.id}`}
                          key={pet.id}
                          className={`${styles.cardLink} ${styles.flexItem}`}
                        >
                          <Card
                            image={
                              pet.main_photo ||
                              pet.image_url ||
                              '/images/default_no_pet.jpg'
                            }
                            title={pet.name}
                            className={styles.petCard}
                          >
                            <div className={styles.petCardContent}>
                              <div className={styles.petCardInfo}>
                                <p>
                                  <span className={styles.label}>品種</span>
                                  {pet.variety || '未知'}
                                </p>
                                <p>
                                  <span className={styles.label}>年齡</span>
                                  {pet.age || '未知'}
                                  <span className={styles.separator}>・</span>
                                  {pet.gender === 'M' ? '男生' : '女生'}
                                </p>
                              </div>
                              <div className={styles.petCardLocation}>
                                <FaMapMarkerAlt />
                                {pet.location || '地點未提供'}
                              </div>
                            </div>
                            <button
                              className={styles.likeButton}
                              onClick={(e) => handleToggleFavorite(e, pet.id)}
                              aria-label={
                                favorites[pet.id] ? '取消收藏' : '加入收藏'
                              }
                            >
                              {favorites[pet.id] ? <FaHeart /> : <FaRegHeart />}
                            </button>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className={styles.noResultsInLatest}>
                        <p>暫無最新上架寵物</p>
                      </div>
                    )}
                  </div>
                  <CardSwitchButton
                    direction="right"
                    onClick={() => scroll(1, latestRef)}
                    aria-label="向右滑動"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

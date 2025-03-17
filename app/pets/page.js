'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
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
  FaClipboardList,
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
  const [mapCenter, setMapCenter] = useState([25.033, 121.5654])
  const [mapZoom, setMapZoom] = useState(13)
  const [viewMode, setViewMode] = useState('list')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [nearbyStores, setNearbyStores] = useState([])
  const [searchRadius, setSearchRadius] = useState(2)
  const [selectedStoreLocation, setSelectedStoreLocation] = useState(null)
  const [favorites, setFavorites] = useState({})
  const [showFavorites, setShowFavorites] = useState(false)

  // 使用 SWR 獲取資料
  const { data: petsData, error: petsError } = useSWR(
    '/api/pets?type=pets',
    fetcher
  )
  const { data: speciesData } = useSWR('/api/pets?type=species', fetcher)
  const { data: breedsData, mutate: mutateBreeds } = useSWR(
    selectedSpecies
      ? `/api/pets?type=breeds&species_id=${selectedSpecies}`
      : null,
    fetcher
  )
  // 獲取所有不重複的品種資料
  const { data: varietiesData, mutate: mutateVarieties } = useSWR(
    selectedSpecies
      ? `/api/pets?type=varieties&species_id=${selectedSpecies}`
      : '/api/pets?type=varieties',
    fetcher
  )
  // 獲取寵物商店資料
  const { data: storesData } = useSWR('/api/pets?type=stores', fetcher)
  // 獲取用戶的收藏列表
  const { data: favoritesData, mutate: mutateFavorites } = useSWR(
    '/api/pets?type=favorites&userId=1', // 暫時hardcode userId=1
    fetcher
  )

  // 確保在頁面載入時就獲取所有品種資料
  useEffect(() => {
    if (!varietiesData) {
      mutateVarieties()
    }
  }, [varietiesData, mutateVarieties])

  // 初始化收藏狀態
  useEffect(() => {
    if (favoritesData?.favorites) {
      const favoritesMap = {}
      favoritesData.favorites.forEach((fav) => {
        favoritesMap[fav.pet_id] = true
      })
      setFavorites(favoritesMap)
    }
  }, [favoritesData])

  // 處理最新上架的寵物（取ID最大的前5筆）
  const latestPets = useMemo(() => {
    if (!petsData?.pets || !Array.isArray(petsData.pets)) return []
    return [...petsData.pets].sort((a, b) => b.id - a.id).slice(0, 5)
  }, [petsData])

  // 處理篩選結果的寵物
  const filteredPets = useMemo(() => {
    if (!petsData?.pets || !Array.isArray(petsData.pets)) return []

    // 使用篩選條件過濾資料
    let filtered = petsData.pets

    // 根據選擇的物種篩選
    if (selectedSpecies) {
      filtered = filtered.filter(
        (pet) =>
          pet.species_name ===
          (selectedSpecies === '1'
            ? '狗'
            : selectedSpecies === '2'
            ? '貓'
            : '其他')
      )
    }

    // 根據選擇的品種篩選
    if (selectedBreed) {
      filtered = filtered.filter((pet) => pet.variety === selectedBreed)
    }

    // 根據選擇的地區篩選
    if (selectedRegion) {
      filtered = filtered.filter((pet) => pet.location.includes(selectedRegion))
    }

    // 根據選擇的商店篩選
    if (selectedStore) {
      filtered = filtered.filter(
        (pet) => pet.store_id === parseInt(selectedStore)
      )
    }

    // 根據收藏狀態篩選
    if (showFavorites) {
      filtered = filtered.filter((pet) => favorites[pet.id])
    }

    return filtered
  }, [
    petsData,
    selectedSpecies,
    selectedBreed,
    selectedRegion,
    selectedStore,
    showFavorites,
    favorites,
  ])

  // 處理地區選擇
  const handleRegionChange = (e) => {
    const region = e.target.value
    setSelectedRegion(region)
    // 清除商店選擇
    setSelectedStore('')

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
  }

  // 處理商店選擇
  const handleStoreChange = (e) => {
    const storeId = e.target.value
    setSelectedStore(storeId)
    // 清除地區選擇
    setSelectedRegion('')

    if (storeId && storesData?.stores) {
      // 找到選中的商店
      const store = storesData.stores.find(
        (store) => store.id.toString() === storeId
      )

      if (store) {
        // 從地址中提取大約的坐標 - 實際應用中應該從資料庫獲取準確坐標
        // 這裡我們簡單處理，根據地址的前兩個字判斷城市，然後使用該城市的默認坐標
        const cityName = store.address.substring(0, 2)
        let lat = 25.033 // 默認台北市
        let lng = 121.5654
        let zoom = 15

        // 根據地址前綴判斷城市，設置坐標
        for (const [region, coords] of Object.entries(locationData)) {
          if (store.address.startsWith(region.substring(0, 2))) {
            lat = coords.lat
            lng = coords.lng
            zoom = 15 // 放大到更詳細的級別
            break
          }
        }

        setMapCenter([lat, lng])
        setMapZoom(zoom)

        // 添加一個唯一的 id，確保標記更新時彈出窗口會重新打開
        setMapMarkers([
          {
            lat,
            lng,
            name: store.name,
            description: `${store.address} (${store.phone})`,
            isStore: true,
            id: Date.now(),
          },
        ])

        // 清除手動選擇的位置
        setSelectedLocation(null)
      }
    } else {
      // 如果選擇了「請選擇商店」，清除標記
      setMapMarkers([])
      // 恢復預設地圖中心
      setMapCenter([25.033, 121.5654])
      setMapZoom(13)
    }
  }

  // 處理地圖位置選擇
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    // 添加一個唯一的 id，確保標記更新時彈出窗口會重新打開
    setMapMarkers([
      { ...location, name: '已選擇的位置', isSelected: true, id: Date.now() },
    ])
    // 當手動選擇位置時，清除地區選擇
    setSelectedRegion('')
  }

  // 滾動功能
  const scroll = (direction, ref) => {
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
  }

  // 初始化地圖標記 - 已經不需要，在選擇地區時會自動設置標記
  useEffect(() => {
    // 空的依賴數組，只在組件初次渲染時執行一次
    // 初始不設置任何標記，只在用戶選擇時才顯示
  }, [])

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
    return distance
  }

  // 尋找附近商店
  const findNearbyStores = (latitude, longitude) => {
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
  }

  // 獲取用戶位置 - 更新函數
  const getUserLocation = () => {
    // 重置錯誤狀態
    setLocationError(null)
    setNearbyStores([]) // 重置附近商店
    // 設置正在獲取位置狀態
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

        // 切換到地圖視圖模式，所有的地圖更新在視圖切換後進行
        setViewMode('map')

        // 延遲更新地圖相關狀態，確保視圖切換完成後再更新
        setTimeout(() => {
          // 只添加用戶位置標記，不添加店家標記
          const markersArray = [
            {
              lat: latitude,
              lng: longitude,
              name: '您的位置',
              isSelected: true,
              id: 'user-location', // 使用固定的ID
              isUserLocation: true,
            },
          ]

          // 設置地圖中心和縮放級別
          setMapCenter([latitude, longitude])
          setMapZoom(15)

          // 更新所有標記
          setMapMarkers(markersArray)

          // 完成位置獲取
          setIsGettingLocation(false)
        }, 200) // 稍微延長等待時間，確保視圖切換完成
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
        enableHighAccuracy: true, // 高精度
        timeout: 10000, // 10 秒超時
        maximumAge: 0, // 不使用緩存
      }
    )
  }

  // 計算適合同時顯示用戶位置和店家位置的最佳縮放等級
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

  // 計算地圖的中心點
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

  // 處理附近商店點擊事件
  const handleNearbyStoreClick = (store) => {
    if (!store.lat || !store.lng) return // 如果沒有有效座標，直接返回

    const storeMarkerId = `store-${store.id}`
    const needsViewChange = viewMode === 'list'

    // 設置選中的店家位置，用於繪製直線
    setSelectedStoreLocation({
      lat: store.lat,
      lng: store.lng,
      name: store.name,
    })

    // 如果是列表視圖，先切換到地圖視圖
    if (needsViewChange) {
      setViewMode('map')
    }

    // 使用 setTimeout 確保視圖切換完成後再更新地圖
    setTimeout(
      () => {
        // 計算最佳縮放等級和中心點
        const optimalZoom = selectedLocation
          ? calculateOptimalZoom(selectedLocation, store)
          : 16

        const optimalCenter = selectedLocation
          ? calculateMapCenter(selectedLocation, store)
          : [store.lat, store.lng]

        // 更新地圖中心和縮放等級
        setMapCenter(optimalCenter)
        setMapZoom(optimalZoom)

        // 創建新的標記數組，只保留用戶位置和當前選中的店家
        let newMarkers = []

        // 添加用戶位置標記（如果存在）
        if (selectedLocation) {
          // 查找現有的用戶位置標記
          const userMarker = mapMarkers.find(
            (marker) => marker.id === 'user-location' || marker.isUserLocation
          )

          if (userMarker) {
            // 如果已存在用戶標記，則保留它
            newMarkers.push(userMarker)
          } else {
            // 否則創建新的用戶位置標記
            newMarkers.push({
              lat: selectedLocation.lat,
              lng: selectedLocation.lng,
              name: '您的位置',
              isSelected: false,
              id: 'user-location',
              isUserLocation: true,
            })
          }
        }

        // 添加當前選中的店家標記
        newMarkers.push({
          lat: store.lat,
          lng: store.lng,
          name: store.name,
          description: `${store.address} (${
            store.phone
          }) - 距離: ${store.distance.toFixed(2)}公里`,
          isStore: true,
          id: storeMarkerId,
          distance: store.distance, // 存儲距離信息
        })

        // 更新標記數組
        setMapMarkers(newMarkers)

        // 滾動到地圖位置
        if (fullMapRef.current) {
          requestAnimationFrame(() => {
            fullMapRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          })
        }
      },
      needsViewChange ? 300 : 50
    ) // 視圖切換需要更長的延遲
  }

  // 清除位置時也清除選中的店家位置
  const clearLocation = () => {
    setSelectedLocation(null)
    setSelectedStoreLocation(null)
    // 如果有選擇地區，恢復地區標記
    if (selectedRegion && locationData[selectedRegion]) {
      const { lat, lng } = locationData[selectedRegion]
      // 添加一個唯一的 id，確保標記更新時彈出窗口會重新打開
      setMapMarkers([
        {
          lat,
          lng,
          name: selectedRegion,
          isRegion: true,
          id: Date.now(),
        },
      ])
    } else {
      setMapMarkers([])
    }
  }

  // 搜尋範圍變更處理函數
  const handleSearchRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value)
    setSearchRadius(newRadius)

    // 如果搜尋範圍太小或沒有位置資訊，不進行更新
    if (newRadius < 1 || !selectedLocation) {
      return
    }

    // 保存當前地圖中心和縮放級別
    const currentCenter = [...mapCenter]
    const currentZoom = mapZoom

    // 查找用戶位置標記
    const userMarker = mapMarkers.find(
      (marker) => marker.id === 'user-location'
    )

    // 獲取新的附近商店列表
    const nearby = findNearbyStores(selectedLocation.lat, selectedLocation.lng)
    setNearbyStores(nearby)

    // 開始構建新的標記數組
    let newMarkers = []

    // 確保用戶位置標記始終存在
    if (userMarker) {
      newMarkers.push({ ...userMarker })
    } else if (selectedLocation) {
      // 如果沒有找到用戶位置標記但有位置資訊，創建新的
      newMarkers.push({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        name: '您的位置',
        isSelected: true,
        id: 'user-location',
        isUserLocation: true,
      })
    }

    // 添加附近商店標記
    nearby.forEach((store) => {
      const storeId = `store-${store.id}`
      newMarkers.push({
        lat: store.lat,
        lng: store.lng,
        name: store.name,
        description: `${store.address} (${
          store.phone
        }) - 距離: ${store.distance.toFixed(2)}公里`,
        isStore: true,
        id: storeId,
      })
    })

    // 一次性更新所有標記
    setMapMarkers(newMarkers)
  }

  // 處理收藏功能
  const handleToggleFavorite = async (event, petId) => {
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
        // 重新獲取收藏列表
        mutateFavorites()
      } else {
        console.error('收藏操作失敗')
      }
    } catch (error) {
      console.error('收藏操作錯誤:', error)
    }
  }

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
                        onChange={() =>
                          setViewMode(viewMode === 'map' ? 'list' : 'map')
                        }
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
                      {speciesData?.species?.map((species) => (
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
                      options={varietiesData?.varieties || []}
                      value={selectedBreed}
                      onChange={setSelectedBreed}
                      placeholder="請選擇品種"
                      disabled={
                        !varietiesData ||
                        !varietiesData.varieties ||
                        varietiesData.varieties.length === 0
                      }
                    />
                    <div className={styles.varietyInfo}>
                      {varietiesData
                        ? `已找到 ${
                            varietiesData.varieties?.length || 0
                          } 個品種`
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
                    <Form.Label>商店位置</Form.Label>
                    <Form.Select
                      value={selectedStore}
                      onChange={handleStoreChange}
                    >
                      <option value="">請選擇商店</option>
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
                          onChange={handleSearchRadiusChange}
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
                        onClick={clearLocation}
                      >
                        清除位置
                      </Button>
                    </div>
                  )}
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
                    onLocationSelect={handleLocationSelect}
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
                        handleNearbyStoreClick={handleNearbyStoreClick}
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
            onLocationSelect={handleLocationSelect}
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
                <h2>寵物搜尋結果</h2>
              </div>
              <div className={styles.group}>
                <div className={styles.groupBody}>
                  <CardSwitchButton
                    direction="left"
                    onClick={() => scroll(-1, popularRef)}
                    aria-label="向左滑動"
                  />
                  <div className={styles.cardGroup} ref={popularRef}>
                    {filteredPets.length > 0 ? (
                      filteredPets.map((pet) => (
                        <Link
                          href={`/pets/${pet.id}`}
                          key={pet.id}
                          className={styles.cardLink}
                        >
                          <Card
                            image={
                              pet.image_url ||
                              pet.main_photo ||
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
                  <CardSwitchButton
                    direction="right"
                    onClick={() => scroll(1, popularRef)}
                    aria-label="向右滑動"
                  />
                </div>
              </div>
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
                  <div className={styles.cardGroup} ref={latestRef}>
                    {latestPets.map((pet) => (
                      <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={styles.cardLink}
                      >
                        <Card
                          image={
                            pet.image_url ||
                            pet.main_photo ||
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
                    ))}
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

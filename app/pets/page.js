'use client'

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useTransition,
} from 'react'
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
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

import { usePageTitle } from '@/app/context/TitleContext'
import MapDrawer from './_components/MapDrawer'

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
      : [22.997, 120.205] // 預設為台南
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
  usePageTitle('寵物領養')
  const latestRef = useRef(null)

  // 使用 useAuth 獲取用戶信息
  const { user, isAuthenticated } = useAuth()

  // 狀態管理
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [displayCount, setDisplayCount] = useState(12)
  const [isLoading, setIsLoading] = useState(false)
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
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  // 保存滾動位置
  const scrollPositionRef = useRef(0)

  // 保存上一次的數據，避免重新渲染時的閃爍
  const [previousPetsData, setPreviousPetsData] = useState(null)

  // 優化API調用: 合併基礎資料請求
  const { data: metaData, mutate: mutateMetaData } = useSWR(
    '/api/pets?type=meta',
    fetcher,
    {
      revalidateOnFocus: true, // 當視窗重新獲得焦點時重新驗證
      revalidateOnReconnect: true, // 當重新連接網路時重新驗證
      refreshInterval: 30000, // 每30秒自動重新驗證一次
    }
  )

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

    // 為每個寵物添加物種名稱
    return metaData.latestPets.map((pet) => {
      // 直接使用 species 欄位，這是 API 返回的原始物種名稱
      return { ...pet, species_name: pet.species || '寵物' }
    })
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
    params.set('pageSize', '100') // 一次獲取較多資料

    if (user && user.id) {
      params.set('userId', user.id.toString())
    }

    params.set('excludeAdopted', 'true')

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

  // 自定義防抖函數 - 不使用套件
  const useDebounce = (fn, delay) => {
    const timerRef = useRef(null)

    return useCallback(
      (...args) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
          fn(...args)
        }, delay)
      },
      [fn, delay]
    )
  }

  // 為 mutatePets 創建一個防抖版本
  const debouncedMutatePets = useDebounce(() => {
    mutatePets()
  }, 300)

  // 記錄當前滾動位置的事件監聽器
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 處理篩選更新的統一函數
  const handleFilterUpdate = useCallback(
    (updateFn) => {
      // 保存當前滾動位置
      const currentScrollPosition = window.scrollY

      // 保存當前數據以避免閃爍
      if (petsData) {
        setPreviousPetsData(petsData)
      }

      // 使用 startTransition 將更新標記為非緊急
      startTransition(() => {
        // 執行實際的狀態更新
        updateFn()

        // 延遲恢復滾動位置
        requestAnimationFrame(() => {
          window.scrollTo({
            top: currentScrollPosition,
            behavior: 'auto',
          })
        })
      })
    },
    [petsData]
  )

  // 在數據更新後更新 previousPetsData
  useEffect(() => {
    if (petsData && !isPending) {
      setPreviousPetsData(petsData)
    }
  }, [petsData, isPending])

  // 修改為使用 previousPetsData 優先於 petsData
  const displayPetsData = useMemo(() => {
    // 如果正在更新且有之前的數據，使用之前的數據
    if (isPending && previousPetsData) {
      return previousPetsData
    }
    // 否則使用當前數據
    return petsData
  }, [isPending, previousPetsData, petsData])

  // 生成隨機偏移
  const addRandomOffset = (lat, lng) => {
    const offset = 0.001 // 約 100 公尺
    return {
      lat: parseFloat(lat) + (Math.random() - 0.5) * offset,
      lng: parseFloat(lng) + (Math.random() - 0.5) * offset,
    }
  }

  // 修改 filteredPets 的 useMemo
  const filteredPets = useMemo(() => {
    if (!displayPetsData?.pets || !Array.isArray(displayPetsData.pets)) {
      console.log('No pets data available')
      return []
    }

    // 如果顯示收藏，需要額外篩選
    let pets = showFavorites
      ? displayPetsData.pets.filter((pet) => pet.isFavorite)
      : displayPetsData.pets

    // 確保有店家資料
    if (!storesData?.stores) {
      console.log('No stores data available')
      return pets
    }

    // 為每個寵物添加隨機偏移的位置和完整的店家資訊
    return pets.map((pet) => {
      // 處理物種名稱 - 直接使用 species 欄位
      // API 返回的是 species (狗/貓) 而不是 species_id
      const species_name = pet.species || '寵物'

      // 檢查寵物是否有 store_id
      if (!pet.store_id) {
        console.log('Pet has no store_id:', pet.id, pet.name)
        return { ...pet, species_name }
      }

      // 從 storesData 中找到對應的店家
      const store = storesData.stores.find((store) => store.id === pet.store_id)

      if (!store || !store.lat || !store.lng) {
        console.log('Store not found or has no coordinates:', pet.store_id)
        return { ...pet, species_name }
      }

      // 生成隨機偏移
      const { lat, lng } = addRandomOffset(
        parseFloat(store.lat),
        parseFloat(store.lng)
      )

      // 返回包含完整店家資訊的寵物資料
      return {
        ...pet,
        species_name,
        store: {
          id: store.id,
          name: store.name,
          lat: store.lat,
          lng: store.lng,
          address: store.address,
          phone: store.phone,
        },
        offsetLat: lat,
        offsetLng: lng,
      }
    })
  }, [displayPetsData, showFavorites, storesData])

  // 修改使用伺服器返回的分頁資訊 - 基於 displayPetsData
  const totalPages = useMemo(() => {
    return displayPetsData?.pagination?.totalPages || 1
  }, [displayPetsData])

  // 修改物種篩選函數
  const handleSpeciesChange = useCallback(
    (e) => {
      const newSpecies = e.target.value

      handleFilterUpdate(() => {
        setSelectedSpecies(newSpecies)
        setSelectedBreed('') // 重置品種選擇
        setCurrentPage(1) // 重置頁碼
        debouncedMutatePets()
      })
    },
    [
      handleFilterUpdate,
      setSelectedSpecies,
      setSelectedBreed,
      setCurrentPage,
      debouncedMutatePets,
    ]
  )

  // 修改品種篩選函數
  const handleBreedChange = useCallback(
    (value) => {
      handleFilterUpdate(() => {
        setSelectedBreed(value)
        setCurrentPage(1) // 重置頁碼
        debouncedMutatePets()
      })
    },
    [handleFilterUpdate, setSelectedBreed, setCurrentPage, debouncedMutatePets]
  )

  // 修改收藏顯示切換
  const handleFavoritesToggle = useCallback(
    (e) => {
      const checked = e.target.checked

      handleFilterUpdate(() => {
        setShowFavorites(checked)
        setCurrentPage(1) // 重置頁碼
        debouncedMutatePets()
      })
    },
    [handleFilterUpdate, setShowFavorites, setCurrentPage, debouncedMutatePets]
  )

  // 修改地區選擇函數
  const handleRegionChange = useCallback(
    (e) => {
      const region = e.target.value

      handleFilterUpdate(() => {
        setSelectedRegion(region)
        setSelectedStore('') // 清除商店選擇
        setCurrentPage(1) // 重置頁碼

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

        debouncedMutatePets()
      })
    },
    [
      handleFilterUpdate,
      setSelectedRegion,
      setSelectedStore,
      setCurrentPage,
      setMapCenter,
      setMapZoom,
      setMapMarkers,
      setSelectedLocation,
      debouncedMutatePets,
    ]
  )

  // 添加重新載入店家資料的函數
  const reloadStoresData = useCallback(() => {
    mutateMetaData()
  }, [mutateMetaData])

  // 修改商店選擇函數
  const handleStoreChange = useCallback(
    (e) => {
      const storeId = e.target.value

      // 重新載入店家資料
      reloadStoresData()

      handleFilterUpdate(() => {
        setSelectedStore(storeId)
        setSelectedRegion('')
        setCurrentPage(1) // 重置頁碼

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

        debouncedMutatePets()
      })
    },
    [
      handleFilterUpdate,
      storesData,
      setSelectedStore,
      setSelectedRegion,
      setCurrentPage,
      setMapCenter,
      setMapZoom,
      setMapMarkers,
      setSelectedLocation,
      debouncedMutatePets,
      reloadStoresData,
    ]
  )

  // 修改清除所有篩選條件的函數
  const clearAllFilters = useCallback(() => {
    handleFilterUpdate(() => {
      setSelectedSpecies('')
      setSelectedBreed('')
      setSelectedRegion('')
      setSelectedStore('')
      setShowFavorites(false)
      setCurrentPage(1) // 重置回第一頁
      debouncedMutatePets()
    })
  }, [
    handleFilterUpdate,
    setSelectedSpecies,
    setSelectedBreed,
    setSelectedRegion,
    setSelectedStore,
    setShowFavorites,
    setCurrentPage,
    debouncedMutatePets,
  ])

  // 延遲 URL 更新
  const debouncedUpdateUrl = useDebounce(() => {
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
  }, 500)

  // 修改 URL 更新效果
  useEffect(() => {
    debouncedUpdateUrl()
  }, [
    selectedSpecies,
    selectedBreed,
    selectedRegion,
    selectedStore,
    showFavorites,
    currentPage,
    debouncedUpdateUrl,
  ])

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
    // 保存當前滾動位置
    const currentScrollPosition = window.scrollY

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
          // 創建標記數組，首先添加用戶位置
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

          // 將附近的商店添加到標記數組中
          if (nearby && nearby.length > 0) {
            nearby.forEach((store) => {
              markersArray.push({
                lat: parseFloat(store.lat),
                lng: parseFloat(store.lng),
                name: store.name,
                description: `${store.address} (${
                  store.phone
                }) - 距離: ${store.distance.toFixed(2)} 公里`,
                isStore: true,
                id: `store-${store.id}`,
                distance: store.distance,
              })
            })
          }

          setMapCenter([latitude, longitude])
          setMapZoom(15)
          setMapMarkers(markersArray)
          setIsGettingLocation(false)

          // 恢復滾動位置
          requestAnimationFrame(() => {
            window.scrollTo({
              top: currentScrollPosition,
              behavior: 'auto',
            })
          })
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

      // 檢查用戶是否已登入
      if (!isAuthenticated || !user) {
        // 如果未登入，顯示提示並導向登入頁面
        alert('請先登入才能將寵物加入收藏')
        // 儲存當前頁面路徑，以便登入後返回
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
        window.location.href = '/member/MemberLogin/login'
        return
      }

      const userId = user.id
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
          debouncedMutatePets()
        } else {
          console.error('收藏操作失敗')
        }
      } catch (error) {
        console.error('收藏操作錯誤:', error)
      }
    },
    [favorites, debouncedMutatePets, user, isAuthenticated]
  )

  // 處理附近商店點擊事件
  const handleNearbyStoreClick = useCallback(
    (store) => {
      setSelectedStoreLocation(store)

      // 更新地圖標記，保留原有的用戶位置標記
      const newMarkers = [...mapMarkers]

      // 嘗試移除已有的選中商店標記
      const existingStoreIndex = newMarkers.findIndex(
        (marker) => marker.isStore && marker.isSelected
      )

      if (existingStoreIndex !== -1) {
        // 如果找到了已選擇的商店標記，移除它的選中狀態
        newMarkers[existingStoreIndex] = {
          ...newMarkers[existingStoreIndex],
          isSelected: false,
        }
      }

      // 尋找新選擇的商店標記
      const newStoreIndex = newMarkers.findIndex(
        (marker) => marker.isStore && marker.id === `store-${store.id}`
      )

      if (newStoreIndex !== -1) {
        // 如果在標記中找到了該商店，將其標記為選中
        newMarkers[newStoreIndex] = {
          ...newMarkers[newStoreIndex],
          isSelected: true,
        }
      } else {
        // 如果沒有找到，添加新的商店標記
        newMarkers.push({
          lat: parseFloat(store.lat),
          lng: parseFloat(store.lng),
          name: store.name,
          description: `${store.address} (${
            store.phone
          }) - 距離: ${store.distance.toFixed(2)} 公里`,
          isStore: true,
          id: `store-${store.id}`,
          isSelected: true,
          distance: store.distance,
        })
      }

      // 更新地圖標記
      setMapMarkers(newMarkers)

      // 計算並設置地圖中心點
      if (selectedLocation) {
        const center = calculateMapCenter(selectedLocation, {
          lat: parseFloat(store.lat),
          lng: parseFloat(store.lng),
        })
        setMapCenter(center)

        // 計算最佳縮放等級
        const zoom = calculateOptimalZoom(selectedLocation, {
          lat: parseFloat(store.lat),
          lng: parseFloat(store.lng),
        })
        setMapZoom(zoom)
      } else {
        // 如果沒有用戶位置，就直接將地圖中心設為商店位置
        setMapCenter([parseFloat(store.lat), parseFloat(store.lng)])
        setMapZoom(15)
      }
    },
    [
      mapMarkers,
      selectedLocation,
      setSelectedStoreLocation,
      setMapMarkers,
      setMapCenter,
      setMapZoom,
    ]
  )

  // 修改視圖切換邏輯，保留現有功能並添加抽屜控制
  const handleViewModeChange = useCallback(() => {
    const newViewMode = viewMode === 'map' ? 'list' : 'map'

    // 轉換到地圖模式時，確保地圖數據已就緒
    if (newViewMode === 'map') {
      // 重置地圖中心和縮放
      if (selectedLocation) {
        setMapCenter([selectedLocation.lat, selectedLocation.lng])
        setMapZoom(13)
      } else if (selectedStoreLocation) {
        setMapCenter(selectedStoreLocation)
        setMapZoom(13)
      } else if (selectedRegion) {
        // 如果選擇了地區但沒有具體位置，預設到該地區中心
        const regionData = {
          台北市: [25.033, 121.565],
          新北市: [25.0169, 121.4627],
          桃園市: [24.9936, 121.301],
          台南市: [22.9908, 120.2133],
          高雄市: [22.6273, 120.3014],
          基隆市: [25.1276, 121.7395],
          新竹市: [24.8138, 120.9675],
        }

        if (regionData[selectedRegion]) {
          setMapCenter(regionData[selectedRegion])
          setMapZoom(13)
        }
      }

      // 如果有選擇地區，確保商店數據已載入
      if (selectedRegion) {
        reloadStoresData()
      }

      // 如果附近有商店，確保它們被顯示在標記上
      if (nearbyStores && nearbyStores.length > 0 && selectedLocation) {
        const markers = [
          {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            name: '已選擇的位置',
            isSelected: true,
            id: Date.now(),
            isUserLocation: selectedLocation.isUserLocation || false,
          },
        ]

        nearbyStores.forEach((store) => {
          markers.push({
            lat: parseFloat(store.lat),
            lng: parseFloat(store.lng),
            name: store.name,
            description: `${store.address} (${
              store.phone
            }) - 距離: ${store.distance.toFixed(2)} 公里`,
            isStore: true,
            id: `store-${store.id}`,
            distance: store.distance,
          })
        })

        setMapMarkers(markers)
      }
    }

    setViewMode(newViewMode)
  }, [
    viewMode,
    selectedLocation,
    selectedStoreLocation,
    selectedRegion,
    nearbyStores,
    setViewMode,
    setMapMarkers,
    setMapCenter,
    setMapZoom,
    reloadStoresData,
  ])

  // 滾動功能
  const scroll = useCallback((direction, ref) => {
    const container = ref.current
    const isMobile = window.innerWidth <= 768

    // 手機版每次滾動一個卡片的寬度
    const cardWidth = isMobile ? container.offsetWidth * 0.7 : 280 // 卡片寬度，在手機上使用螢幕寬度的70%
    const gap = isMobile ? 15 : 30 // 間距在手機上減少
    const scrollAmount = isMobile ? cardWidth + gap : (cardWidth + gap) * 3 // 手機版每次滾動一張卡片，電腦版每次滾動三張

    // 計算寵物卡片的中心位置
    const cardCenter = cardWidth / 2
    const containerCenter = container.offsetWidth / 2

    const currentScroll = container.scrollLeft
    const targetScroll = currentScroll + direction * scrollAmount

    // 在移動後調整位置確保卡片在容器中居中
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }, [])

  // 在結果區塊加入篩選結果統計
  const ResultsHeader = () => (
    <div className={styles.resultsHeader}>
      <h2>寵物搜尋結果 ({displayPetsData?.pagination?.total || 0})</h2>
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

  // 處理地圖位置選擇的統一函數
  const handleMapLocationSelect = useCallback(
    (location) => {
      // 保存當前滾動位置
      const currentScrollPosition = window.scrollY

      // 使用 handleFilterUpdate 來管理狀態更新和防抖
      handleFilterUpdate(() => {
        // 設置選擇的位置
        setSelectedLocation(location)
        setSelectedStoreLocation(null)

        // 清除區域選擇
        setSelectedRegion('')
        setSelectedStore('')

        // 查找並更新附近商店
        const nearby = findNearbyStores(location.lat, location.lng)
        setNearbyStores(nearby)

        // 創建標記數組，首先添加用戶選擇的位置
        const newMarkers = [
          {
            ...location,
            name: '已選擇的位置',
            isSelected: true,
            id: Date.now(),
            isUserLocation: false, // 這是用戶選擇的位置，不是用戶當前位置
          },
        ]

        // 將附近的商店添加到標記數組中
        if (nearby && nearby.length > 0) {
          nearby.forEach((store) => {
            newMarkers.push({
              lat: parseFloat(store.lat),
              lng: parseFloat(store.lng),
              name: store.name,
              description: `${store.address} (${
                store.phone
              }) - 距離: ${store.distance.toFixed(2)} 公里`,
              isStore: true,
              id: `store-${store.id}`,
              distance: store.distance,
            })
          })
        }

        // 更新標記
        setMapMarkers(newMarkers)

        // 更新地圖中心和縮放
        setMapCenter([location.lat, location.lng])
        setMapZoom(15)

        // 恢復滾動位置
        requestAnimationFrame(() => {
          window.scrollTo({
            top: currentScrollPosition,
            behavior: 'auto',
          })
        })
      })
    },
    [
      handleFilterUpdate,
      setSelectedLocation,
      setSelectedStoreLocation,
      setSelectedRegion,
      setSelectedStore,
      setMapMarkers,
      findNearbyStores,
      setNearbyStores,
      setMapCenter,
      setMapZoom,
    ]
  )

  // 處理"載入更多"點擊
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + 9) // 每次多顯示 9 隻寵物
  }, [])

  // 計算是否還有更多寵物可以顯示
  const hasMore = useMemo(() => {
    if (!filteredPets) return false
    return displayCount < filteredPets.length
  }, [filteredPets, displayCount])

  // 獲取當前應該顯示的寵物
  const displayPets = useMemo(() => {
    if (!filteredPets) return []
    return filteredPets.slice(0, displayCount)
  }, [filteredPets, displayCount])

  // 使用 displayPetsData 替代 petsData 在條件渲染
  if (!displayPetsData && !previousPetsData) return <div>載入中...</div>
  if (petsError && !displayPetsData && !previousPetsData)
    return <div>發生錯誤</div>

  return (
    <div
      className={`${styles.petsContainer} ${
        viewMode === 'map' ? styles.mapView : ''
      }`}
    >
      {/* 添加加載指示器 */}
      {isPending && <div className={styles.updatingIndicator}>正在更新...</div>}

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
        {viewMode === 'list' && (
          <div className={styles.filterSection}>
            <Row>
              <Col lg={3}>
                {/* 篩選表單 */}
                <Form className={styles.filterForm}>
                  <div className={styles.formGroupRow}>
                    <Form.Check
                      type="checkbox"
                      label="已收藏"
                      className="mb-0"
                      checked={showFavorites}
                      onChange={handleFavoritesToggle}
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
                      onChange={handleSpeciesChange}
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
                    {/* 使用自定義的可搜尋下拉選單，更新 onChange 處理函數 */}
                    <SearchableSelect
                      options={varietiesData || []}
                      value={selectedBreed}
                      onChange={handleBreedChange}
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
                          onChange={(e) => {
                            const newRadius = parseInt(e.target.value)
                            handleFilterUpdate(() => {
                              setSearchRadius(newRadius)
                              if (selectedLocation) {
                                // 查找附近商店
                                const nearby = findNearbyStores(
                                  selectedLocation.lat,
                                  selectedLocation.lng
                                )
                                setNearbyStores(nearby)

                                // 更新地圖標記，保留用戶位置標記，添加商店標記
                                const newMarkers = [
                                  // 用戶選擇的位置
                                  {
                                    lat: selectedLocation.lat,
                                    lng: selectedLocation.lng,
                                    name: '已選擇的位置',
                                    isSelected: true,
                                    id: Date.now(),
                                    isUserLocation:
                                      selectedLocation.isUserLocation || false,
                                  },
                                ]

                                // 將附近商店添加到標記中
                                if (nearby && nearby.length > 0) {
                                  nearby.forEach((store) => {
                                    newMarkers.push({
                                      lat: parseFloat(store.lat),
                                      lng: parseFloat(store.lng),
                                      name: store.name,
                                      description: `${store.address} (${
                                        store.phone
                                      }) - 距離: ${store.distance.toFixed(
                                        2
                                      )} 公里`,
                                      isStore: true,
                                      id: `store-${store.id}`,
                                      distance: store.distance,
                                    })
                                  })
                                }

                                // 更新標記
                                setMapMarkers(newMarkers)
                              }
                            })
                          }}
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
                          handleFilterUpdate(() => {
                            setSelectedLocation(null)
                            setSelectedStoreLocation(null)
                            setMapMarkers([])
                            setNearbyStores([])
                          })
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
              </Col>
              <Col lg={9}>
                {/* 地圖組件 */}
                <MapComponent
                  center={mapCenter}
                  zoom={mapZoom}
                  markers={mapMarkers}
                  onLocationSelect={handleMapLocationSelect}
                  regionName={selectedRegion}
                  showLegend={false}
                  searchRadius={searchRadius}
                  userLocation={selectedLocation}
                  selectedStoreLocation={selectedStoreLocation}
                  pets={
                    selectedStore
                      ? filteredPets.filter(
                          (pet) =>
                            pet.store &&
                            pet.store.id.toString() === selectedStore
                        )
                      : filteredPets.filter((pet) => {
                          if (
                            selectedLocation &&
                            pet.store &&
                            pet.store.lat &&
                            pet.store.lng
                          ) {
                            const distance = calculateDistance(
                              selectedLocation.lat,
                              selectedLocation.lng,
                              parseFloat(pet.store.lat),
                              parseFloat(pet.store.lng)
                            )
                            return distance <= searchRadius
                          }
                          return true
                        })
                  }
                />
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* 根據視圖模式顯示不同內容 */}
      {viewMode === 'map' ? (
        <>
          <MapDrawer
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            searchRadius={searchRadius}
            onRadiusChange={(newRadius) => {
              handleFilterUpdate(() => {
                setSearchRadius(newRadius)
                if (selectedLocation) {
                  // 查找附近商店
                  const nearby = findNearbyStores(
                    selectedLocation.lat,
                    selectedLocation.lng
                  )
                  setNearbyStores(nearby)

                  // 更新地圖標記，保留用戶位置標記，添加商店標記
                  const newMarkers = [
                    // 用戶選擇的位置
                    {
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lng,
                      name: '已選擇的位置',
                      isSelected: true,
                      id: Date.now(),
                      isUserLocation: selectedLocation.isUserLocation || false,
                    },
                  ]

                  // 將附近商店添加到標記中
                  if (nearby && nearby.length > 0) {
                    nearby.forEach((store) => {
                      newMarkers.push({
                        lat: parseFloat(store.lat),
                        lng: parseFloat(store.lng),
                        name: store.name,
                        description: `${store.address} (${
                          store.phone
                        }) - 距離: ${store.distance.toFixed(2)} 公里`,
                        isStore: true,
                        id: `store-${store.id}`,
                        distance: store.distance,
                      })
                    })
                  }

                  // 更新標記
                  setMapMarkers(newMarkers)
                }
              })
            }}
            selectedLocation={selectedLocation}
            onClearLocation={() => {
              handleFilterUpdate(() => {
                setSelectedLocation(null)
                setSelectedStoreLocation(null)
                setMapMarkers([])
                setNearbyStores([])
              })
            }}
            nearbyStores={nearbyStores}
            onNearbyStoreClick={handleNearbyStoreClick}
            getUserLocation={getUserLocation}
            isGettingLocation={isGettingLocation}
            locationError={locationError}
          >
            {/* 進階篩選區塊 */}
            <div className={styles.drawerSection}>
              <h5 className={styles.sectionTitle}>
                <FaSearch /> 進階篩選
              </h5>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>物種</Form.Label>
                  <Form.Select
                    value={selectedSpecies}
                    onChange={handleSpeciesChange}
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
                  <SearchableSelect
                    options={varietiesData || []}
                    value={selectedBreed}
                    onChange={handleBreedChange}
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
                  <Form.Check
                    type="checkbox"
                    label="只顯示已收藏"
                    className="mb-0"
                    checked={showFavorites}
                    onChange={handleFavoritesToggle}
                  />
                </Form.Group>

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
          </MapDrawer>

          {/* 地圖容器 */}
          <div className={styles.fullMapContainer}>
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              markers={mapMarkers}
              onLocationSelect={handleMapLocationSelect}
              regionName={selectedRegion}
              showLegend={true}
              searchRadius={searchRadius}
              userLocation={selectedLocation}
              selectedStoreLocation={selectedStoreLocation}
              pets={
                selectedStore
                  ? filteredPets.filter(
                      (pet) =>
                        pet.store && pet.store.id.toString() === selectedStore
                    )
                  : filteredPets.filter((pet) => {
                      if (
                        selectedLocation &&
                        pet.store &&
                        pet.store.lat &&
                        pet.store.lng
                      ) {
                        const distance = calculateDistance(
                          selectedLocation.lat,
                          selectedLocation.lng,
                          parseFloat(pet.store.lat),
                          parseFloat(pet.store.lng)
                        )
                        return distance <= searchRadius
                      }
                      return true
                    })
              }
            />
          </div>
        </>
      ) : (
        <main>
          <div className={styles.cardSections}>
            {/* 篩選結果區塊 */}
            <div className={styles.searchResultsContainer}>
              <div className={styles.contain_title}>
                <ResultsHeader />
              </div>
              <div className={styles.group}>
                <div className={styles.flexContainer}>
                  {displayPets.length > 0 ? (
                    displayPets.map((pet) => (
                      <Link
                        href={`/pets/${pet.id}`}
                        key={pet.id}
                        className={`${styles.cardLink} ${styles.flexItem}`}
                      >
                        <Card
                          image={
                            pet.main_photo ||
                            pet.photo_url ||
                            (pet.photos && pet.photos.length > 0
                              ? pet.photos[0].photo_url
                              : null) ||
                            pet.image_url ||
                            '/images/default_no_pet.jpg'
                          }
                          title={pet.name}
                          location={pet.location}
                          species={pet.species_name}
                          breed={pet.variety}
                          age={pet.age}
                          gender={pet.gender}
                          className={styles.petCard}
                          variant="pet"
                        >
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

                {/* 載入更多按鈕置中 */}
                {hasMore && (
                  <div className={styles.loadMoreButtonContainer}>
                    <button
                      className={styles.loadMoreButton}
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? '載入中...' : '點擊顯示更多寵物'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 最新上架區塊 */}
            <div className={styles.latestContainer}>
              <div className={styles.contain_title}>
                <h2>最新上架</h2>
              </div>
              <div className={styles.group}>
                <div className={styles.groupBody}>
                  <CardSwitchButton
                    direction="left"
                    onClick={() => scroll(-1, latestRef)}
                    aria-label="向左滑動"
                    className={styles.latestScrollButton}
                  />
                  <div
                    className={`${styles.cardGroup} ${styles.latestCardGroup}`}
                    ref={latestRef}
                  >
                    {latestPets && latestPets.length > 0 ? (
                      latestPets.map((pet) => (
                        <Link
                          href={`/pets/${pet.id}`}
                          key={pet.id}
                          className={`${styles.cardLink} ${styles.flexItem} ${styles.latestCardLink}`}
                        >
                          <Card
                            image={
                              pet.main_photo ||
                              pet.photo_url ||
                              (pet.photos && pet.photos.length > 0
                                ? pet.photos[0].photo_url
                                : null) ||
                              pet.image_url ||
                              '/images/default_no_pet.jpg'
                            }
                            title={pet.name}
                            location={pet.location}
                            species={pet.species_name}
                            breed={pet.variety}
                            age={pet.age}
                            gender={pet.gender}
                            className={`${styles.petCard} ${styles.latestPetCard}`}
                            variant="pet"
                          >
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
                    className={styles.latestScrollButton}
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

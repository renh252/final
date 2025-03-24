'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Button,
  Badge,
  Form,
  Accordion,
  Row,
  Col,
  Card,
  Spinner,
} from 'react-bootstrap'
import {
  Plus,
  Edit,
  Trash,
  Calendar,
  DollarSign,
  Tag,
  Search,
  ShoppingBag,
} from 'lucide-react'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import DataTable from '@/app/admin/_components/DataTable'
import ModalForm from '@/app/admin/_components/ModalForm'
import { useToast } from '@/app/admin/_components/Toast'
import { useConfirm } from '@/app/admin/_components/ConfirmDialog'
import { useTheme } from '@/app/admin/ThemeContext'
import { useAdmin } from '@/app/admin/AdminContext'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/app/admin/_lib/api'
import Cookies from 'js-cookie'

// 促銷活動結構定義
interface Promotion {
  promotion_id: number
  promotion_name: string
  promotion_description: string | null
  start_date: string
  end_date: string | null
  discount_percentage: number
  updated_at: string
  photo: string | null
}

// 促銷商品關聯定義
interface PromotionProduct {
  promotion_product_id: number
  promotion_id: number
  product_id: number | null
  variant_id: number | null
  category_id: number | null
}

// 類別定義
interface Category {
  category_id: number
  category_name: string
  category_tag: string
  category_description: string | null
  parent_id: number | null
}

// 商品定義
interface Product {
  product_id: number
  id?: number // API 可能返回 id 而非 product_id
  product_name: string
  name?: string // API 可能返回 name 而非 product_name
  category_id: number
}

// 格式化日期函數
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch (e) {
    return ''
  }
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  )
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const { admin, hasPermission, checkAuth } = useAdmin()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSubCategoryProducts, setShowSubCategoryProducts] = useState(false)

  // 檢查權限
  useEffect(() => {
    const checkAccess = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }

      if (!hasPermission('shop:promotions:read')) {
        showToast('error', '權限不足', '您沒有權限訪問折扣活動管理頁面')
        router.push('/admin')
        return
      }
    }

    checkAccess()
  }, [checkAuth, hasPermission, router, showToast])

  // 獲取促銷活動數據
  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const token = Cookies.get('admin_token')
      if (!token) {
        showToast('error', '未授權', '請重新登入')
        router.push('/admin/login')
        return
      }

      const response = await fetchApi('/api/admin/shop/promotions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('促銷活動API回應:', response)

      if (response.success && Array.isArray(response.promotions)) {
        setPromotions(response.promotions)
      } else if (response.success && Array.isArray(response.data)) {
        setPromotions(response.data)
      } else if (Array.isArray(response)) {
        setPromotions(response)
      } else if (response.error && response.error.includes('Unknown column')) {
        // 處理數據庫欄位不存在的情況
        console.error('數據庫錯誤:', response.error)
        showToast('error', '數據庫錯誤', '請檢查數據庫結構或聯繫管理員')
      } else {
        console.error('返回的數據格式不正確:', response)
        showToast('error', '錯誤', response.message || '數據格式錯誤')
      }
    } catch (error: any) {
      console.error('獲取促銷活動列表時發生錯誤:', error)
      showToast('error', '錯誤', error.message || '獲取促銷活動列表失敗')
    } finally {
      setLoading(false)
    }
  }

  // 獲取類別列表
  const fetchCategories = async () => {
    try {
      const token = Cookies.get('admin_token')
      if (!token) return

      const response = await fetchApi('/api/admin/shop/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('獲取類別 API 回應:', response)

      if (response.success && Array.isArray(response.categories)) {
        // 顯示原始類別數據的示例
        if (response.categories.length > 0) {
          console.log('API 回傳的類別原始數據示例:', response.categories[0])
        }

        // 標準化類別數據
        const normalizedCategories = response.categories.map((category) => ({
          category_id: category.category_id,
          category_name: category.category_name,
          category_tag: category.category_tag || '',
          category_description: category.category_description || null,
          parent_id: category.parent_id,
        }))

        // 建立類別ID與名稱的對照表
        const categoryMap = {}
        normalizedCategories.forEach((cat) => {
          categoryMap[cat.category_id] = cat.category_name
        })
        console.log('類別ID與名稱對照表:', categoryMap)

        // 列出所有次類別及其父類別
        const subCategories = normalizedCategories.filter(
          (c) => c.parent_id !== null
        )
        console.log(
          '所有次類別:',
          subCategories.map((c) => ({
            id: c.category_id,
            name: c.category_name,
            parent_id: c.parent_id,
            parent_name: categoryMap[c.parent_id] || '未知',
          }))
        )

        setCategories(normalizedCategories)
      } else if (response.success && Array.isArray(response.data)) {
        setCategories(response.data)
      } else if (Array.isArray(response)) {
        setCategories(response)
      }
    } catch (error: any) {
      console.error('獲取類別列表時發生錯誤:', error)
    }
  }

  // 獲取商品列表
  const fetchProducts = async () => {
    try {
      const token = Cookies.get('admin_token')
      if (!token) return

      console.log('正在嘗試獲取商品...')

      // 直接使用 fetch 而不是 fetchApi
      const response = await fetch('/api/admin/shop/products?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log('商品 API 原始回應:', data)

      if (data.success && Array.isArray(data.products)) {
        console.log(`成功獲取 ${data.products.length} 個商品`)
        console.log('首個商品示例:', data.products[0])

        if (data.products.length === 0) {
          console.warn('API 返回了空的商品列表')
          setProducts([])
          return
        }

        // 標準化欄位名稱
        const normalizedProducts = data.products.map((product) => ({
          product_id: product.product_id,
          product_name: product.product_name,
          category_id: product.category_id,
        }))

        // 列出商品分類統計
        const categoryCount = {}
        normalizedProducts.forEach((p) => {
          if (!categoryCount[p.category_id]) categoryCount[p.category_id] = 0
          categoryCount[p.category_id]++
        })
        console.log('各類別商品數量:', categoryCount)

        setProducts(normalizedProducts)
      } else {
        console.error('API 返回的數據格式不符合預期:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('獲取商品列表時發生錯誤:', error)
      showToast('error', '錯誤', '獲取商品列表失敗，請檢查控制台')
      setProducts([])
    }
  }

  // 獲取促銷活動關聯商品
  const fetchPromotionProducts = async (promotionId: number) => {
    try {
      const token = Cookies.get('admin_token')
      if (!token) return { products: [], categories: [] }

      const response = await fetchApi(
        `/api/admin/shop/promotions/${promotionId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('獲取促銷商品API回應:', response)

      // 處理新API格式的回應
      if (response.success && response.data) {
        const {
          products = [],
          categories = [],
          allCategories = [],
          popularProducts = [],
        } = response.data

        // 如果API返回了所有可用類別，更新本地狀態
        if (allCategories.length > 0) {
          setCategories(allCategories)
        }

        // 如果API返回了熱門商品，更新產品列表
        if (popularProducts.length > 0 && products.length === 0) {
          setFilteredProducts(popularProducts)
        }

        console.log(
          `取得促銷商品: ${products.length} 個, 類別: ${categories.length} 個`
        )
        console.log(
          `可用類別: ${allCategories.length} 個, 熱門商品: ${popularProducts.length} 個`
        )

        return { products, categories }
      }

      // 向後兼容舊格式
      if (response.success && Array.isArray(response.products)) {
        console.log('取得促銷商品數據 (舊格式):', response.products.length || 0)

        // 分離產品和類別
        const products = response.products.filter(
          (item) => item.product_id !== null
        )
        const categories = response.products.filter(
          (item) => item.category_id !== null
        )

        return { products, categories }
      } else if (Array.isArray(response)) {
        console.log('取得促銷商品數據 (純陣列):', response.length || 0)

        // 分離產品和類別
        const products = response.filter((item) => item.product_id !== null)
        const categories = response.filter((item) => item.category_id !== null)

        return { products, categories }
      }

      // 若都不符合，記錄原始回應並返回空結果
      console.log('API回應格式異常:', response)
      return { products: [], categories: [] }
    } catch (error: any) {
      console.error('獲取關聯商品時發生錯誤:', error)
      showToast('error', '錯誤', '無法獲取促銷活動關聯商品列表')
      return { products: [], categories: [] }
    }
  }

  // 初始化數據
  useEffect(() => {
    fetchPromotions()
    fetchCategories()
    fetchProducts()
  }, [])

  // 處理新增促銷活動
  const handleAddPromotion = () => {
    setCurrentPromotion(null)
    setSelectedProducts([])
    setSelectedCategories([])
    setModalMode('add')
    setShowModal(true)
  }

  // 處理編輯促銷活動
  const handleEditPromotion = async (promotion: Promotion) => {
    try {
      // 先設置當前選中的促銷活動
      setCurrentPromotion(promotion)
    setModalMode('edit')

      // 清空已選商品和類別
      setSelectedProducts([])
      setSelectedCategories([])

      // 顯示模態窗口
    setShowModal(true)
    } catch (error) {
      console.error('獲取促銷活動關聯數據時發生錯誤:', error)
      showToast('error', '錯誤', '無法獲取促銷活動關聯數據')
    }
  }

  // 處理刪除促銷活動
  const handleDeletePromotion = (promotion: Promotion) => {
    confirm({
      title: '刪除促銷活動',
      message: `確定要刪除促銷活動「${promotion.promotion_name}」嗎？此操作無法撤銷。`,
      type: 'danger',
      confirmText: '刪除',
      onConfirm: async () => {
        try {
          setLoading(true)
          const token = Cookies.get('admin_token')
          if (!token) return

          const response = await fetchApi(
            `/api/admin/shop/promotions/${promotion.promotion_id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.success) {
            setPromotions((prev) =>
              prev.filter((p) => p.promotion_id !== promotion.promotion_id)
            )
            showToast(
              'success',
              '刪除成功',
              `促銷活動「${promotion.promotion_name}」已成功刪除`
            )
          } else {
            throw new Error(response.message || '刪除促銷活動失敗')
          }
        } catch (error: any) {
          console.error('刪除促銷活動時發生錯誤:', error)
          showToast('error', '刪除失敗', error.message || '刪除促銷活動失敗')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // 打開管理商品模態框
  const handleManageProducts = async (promotion: Promotion) => {
    setCurrentPromotion(promotion)

    // 先清空選擇，等待API回應
    setSelectedProducts([])
    setSelectedCategories([])
    setSearchQuery('')

    // 記錄當前商品和類別的對應關係
    console.log('次類別商品對應關係檢查:')
    categories
      .filter((c) => c.parent_id !== null)
      .forEach((subCategory) => {
        const productsInCategory = products.filter(
          (p) => String(p.category_id) === String(subCategory.category_id)
        )
        console.log(
          `次類別「${subCategory.category_name}」(ID: ${subCategory.category_id}) 下有 ${productsInCategory.length} 個商品`
        )
        if (productsInCategory.length > 0) {
          console.log('範例商品:', productsInCategory[0])
        }
      })

    // 開啟模態窗
    setShowProductsModal(true)

    try {
      // 獲取關聯的產品和類別
      const { products, categories } = await fetchPromotionProducts(
        promotion.promotion_id
      )

      console.log('獲取到的關聯數據:', {
        products: products.length,
        categories: categories.length,
      })

      // 設置已選商品
      const selectedProductIds = products
        .filter(
          (item) => item.product_id !== null && item.product_id !== undefined
        )
        .map((item) => item.product_id as number)

      // 設置已選類別
      const selectedCategoryIds = categories
        .filter(
          (item) => item.category_id !== null && item.category_id !== undefined
        )
        .map((item) => item.category_id as number)

      setSelectedProducts(selectedProductIds)
      setSelectedCategories(selectedCategoryIds)

      console.log(
        `設置已選商品: ${selectedProductIds.length}, 已選類別: ${selectedCategoryIds.length}`
      )
    } catch (error) {
      console.error('獲取促銷活動關聯產品時發生錯誤:', error)
      showToast('error', '錯誤', '無法獲取關聯產品，但您仍可以添加新關聯')
    }
  }

  // 處理提交促銷活動表單
  const handleSubmitPromotion = async (formData: Record<string, any>) => {
    try {
      setLoading(true)
      const token = Cookies.get('admin_token')
      if (!token) return

      // 確保日期格式正確
      let startDate: string | null = null
      let endDate: string | null = null

      try {
        // 處理開始日期
        if (formData.start_date) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(formData.start_date)) {
            startDate = formData.start_date
          } else {
            const date = new Date(formData.start_date)
            if (!isNaN(date.getTime())) {
              startDate = date.toISOString().split('T')[0]
            } else {
              startDate = new Date().toISOString().split('T')[0]
            }
          }
        } else {
          startDate = new Date().toISOString().split('T')[0]
        }

        // 處理結束日期
        if (formData.end_date) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(formData.end_date)) {
            endDate = formData.end_date
          } else {
            const date = new Date(formData.end_date)
            if (!isNaN(date.getTime())) {
              endDate = date.toISOString().split('T')[0]
            } else {
              endDate = null
            }
          }
        } else {
          endDate = null
        }
      } catch (dateError) {
        console.error('日期格式化錯誤:', dateError)
        showToast('error', '日期格式錯誤', '請確保日期格式正確')
        setLoading(false)
        return
      }

      // 確保數據格式正確
      const promotionData = {
        promotion_name: formData.promotion_name,
        promotion_description: formData.promotion_description || '',
        start_date: startDate,
        end_date: endDate,
        discount_percentage: Number(formData.discount_percentage) || 0,
        photo: formData.photo || null,
      }

      console.log('準備提交促銷活動數據:', promotionData)

      let response

      if (modalMode === 'add') {
        // 創建新的促銷活動
        response = await fetchApi('/api/admin/shop/promotions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promotionData),
        })

        if (response.success) {
    showToast(
      'success',
            '新增成功',
            `促銷活動「${formData.promotion_name}」已成功新增`
          )
          fetchPromotions() // 重新獲取列表
        } else {
          throw new Error(response.message || '新增促銷活動失敗')
        }
      } else {
        // 更新現有促銷活動
        if (!currentPromotion || !currentPromotion.promotion_id) {
          throw new Error('缺少促銷活動ID，無法更新')
        }

        console.log(`準備更新促銷活動ID: ${currentPromotion.promotion_id}`)

        response = await fetchApi(
          `/api/admin/shop/promotions/${currentPromotion.promotion_id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(promotionData),
          }
        )

        console.log('更新促銷活動API回應:', response)

        if (response.success) {
          showToast(
            'success',
            '更新成功',
            `促銷活動「${formData.promotion_name}」已成功更新`
          )
          fetchPromotions() // 重新獲取列表
        } else {
          throw new Error(response.message || '更新折扣活動失敗')
        }
      }

      setShowModal(false)
    } catch (error: any) {
      console.error('提交促銷活動表單時發生錯誤:', error)
      showToast('error', '提交失敗', error.message || '提交促銷活動表單失敗')
    } finally {
      setLoading(false)
    }
  }

  // 處理提交商品關聯
  const handleSubmitProducts = async () => {
    if (!currentPromotion) return

    try {
    setLoading(true)
      const token = Cookies.get('admin_token')
      if (!token) return

      // 構建關聯數據
      const productsData = selectedProducts.map((productId) => ({
        product_id: productId,
        category_id: null,
      }))

      const categoriesData = selectedCategories.map((categoryId) => ({
        product_id: null,
        category_id: categoryId,
      }))

      const productRelations = [...productsData, ...categoriesData]

      console.log('提交產品關聯數據:', {
        selectedProducts: selectedProducts.length,
        selectedCategories: selectedCategories.length,
        totalRelations: productRelations.length,
      })

      // 提交關聯數據
      const response = await fetchApi(
        `/api/admin/shop/promotions/${currentPromotion.promotion_id}/products`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productRelations }),
        }
      )

      if (response.success) {
        showToast(
          'success',
          '更新成功',
          `促銷活動「${currentPromotion.promotion_name}」的關聯商品已成功更新`
        )
        setShowProductsModal(false)
      } else {
        throw new Error(response.message || '更新關聯商品失敗')
      }
    } catch (error: any) {
      console.error('提交關聯商品時發生錯誤:', error)
      showToast('error', '提交失敗', error.message || '提交關聯商品失敗')
    } finally {
    setLoading(false)
    }
  }

  // 處理商品選擇
  const handleProductSelect = (productId: number | null | undefined) => {
    if (!productId) {
      console.warn('嘗試選擇無效的商品ID:', productId)
      return
    }

    if (selectedProducts.includes(productId)) {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    } else {
      setSelectedProducts((prev) => [...prev, productId])
    }
  }

  // 處理類別選擇
  const handleCategorySelect = (categoryId: number | null | undefined) => {
    if (!categoryId) {
      console.warn('嘗試選擇無效的類別ID:', categoryId)
      return
    }

    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
    } else {
      setSelectedCategories((prev) => [...prev, categoryId])
    }
  }

  // 處理選擇/取消選擇類別下的所有商品
  const handleSelectAllProductsInCategory = (
    categoryId: number,
    isSelected: boolean
  ) => {
    if (!categoryId) return

    // 找到對應的次類別
    const subCategory = categories.find((cat) => cat.category_id === categoryId)
    if (!subCategory) {
      console.warn('找不到對應的類別:', categoryId)
        return
      }

    // 獲取該類別下的所有商品ID
    const productsInCategory = getProductsForSubCategory(subCategory).map(
      (product) => product.product_id
    )

    console.log(
      `類別 ${categoryId} (${subCategory.category_name}) 下找到 ${productsInCategory.length} 個商品可選擇`
    )

    if (productsInCategory.length === 0) {
      console.log('警告: 此類別下沒有找到商品')
      return
    }

    if (isSelected) {
      // 添加所有該類別下的商品
      setSelectedProducts((prev) => {
        const newSelection = [...prev]
        productsInCategory.forEach((productId) => {
          if (!newSelection.includes(productId)) {
            newSelection.push(productId)
          }
        })
        return newSelection
      })
    } else {
      // 移除該類別下的所有商品
      setSelectedProducts((prev) =>
        prev.filter((id) => !productsInCategory.includes(id))
      )
    }
  }

  // 獲取次類別下的商品（包括父類別關聯的商品）
  const getProductsForSubCategory = (subCategory) => {
    console.log(
      `獲取次類別 ${subCategory.category_name} (ID: ${subCategory.category_id}) 的商品`
    )
    console.log(`目前共有 ${products.length} 個商品可用`)

    // 直接匹配該次類別的商品
    let productsInCategory = products.filter((product) => {
      // 使用寬鬆比較(==)確保即使類型不同也能匹配
      return product.category_id == subCategory.category_id
    })

    console.log(
      `次類別 ${subCategory.category_id} 直接關聯的商品數: ${productsInCategory.length}`
    )

    // 如果啟用了父類別繼承，並且該次類別屬於某個主類別
    if (showSubCategoryProducts && subCategory.parent_id) {
      // 獲取父類別關聯的商品
      const parentProducts = products.filter((product) => {
        return product.category_id == subCategory.parent_id
      })

      console.log(
        `父類別 ${subCategory.parent_id} 直接關聯的商品數: ${parentProducts.length}`
      )

      // 合併次類別和父類別的商品
      productsInCategory = [...productsInCategory, ...parentProducts]
      console.log(`合併後總商品數: ${productsInCategory.length}`)
    }

    return productsInCategory
  }

  // 搜索商品
  const handleSearchProducts = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    setSearchLoading(true)

    try {
      // 如果有促銷活動ID，使用API搜索
      if (currentPromotion) {
        const token = Cookies.get('admin_token')
        if (!token) return

        const response = await fetchApi(
          `/api/admin/shop/promotions/${
            currentPromotion.promotion_id
          }/products?type=product&query=${encodeURIComponent(searchQuery)}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.success && response.data) {
          setFilteredProducts(response.data)
        } else {
          // 如果API搜索失敗，回退到本地搜索
          localSearchProducts()
        }
      } else {
        // 沒有促銷活動ID，使用本地搜索
        localSearchProducts()
      }
    } catch (error) {
      console.error('搜索商品時發生錯誤:', error)
      // 出錯時回退到本地搜索
      localSearchProducts()
    } finally {
      setSearchLoading(false)
    }
  }

  // 本地搜索商品
  const localSearchProducts = () => {
    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter((product) =>
      product.product_name.toLowerCase().includes(query)
    )
    setFilteredProducts(filtered)
  }

  // 每當products變化或modal開啟時，重置filteredProducts
  useEffect(() => {
    setFilteredProducts(products)
  }, [products, showProductsModal])

  // 在搜索框中輸入時更新查詢
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)

    // 如果清空了搜索框，直接顯示所有商品
    if (!e.target.value.trim()) {
      setFilteredProducts(products)
    }
  }

  // 表格列定義
  const columns = [
    {
      key: 'promotion_id',
      label: 'ID',
      sortable: true,
      render: (value: number) => value || '-',
    },
    {
      key: 'promotion_name',
      label: '活動名稱',
      sortable: true,
      render: (value: string) => value || '-',
    },
    {
      key: 'discount_percentage',
      label: '折扣百分比',
      sortable: true,
      render: (value: number) => {
        if (value === undefined || value === null) return '0%'
            return `${value}%`
      },
    },
    {
      key: 'start_date',
      label: '開始日期',
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString('zh-TW') : '-',
    },
    {
      key: 'end_date',
      label: '結束日期',
      sortable: true,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString('zh-TW') : '永久有效',
    },
    {
      key: 'status',
      label: '狀態',
      sortable: true,
      render: (value: string, row: Promotion) => {
        if (!row.start_date) return <Badge bg="secondary">未知</Badge>

        try {
          const now = new Date()
          const startDate = new Date(row.start_date)
          const endDate = row.end_date ? new Date(row.end_date) : null

          if (startDate > now) {
            return <Badge bg="info">未開始</Badge>
          } else if (endDate && endDate < now) {
            return <Badge bg="danger">已過期</Badge>
          } else {
            return <Badge bg="success">進行中</Badge>
          }
        } catch (e) {
          return <Badge bg="secondary">日期錯誤</Badge>
        }
      },
    },
  ]

  // 渲染操作按鈕
  const renderActions = (promotion: Promotion) => (
    <div className="d-flex gap-1">
      <Button
        variant="light"
        size="sm"
        title="管理商品"
        onClick={() => handleManageProducts(promotion)}
      >
        <ShoppingBag size={16} className="text-primary" />
      </Button>
      <Button
        variant="light"
        size="sm"
        title="編輯"
        onClick={() => handleEditPromotion(promotion)}
      >
        <Edit size={16} className="text-primary" />
      </Button>
      <Button
        variant="light"
        size="sm"
        title="刪除"
        onClick={() => handleDeletePromotion(promotion)}
      >
        <Trash size={16} className="text-danger" />
      </Button>
    </div>
  )

  // 促銷活動統計
  const promotionStats = [
    {
      title: '進行中活動',
      count: promotions.filter((p) => {
        if (!p.start_date) return false
        try {
          const now = new Date()
          const startDate = new Date(p.start_date)
          const endDate = p.end_date ? new Date(p.end_date) : null

          return startDate <= now && (!endDate || endDate >= now)
        } catch (e) {
          return false
        }
      }).length,
      color: 'success',
      icon: <Tag size={24} />,
    },
    {
      title: '即將開始活動',
      count: promotions.filter((p) => {
        if (!p.start_date) return false
        try {
          const now = new Date()
          const startDate = new Date(p.start_date)

          return startDate > now
        } catch (e) {
          return false
        }
      }).length,
      color: 'info',
      icon: <Calendar size={24} />,
    },
    {
      title: '已過期活動',
      count: promotions.filter((p) => {
        if (!p.end_date) return false
        try {
          const now = new Date()
          const endDate = new Date(p.end_date)

          return endDate < now
        } catch (e) {
          return false
        }
      }).length,
      color: 'danger',
      icon: <Calendar size={24} />,
    },
    {
      title: '平均折扣',
      count: `${Math.round(
        promotions
          .filter(
            (p) =>
              p.discount_percentage !== undefined &&
              p.discount_percentage !== null
          )
          .reduce((acc, p) => acc + (p.discount_percentage || 0), 0) /
          (promotions.filter(
            (p) =>
              p.discount_percentage !== undefined &&
              p.discount_percentage !== null
          ).length || 1)
      )}%`,
      color: 'primary',
      icon: <DollarSign size={24} />,
    },
  ]

  // 定義表單字段
  const formFields = useMemo(() => {
    console.log('重新計算formFields')

    // 如果沒有當前選中的促銷活動，返回包含預設值的欄位定義
    if (!currentPromotion) {
      return [
        {
          name: 'promotion_name',
      label: '活動名稱',
      type: 'text',
      required: true,
          placeholder: '例如: 新會員首購優惠',
          value: '',
    },
    {
          name: 'promotion_description',
      label: '活動描述',
      type: 'textarea',
          placeholder: '簡述活動內容',
          value: '',
        },
        {
          name: 'discount_percentage',
          label: '折扣百分比',
          type: 'number',
      required: true,
          placeholder: '例如: 20表示8折(打8折)',
          value: 0,
        },
        {
          name: 'start_date',
          label: '開始日期',
          type: 'date',
      required: true,
          value: '',
        },
        {
          name: 'end_date',
          label: '結束日期',
          type: 'date',
          placeholder: '不填寫表示永久有效',
          value: '',
        },
        {
          name: 'photo',
          label: '活動圖片',
          type: 'text',
          placeholder: '圖片URL，不填寫使用預設圖片',
          value: '',
        },
      ]
    }

    // 如果有當前選中的促銷活動，返回包含當前值的欄位定義
    return [
      {
        name: 'promotion_name',
        label: '活動名稱',
        type: 'text',
        required: true,
        placeholder: '例如: 新會員首購優惠',
        value: currentPromotion.promotion_name || '',
      },
      {
        name: 'promotion_description',
        label: '活動描述',
        type: 'textarea',
        placeholder: '簡述活動內容',
        value: currentPromotion.promotion_description || '',
      },
      {
        name: 'discount_percentage',
        label: '折扣百分比',
        type: 'number',
        required: true,
        placeholder: '例如: 20表示8折(打8折)',
        value: currentPromotion.discount_percentage || 0,
    },
    {
      name: 'start_date',
      label: '開始日期',
      type: 'date',
      required: true,
        value: currentPromotion.start_date || '',
    },
    {
      name: 'end_date',
      label: '結束日期',
      type: 'date',
        placeholder: '不填寫表示永久有效',
        value: currentPromotion.end_date || '',
      },
      {
        name: 'photo',
        label: '活動圖片',
      type: 'text',
        placeholder: '圖片URL，不填寫使用預設圖片',
        value: currentPromotion.photo || '',
      },
    ]
  }, [currentPromotion ? currentPromotion.promotion_id : null])

  return (
    <AdminPageLayout title="折扣活動管理" stats={promotionStats}>
      <div className="mb-4">
        <AdminSection title="活動統計">
          <div className="row">
            {promotionStats.map((stat, index) => (
              <div key={`stat-${index}`} className="col-md-3 mb-3">
                <AdminCard>
                  <div className="d-flex align-items-center">
                    <div
                      className={`me-3 rounded p-3 bg-${stat.color} bg-opacity-10`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h6 className="mb-0">{stat.title}</h6>
                      <h3 className="mb-0">{stat.count}</h3>
                    </div>
                  </div>
                </AdminCard>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <AdminSection
        title="折扣活動列表"
        actions={
          hasPermission('shop:promotions:create') && (
            <Button variant="primary" onClick={handleAddPromotion}>
              <Plus size={16} className="me-1" />
              新增折扣活動
            </Button>
          )
        }
      >
        <DataTable
          columns={columns}
          data={promotions}
          actions={renderActions}
          loading={loading}
          searchable={true}
          searchKeys={['promotion_name', 'promotion_description']}
          itemsPerPage={10}
        />
      </AdminSection>

      {/* 促銷活動編輯/新增表單 */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'add' ? '新增促銷活動' : '編輯促銷活動'}
        fields={formFields}
        onSubmit={handleSubmitPromotion}
      />

      {/* 商品管理模態框 */}
      <ModalForm
        show={showProductsModal}
        onHide={() => setShowProductsModal(false)}
        title={`管理「${currentPromotion?.promotion_name || ''}」的關聯商品`}
        size="lg"
        fields={[]}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowProductsModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitProducts}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  處理中...
                </>
              ) : (
                '保存關聯'
              )}
            </Button>
          </>
        }
      >
        <div className="mb-4">
          <h5>選擇商品類別</h5>
          <p className="text-muted small">
            選擇類別後，該類別下的所有商品都將享受此促銷活動優惠
          </p>

          <div className="d-flex mb-2 justify-content-between">
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="搜尋類別..."
                className="me-2"
              />
              <Button variant="outline-secondary">
                <Search size={16} />
              </Button>
            </div>

            <Form.Check
              type="switch"
              id="show-parent-products"
              label="顯示從主類別繼承的商品"
              checked={showSubCategoryProducts}
              onChange={(e) => setShowSubCategoryProducts(e.target.checked)}
              className="ms-3"
            />
          </div>

          <Accordion key="product-categories-accordion">
            {categories
              .filter((category) => category.parent_id === null)
              .map((category, parentIndex) => (
                <Accordion.Item
                  key={`parent-cat-${
                    category.category_id || `parent-${parentIndex}`
                  }`}
                  eventKey={`cat-${
                    category.category_id || `parent-${parentIndex}`
                  }`}
                >
                  <Accordion.Header>
                    <Form.Check
                      type="checkbox"
                      id={`parent-check-${
                        category.category_id || `parent-${parentIndex}`
                      }`}
                      label={category.category_name || '未命名類別'}
                      checked={selectedCategories.includes(
                        category.category_id
                      )}
                      onChange={() =>
                        handleCategorySelect(category.category_id)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="me-2"
                    />
                  </Accordion.Header>
                  <Accordion.Body>
                    {categories
                      .filter(
                        (subCat) => subCat.parent_id === category.category_id
                      )
                      .map((subCategory, index) => (
                        <div
                          key={`sub-cat-${subCategory.category_id}`}
                          className="mb-2"
                        >
                          <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                <div className="d-flex align-items-center w-100">
                                  <Form.Check
                                    type="checkbox"
                                    id={`sub-check-${subCategory.category_id}`}
                                    label={
                                      subCategory.category_name || '未命名類別'
                                    }
                                    checked={selectedCategories.includes(
                                      subCategory.category_id
                                    )}
                                    onChange={() =>
                                      handleCategorySelect(
                                        subCategory.category_id
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="me-auto"
                                  />
                                  <span className="ms-2 badge bg-secondary">
                                    {(() => {
                                      // 使用新函數獲取商品數量
                                      const count =
                                        getProductsForSubCategory(
                                          subCategory
                                        ).length
                                      return count
                                    })()}{' '}
                                    個商品
                                  </span>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body className="py-2">
                                <div className="d-flex justify-content-end mb-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                      handleSelectAllProductsInCategory(
                                        subCategory.category_id,
                                        true
                                      )
                                    }
                                  >
                                    全選商品
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="ms-1"
                                    onClick={() =>
                                      handleSelectAllProductsInCategory(
                                        subCategory.category_id,
                                        false
                                      )
                                    }
                                  >
                                    取消全選
                                  </Button>
                                </div>
                                {(() => {
                                  // 使用新的函數獲取商品
                                  const productsInCategory =
                                    getProductsForSubCategory(subCategory)

                                  console.log(
                                    `顯示次類別「${subCategory.category_name}」(ID:${subCategory.category_id})商品:`,
                                    {
                                      商品總數: products.length,
                                      此類別商品數: productsInCategory.length,
                                      顯示父類別商品: showSubCategoryProducts,
                                    }
                                  )

                                  if (productsInCategory.length === 0) {
                                    return (
                                      <p className="text-muted text-center py-1 small">
                                        此類別下沒有直接關聯的商品
                                      </p>
                                    )
                                  }

                                  return productsInCategory.map(
                                    (product, productIndex) => (
                                      <div
                                        key={`sub-product-${product.product_id}`}
                                        className="ms-3 mb-1"
                                      >
                                        <Form.Check
                                          type="checkbox"
                                          id={`product-${product.product_id}`}
                                          label={
                                            product.product_name || '未命名商品'
                                          }
                                          checked={selectedProducts.includes(
                                            product.product_id
                                          )}
                                          onChange={() =>
                                            handleProductSelect(
                                              product.product_id
                                            )
                                          }
                                        />
                                      </div>
                                    )
                                  )
                                })()}
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </div>
                      ))}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        </div>

        <hr />

        <div>
          <h5>選擇個別商品</h5>
          <p className="text-muted small">您可以選擇個別商品套用此促銷活動</p>

          <form onSubmit={handleSearchProducts} className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="搜尋商品..."
              className="me-2"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button
              variant="outline-secondary"
              type="submit"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Search size={16} />
              )}
            </Button>
          </form>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={`product-${product.product_id || `prod-${index}`}`}
                  className="mb-2"
                >
                  <Form.Check
                    type="checkbox"
                    id={`prod-${product.product_id || `prod-${index}`}`}
                    label={product.product_name || '未命名商品'}
                    checked={selectedProducts.includes(product.product_id)}
                    onChange={() => handleProductSelect(product.product_id)}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-3">
                {searchQuery.trim()
                  ? '沒有找到符合搜尋條件的商品'
                  : '沒有可用的商品'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 p-2 bg-light rounded">
          <div className="d-flex justify-content-between">
            <div>
              <strong>已選擇：</strong>
              <Badge bg="info" className="me-1">
                {selectedCategories.length} 個類別
              </Badge>
              <Badge bg="primary">{selectedProducts.length} 個商品</Badge>
            </div>
          </div>
        </div>
      </ModalForm>
    </AdminPageLayout>
  )
}

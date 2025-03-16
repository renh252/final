'use client'

import React, {useRef} from 'react'
import Link from 'next/link'

// product_menu
import ProductMenu from '@/app/shop/_components/productMenu'
// style
import styles from '@/app/shop/shop.module.css'
import categories_styles from '../categories.module.css'
// components
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaArrowLeft,FaRegHeart,FaHeart } from "react-icons/fa";
import { useParams } from 'next/navigation'
import {Breadcrumbs} from '@/app/_components/breadcrumbs'
// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())


export default function PagesProductTitle() {
  // 從網址上得到動態路由參數
  const params = useParams()
  const cid_parent = params?.cidParent
  

  
  // card愛心狀態
/*  const initState = Products.map((v) => {
    return { ...v, fav: false }
  })
  const [products, setproducts] = useState(initState)  
  const onToggleFav = (product_id) => {
    const nextProduct = products.map((v) => {
      if (v.id == product_id) {
        return { ...v, fav: !v.fav }
      } else {
        return v
      }
    })
    setproducts(nextProduct)
  }
  */


  // 卡片滑動-------------------------------
  const categoryRefs = useRef({})

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

   // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>


  
  const categories = data.categories
  const products = data.products
  
  // 檢查是否存在 category_id 等於 cid_parent 的類別
  const currentCategory = categories.find(category => category.category_id == cid_parent);
  // 檢查是否有子類別（其他類別的 parent_id 等於 cid_parent）
  const childCategories = categories.filter(category => category.parent_id == cid_parent);
  // const product_like = data.product_like

  // -----------------


  return (
    
    <>
    <div className={categories_styles.main}>
      {currentCategory && childCategories.length > 0 
      ? (
        <>
        <Breadcrumbs
            title={currentCategory.category_name}
            items={[
              { label: '商城', href: `/shop` },
              { label: currentCategory.category_name, href: `/shop/categories/${cid_parent}` }
            ]}
          />

        <div className={categories_styles.container}>
          <div className="productMenu">
            <ProductMenu/>
          </div>
            <div className={categories_styles.contain_body}>
                {/* subTitle */}
                {categories.filter((category) => category.parent_id == cid_parent).map((category) => (
                  <div className={styles.group} key={category.category_id}>
                    <div className={styles.groupTitle}>
                      <p>{category.category_name}</p>
                    </div>
                    <div className={styles.groupBody}>
                      <CardSwitchButton
                        direction="left"
                        onClick={() => scroll(-1, categoryRefs.current[category.category_id])}
                        aria-label="向左滑動"
                      />
                      <div className={styles.cardGroup} ref={(el) => (categoryRefs.current[category.category_id] = { current: el })}>
                        {products.filter((product) => product.category_id == category.category_id).map((product) => {
                          return(
                            <Link key={product.	product_id} href={`/shop/${product.product_id}`}>
                              <Card
                                image={product.image_url || '/images/default_no_pet.jpg'}
                                title={product.product_name}
                              >
                                <div className={styles.cardText}>
                                  <p>${product.price} <del>${product.price}</del></p>
                                  <button className={styles.likeButton} onClick={(event)=>{     
                                    event.preventDefault();
                                    event.stopPropagation();
                                    // onToggleFav(product.id)
                                    }}>
                                    {product.fav ? <FaHeart/> : <FaRegHeart/>}
                                  </button>
                                </div>
                              </Card>
                            </Link>
                          )
                        })}
                      </div>
                      
                      
                      <CardSwitchButton
                        direction="right"
                        onClick={() => scroll(1, categoryRefs.current[category.category_id])}
                        aria-label="向左滑動"
                      />
                    </div>
                  </div>
                ))}
            </div>
        </div>
      </>)
      :(
        <div className={categories_styles.noCategory}>
          <Link href='/shop'>
            <div><FaArrowLeft/>返回商城</div>
          </Link>
          <p>查無此類別</p>
        </div>
      )
      }
    </div>
    </>
  )
}

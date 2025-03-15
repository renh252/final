'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// styles
import styles from './pid.module.css'
import shopStyles from '@/app/shop/shop.module.css'
import { FaShareNodes } from 'react-icons/fa6'
import { FaRegStar } from 'react-icons/fa6'
import { IoChatboxEllipsesOutline } from 'react-icons/io5'
import { FaCartShopping } from 'react-icons/fa6'
import { FaPlus, FaMinus } from 'react-icons/fa6'
import { IoCheckmarkDoneSharp } from 'react-icons/io5'
import { FaUser } from 'react-icons/fa' 
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

// components
import { IconLine_lg } from '@/app/shop/_components/icon_line'
// card
import Card from '@/app/_components/ui/Card'
import CardSwitchButton from '@/app/_components/ui/CardSwitchButton'
import { FaRegHeart, FaHeart } from 'react-icons/fa'

// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PidPage() {
  const [count, setCount] = useState(1)
  if (count < 1) {
    setCount(1)
  }

  // 從網址上得到動態路由參數
  const params = useParams()
  const pid = params?.pid

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR(`/api/shop/${pid}`, fetcher)

  // 卡片滑動-------------------------------
  const categoryRefs = useRef(null)

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

// 选择商品规格
const [selectedVariant, setSelectedVariant] = useState(null)

useEffect(() => {
  if (data?.variants && data.variants.length > 0) {
    setSelectedVariant(data.variants[0])
  }
}, [data])

const handleVariantClick = (variant) => {
  setSelectedVariant(variant)}

// 商品價格
const calculateDisplayPrice = () => {
  let basePrice = selectedVariant ? selectedVariant.price : product.price
  let discountedPrice = basePrice

  if (promotion && promotion.length > 0) {
    discountedPrice = Math.floor(basePrice * (1 - Number(promotion[0]?.discount_percentage) / 100))
  }

  return { 
    basePrice: Math.floor(basePrice), 
    discountedPrice: Math.floor(discountedPrice) 
  }
}

  // 新增一個 state 來存儲當前顯示的圖片 URL  
  const [currentImage, setCurrentImage] = useState('/images/default_no_pet.jpg')
  useEffect(() => {
    if (data?.product?.image_url) {
      setCurrentImage(data.product.image_url)
    }
  }, [data])
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl)
  }

  // 
  const reviewRef = useRef(null)
  const scrollToReviewRef = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ----------------------------

  // 处理加载状态
  if (!data) return <div>Loading...</div>

  // 处理错误状态
  if (error) return <div>Failed to load</div>

  // 获取 promotions 数据

  let {
    product,
    product_imgs,
    promotion,
    variants,
    reviews,
    reviewCount,
    categories,
    similarProducts
  } = data

  
  // ------------------------


  // 检查是否有自定义图片
  const hasCustomImages = Boolean(
    (product_imgs && product_imgs.length > 0) ||
      product?.image_url ||
      (variants && variants.some((variant) => variant.image_url))
  )

  // 创建一个数组来存储所有有效的图片 URL
  const productImages = [
    product.image_url, // 主图片
    product_imgs?.product_img1,
    product_imgs?.product_img2,
    product_imgs?.product_img3,
    product_imgs?.product_img4
  ].filter(Boolean); // 过滤掉 null, undefined 或空字符串


  return (
    <main className={styles.main}>
      <div className={styles.row}>
        <div className={styles.imgs}>
          <div className={styles.imgContainer}>
            <Image
              src={currentImage}
              alt='Product Image'
              width={600}
              height={600}
            />
            <p>{}</p>
          </div>

          {hasCustomImages ? (
            <div className={styles.imgsBottom}>
            <button>
              <FaAngleLeft />
            </button>
              <div className={styles.img_group}>
              {productImages.map((imgUrl, index) => (
                <button 
                  className={styles.imgs_item} 
                  key={`product-img-${index}`}
                  onClick={() => handleImageClick(imgUrl)}
                >
                  <Image
                    src={imgUrl}
                    alt={`Product image ${index + 1}`}
                    width={100}
                    height={100}
                  />
                </button>
              ))}
                {variants?.map((variant, index) => (variant.image_url && 
                  (<button className={styles.imgs_item} key={variant.variant_id}
                  onClick={() => handleImageClick(variant.image_url)}>
                    <Image
                      key={`v${index}`}
                      src={variant.image_url}
                      alt={variant.variant_name}
                      width={100}
                      height={100}
                    />
                    {/* <p>{variant.variant_name}</p> */}
                  </button>)
                ))}
                {product_imgs?.map((img, index) => (
                  <button className={styles.imgs_item} key={pid}
                  onClick={() => handleImageClick(img.image_url)}>
                    <Image
                      key={`imgs${index}`}
                      src={img.image_url}
                      alt={`image ${index + 1}`}
                      width={100}
                      height={100}
                    />
                  </button>
                ))}
              </div>
              <button>
                <FaAngleRight />
              </button>
            </div>
          ) : (
            <div className={styles.img_group}>
              <div className={styles.imgs_item} key={pid}>
                <Image
                  src="/images/default_no_pet.jpg"
                  alt="Default product image"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <div>
            <p className={styles.h3}>{product.product_name}</p>
            <div className={styles.iconGroup}>
              <div className={styles.comment}>
                庫存:{product.stock_quantity}
              </div>
              <div className={styles.comment}>
                <FaRegHeart />
              </div>
              {/* <div className={styles.comment}>
                <FaShareNodes />
              </div> */}
            </div>
          </div>
          <hr />
          <div>
            <div className={styles.priceGroup}>
              {variants && variants.length > 0 ? (
                <>
                  {promotion && promotion.length > 0 ? (
                    <>
                      <p className={styles.h3}>${calculateDisplayPrice().discountedPrice}</p>
                      <p className={styles.p2}>
                        <del>${calculateDisplayPrice().basePrice}</del>
                      </p>
                    </>
                  ) : (
                    <p className={styles.h3}>${calculateDisplayPrice().basePrice}</p>
                  )}
                </>
              ) : (
                <>
                  {promotion && promotion.length > 0 ? (
                    <>
                      <p className={styles.h3}>${calculateDisplayPrice().discountedPrice}</p>
                      <p className={styles.p2}>
                        <del>${calculateDisplayPrice().basePrice}</del>
                      </p>
                    </>
                  ) : (
                    <p className={styles.h3}>${calculateDisplayPrice().basePrice}</p>
                  )}
                </>
              )}
            </div>
            <div className={styles.iconGroup}>
              <div className={styles.comment}>
                <FaRegStar />:
                {reviewCount?.avg_rating 
                  ? Number(reviewCount.avg_rating).toFixed(1)
                  : '暂无评分'}
              </div>
              <div className={styles.comment}>
                <IoChatboxEllipsesOutline  onClick={scrollToReviewRef}/>
              </div>
            </div>
          </div>
          {variants?.length > 0 ? (
            <>
              <hr />
              <div className={styles.productVariant}>
                <div>
                  <p className={styles.p2}>款式</p>
                </div>
                <div className={styles.variantGroup}>
                  {variants.map((variant) => (
                    <button
                      key={variant.variant_id}
                      className={`${styles.comment} ${
                        selectedVariant?.variant_id === variant.variant_id
                          ? styles.active
                          : ''
                      }`}
                      onClick={() => handleVariantClick(variant)}
                    >
                      {variant.variant_name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            ''
          )}
          <hr />
          <div className={styles.btnGroup}>
            <div className={styles.countBtn}>
              <button
                onClick={() => {
                  setCount(count - 1)
                }}
              >
                <FaMinus />
              </button>
              <input
                type="text"
                value={count}
                onChange={(event) => {
                  setCount(Number(event.target.value))
                }}
              />
              <button
                onClick={() => {
                  setCount(count + 1)
                }}
              >
                <FaPlus />
              </button>
            </div>
            <button className={styles.addCartBtn}>
              <FaCartShopping />
              加入購物車
            </button>
          </div>
          {promotion.length > 0 ? (
            <div className={styles.promotions}>
              {promotion.map((p) => {
                return (
                  <div key={p.promotion_id} className={styles.promotion}>
                    <IoCheckmarkDoneSharp />
                    {/* <Link href={'/'}> */}
                    {p.promotion_name}
                    {/* </Link> */}
                  </div>
                )
              })}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      <IconLine_lg title="商品介紹" />
      <div className={styles.row}>
        <p>{product.product_description}</p>
      </div>
      <div ref={reviewRef} className={styles.iconLine}>
        <IconLine_lg title="評價" />
      </div>
      <div className={styles.contain}>
        <div className={styles.containTitle}>
          <p>{reviewCount?.total_reviews}則評論</p>
        </div>
        <div className={styles.containBody}>
          {reviews.length > 0 ? (
            reviews.map((r) => {
              return (
                <div key={r.review_id} className={styles.reviewItem}>
                  <div className={styles.reviewItemTitle}>
                    <div className={styles.left}>
                      <div className={styles.top}>
                        <div className={styles.user}>
                          <div className={styles.userImg}>
                            {r.profile_picture ? (
                              <Image
                                src={r.profile_picture}
                                alt={r.user_name}
                                width={50}
                                height={50}
                              />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          {r.user_name}
                        </div>
                        <div className={styles.creatAt}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={styles.reviewProduct}>
                        {r.product_name}
                        {r.variant_name ? `( ${r.variant_name} )` : ''}
                      </div>
                    </div>
                    <div className={styles.rating}>
                      <FaRegStar />
                      {r.rating}
                    </div>
                  </div>
                  <p>{r.review_text}</p>
                </div>
              )
            })
          ) : (
            <p>目前無評論</p>
          )}
        </div>
      </div>
      <IconLine_lg title="推薦商品" />
      <div className={styles.groupBody}>
        <CardSwitchButton
          direction="left"
          onClick={() => scroll(-1, categoryRefs)}
          aria-label="向左滑動"
        />
        <div className={shopStyles.cardGroup} ref={categoryRefs}>
          {similarProducts.map((product) => {
            return (
              <Link
                key={product.product_id}
                href={`/shop/${product.product_id}`}
              >
                <Card
                  image={product.image_url || '/images/default_no_pet.jpg'}
                  title={product.product_name}
                >
                  <div className={shopStyles.cardText}>
                    <p>
                      ${product.price} <del>${product.price}</del>
                    </p>
                    <button
                      className={shopStyles.likeButton}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        // onToggleFav(product.id)
                      }}
                    >
                      {product.fav ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        <CardSwitchButton
          direction="right"
          onClick={() => scroll(1, categoryRefs)}
          aria-label="向左滑動"
        />
      </div>
    </main>
  )
}

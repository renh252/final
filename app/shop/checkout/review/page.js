// FILEPATH: c:/iSpan/final/app/shop/checkout/review/page.js
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import styles from './review.module.css'
import Image from 'next/image'
// 保留localStorage資料
import { useCheckoutData } from '@/app/shop/_components/useCheckoutData'
// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { MdOutlinePets } from 'react-icons/md'
// api
import useSWR, { mutate } from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ReviewPage() {
  const [checkoutData] = useCheckoutData()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data, error } = useSWR('/api/shop/cart', fetcher)
  // 計算總金額和總折扣
  const { totalDiscount, totalOriginalPrice } = useMemo(() => {
    if (!data?.data) return { totalDiscount: 0, totalOriginalPrice: 0 }
    return data.data.reduce(
      (acc, item) => {
        const originalPrice = item.price * item.quantity
        const discountedPrice = item.promotion
          ? Math.ceil(
              (item.price * (100 - item.promotion.discount_percentage)) / 100
            ) * item.quantity
          : originalPrice

        acc.totalOriginalPrice += originalPrice
        acc.totalDiscount += originalPrice - discountedPrice

        return acc
      },
      { totalDiscount: 0, totalOriginalPrice: 0 }
    )
  }, [data])

  const totalAmount =
    checkoutData?.delivery !== '宅配'
      ? totalOriginalPrice - totalDiscount - 60
      : totalOriginalPrice - totalDiscount
      
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!checkoutData?.delivery) {
        router.push('/shop/checkout')
        setIsLoading(false)
      }
    }
  })

  if (!isLoading) {
    return <div>沒有訂單數據，正在跳轉...</div>
  }

  // 修改订单
  const handleModifyOrder = (e) => {
    e.preventDefault()
    console.log('Modifying order...')
    router.push('/shop/checkout')
  }

  // 提交訂單
  const handleSubmitOrder = async (e) => {
    e.preventDefault()

    if (!checkoutData) {
      alert('沒有訂單數據，請返回購物車')
      return
    }

    const orderData = {
      orderType: 'shop',
      amount: totalAmount || 0, // ✅ 確保金額存在
      items: '商城商品',
      userId: checkoutData?.userId || 1, // ✅ 確保 userId 正確
      ChoosePayment: 'Credit', // ✅ 預設信用卡
      invoiceMethod: checkoutData?.invoice_method || '紙本發票', // ✅ 預設紙本發票
      invoice: checkoutData?.invoice || '此功能未完成',
      mobileBarcode: checkoutData?.mobile_barcode || '',
      taxIDNumber: checkoutData?.taxID_number || '',
      recipientName: checkoutData?.recipient_name || '', // ✅ 確保收件人資訊
      recipientPhone: checkoutData?.recipient_phone || '',
      recipientEmail: checkoutData?.recipient_email || '',
      remark: checkoutData?.remark || '',
      shippingMethod: checkoutData?.delivery || '宅配到府', // ✅ 讓 shippingMethod = checkoutData.delivery
      shippingAddress: checkoutData?.storeName // ✅ 超商店名 OR 住家地址
        ? checkoutData?.storeName
        : checkoutData?.address?.city +
            checkoutData?.address?.town +
            checkoutData?.address?.else || '',
    }

    console.log('🔍 送出商城付款請求:', orderData)

    try {
      const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorResponse = await response.text()
        console.error('❌ 付款 API 錯誤:', errorResponse)
        alert(`付款失敗: ${errorResponse}`)
        return
      }

      const data = await response.json()
      console.log('✅ 付款 API 回應:', data)

      // ✅ 生成 ECPay 付款表單並自動提交
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.action

      for (const key in data.params) {
        if (Object.hasOwn(data.params, key)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = data.params[key]
          form.appendChild(input)
        }
      }

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('❌ 付款錯誤:', error)
      alert('付款發生錯誤，請稍後再試')
    }
    console.log('🔍 送出商城付款請求:', orderData)
    console.log('🔍 checkoutData:', checkoutData)
  }

  if (error) return <div>獲取購物車時發生錯誤</div>
  if (!data) return <div>載入中...</div>

  const cart = data.data

  return (
    <form className={styles.main}>
      {checkoutData?.delivery ? (
        <>
          <Breadcrumbs
            title="資料確認"
            items={[
              { label: '購物車', href: '/shop/cart' },
              { label: '填寫資料', href: '/shop/checkout' },
              { label: '資料確認', href: '/shop/checkout/review' },
            ]}
          />
          <div className={styles.main}>
            {/* review */}
            <div className={styles.reviewContainer}>
              <div className={styles.containTitle}>
                <h1>資訊欄</h1>
              </div>
              <div className={styles.containBody}>
                <div className={styles.group}>
                  <div>
                    <MdOutlinePets />
                    <h1>付款資訊</h1>
                  </div>
                  <div className={styles.groupTitle}>
                    <div>付款方式</div>
                    <div>金額</div>
                    <div>發票</div>
                  </div>
                  <div className={styles.groupBody}>
                    <div>{checkoutData?.payment_method}</div>
                    <div>{totalAmount}</div>
                    <div>
                      {checkoutData?.invoice_method +
                        checkoutData?.taxID_number +
                        checkoutData?.mobile_barcode}
                    </div>
                  </div>
                </div>
                <div className={styles.group}>
                  <div>
                    <MdOutlinePets />
                    <h1>配送資訊</h1>
                  </div>
                  <div className={styles.groupTitle}>
                    <div>配送編號</div>
                    <div>配送方式</div>
                    <div>配送地址</div>
                  </div>
                  <div className={styles.groupBody}>
                    <div>{checkoutData?.payment_method}</div>
                    <div>{checkoutData?.delivery}</div>
                    {checkoutData?.storeName ? (
                      <div>{checkoutData?.storeName}</div>
                    ) : (
                      <div>
                        {checkoutData?.address?.city +
                          checkoutData?.address?.town +
                          checkoutData?.address?.else}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.group}>
                  <div>
                    <MdOutlinePets />
                    <h1>收件人資訊</h1>
                  </div>
                  <div className={styles.groupTitle}>
                    <div>姓名</div>
                    <div>電話</div>
                    <div>電子信箱</div>
                  </div>
                  <div className={styles.groupBody}>
                    <div>{checkoutData?.recipient_name}</div>
                    <div>{checkoutData?.recipient_phone}</div>
                    <div>{checkoutData?.recipient_email}</div>
                  </div>
                </div>
                <div className={styles.group}>
                  <div>
                    <MdOutlinePets />
                    <h1>備註</h1>
                  </div>
                  <div className={styles.remark}>{checkoutData?.remark}</div>
                </div>
              </div>
            </div>

            {/* products */}
            <div className={styles.productContainer}>
              <div className={styles.containTitle}>
                <div>#</div>
                <div>商品</div>
                <div>款式</div>
                <div>單價</div>
                <div>數量</div>
                <div>價格</div>
              </div>
              <div className={styles.containBody}>
                {cart?.map((product, index) => {
                  return (
                    <React.Fragment key={index}>
                      <div>
                        <div>{index + 1}</div>
                        <div className={styles.image}>
                          <Image
                            src={
                              product.image_url || '/images/default_no_pet.jpg'
                            }
                            alt={product.product_name}
                            width={100}
                            height={100}
                          />
                        </div>
                        {product.product_name}
                        <div>{product.variant_name}</div>
                        <div>
                          {product?.promotion ? (
                            <p>
                              $
                              {Math.ceil(
                                (product.price *
                                  (100 -
                                    product.promotion.discount_percentage)) /
                                  100
                              )}
                            </p>
                          ) : (
                            <p className={styles.h2}>${product.price}</p>
                          )}
                        </div>
                        <div>{product.quantity}</div>
                        <div>
                          {product?.promotion ? (
                            <p>
                              $
                              {Math.ceil(
                                (product.price *
                                  (100 -
                                    product.promotion.discount_percentage)) /
                                  100
                              ) * product.quantity}
                            </p>
                          ) : (
                            <p>${product.price * product.quantity}</p>
                          )}
                        </div>
                      </div>
                      {index < cart.length - 1 && <hr />}{' '}
                      {/* 添加水平线，但不包括最后一个产品后 */}
                    </React.Fragment>
                  )
                })}
              </div>
              <div className={styles.containFooter}>
                <div>
                  <p>小計 :</p>
                  <p>$ {totalOriginalPrice}</p>
                </div>
                <div>
                  <p>優惠 :</p>
                  <p>- $ {totalDiscount}</p>
                </div>
                <div>
                  <p>運費 :</p>
                  <p>- $ {checkoutData?.delivery ? 60 : 0}</p>
                </div>
                <div>
                  <p>合計 :</p>
                  <p>
                    ${' '}
                    {checkoutData?.delivery !== '宅配'
                      ? totalOriginalPrice - totalDiscount - 60
                      : totalOriginalPrice - totalDiscount}
                  </p>
                </div>
              </div>
            </div>

            {/* buttons */}
            <div className={styles.buttons}>
              <button type="button" onClick={handleModifyOrder}>
                修改訂單
              </button>
              <button type="button" onClick={handleSubmitOrder}>
                前往付款
              </button>
            </div>
          </div>
          {/* main end */}
        </>
      ) : (
        ''
      )}
    </form>
  )
}

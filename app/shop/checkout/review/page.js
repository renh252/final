'use client'
// 獲取用戶資料
import { useAuth } from '@/app/context/AuthContext'
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import styles from './review.module.css'
import Image from 'next/image'
// 保留localStorage資料
import { useCheckoutData } from '@/app/shop/_components/useCheckoutData'
// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { MdOutlinePets } from 'react-icons/md'
import { usePageTitle } from '@/app/context/TitleContext'
// api
import useSWR, { mutate } from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ReviewPage() {
  const { user } = useAuth()
  const userId = user?.id
  usePageTitle('結帳')

  const [checkoutData] = useCheckoutData()

  const router = useRouter()
  const { data, error } = useSWR(`/api/shop/cart?userId=${userId}`, fetcher)

  // 取得localStorage-productPrice資料
  const [productPrice, setProductPrice] = useState({
    shippingFee: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalOriginalPrice: 0,
  })
  useEffect(() => {
    // 从 localStorage 获取数据
    const storedProductPrice = localStorage.getItem('productPrice')
    if (storedProductPrice) {
      const parsedProductPrice = JSON.parse(storedProductPrice)
      if (
        !parsedProductPrice.totalQuantity ||
        parsedProductPrice.totalQuantity == 0
      ) {
        router.push('/shop/cart')
        return
      }
      setProductPrice(parsedProductPrice)
    } else {
      router.push('/shop/cart')
      return
    }

    if (!checkoutData?.recipient_name || !checkoutData?.delivery) {
      <div>沒有訂單數據，正在跳轉...</div>
      router.push('/shop/checkout')
    }
  }, [checkoutData, router])

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

    // 案提交後將localStorage清空
    localStorage.removeItem('productPrice')
    localStorage.removeItem('checkoutData')

    const orderData = {
      orderType: 'shop',
      amount: productPrice.totalAmount || 0, // ✅ 確保金額存在
      items: '商城商品',
      userId: userId || 2, // ✅ 確保 userId 正確
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
      shippingAddress: checkoutData?.CVSStoreName // ✅ 超商店名 OR 住家地址
        ? checkoutData?.CVSStoreName
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
  // 購物車資料
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
          {/* 電腦 */}
          <div className={styles._main}>
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
                    <div>{productPrice.totalAmount}</div>
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
                        {checkoutData?.address.else
                          ? checkoutData?.address.city +
                            checkoutData?.address?.town +
                            checkoutData?.address?.else
                          : checkoutData?.CVSStoreName}
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
                          {product.product_name}
                        </div>
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
                  <div>
                    <p>小計 :</p>
                    <p>$ {productPrice.totalOriginalPrice}</p>
                  </div>
                  <div>
                    <p>優惠 :</p>
                    <p>$ {productPrice.totalDiscount}</p>
                  </div>
                  <div>
                    <p>運費 :</p>
                    <p>$ {productPrice.shippingFee}</p>
                  </div>
                </div>
                <hr />
                <div>
                  <p>合計 :</p>
                  <p>${productPrice.totalAmount}</p>
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
          {/* 手機 */}
          <div className={styles.checkoutMobileContainer}>
            {/* 資訊欄 */}
            <div className={styles.reviewContainer}>
              <h1 className={styles.title}>資訊欄</h1>
              
              {/* 付款資訊 */}
              <div className={styles.infoGroup}>
                <div className={styles.infoHeader}><MdOutlinePets /><h2>付款資訊</h2></div>
                <div className={styles.infoBody}>
                  <p><strong>付款方式：</strong>{checkoutData?.payment_method}</p>
                  <p><strong>金額：</strong>{productPrice.totalAmount}</p>
                  <p><strong>發票：</strong>{checkoutData?.invoice_method} {checkoutData?.taxID_number} {checkoutData?.mobile_barcode}</p>
                </div>
              </div>

              {/* 配送資訊 */}
              <div className={styles.infoGroup}>
                <div className={styles.infoHeader}><MdOutlinePets /><h2>配送資訊</h2></div>
                <div className={styles.infoBody}>
                  <p><strong>配送編號：</strong>{checkoutData?.payment_method}</p>
                  <p><strong>配送方式：</strong>{checkoutData?.delivery}</p>
                  <p><strong>配送地址：</strong>{checkoutData?.storeName || `${checkoutData?.address.city}${checkoutData?.address?.town}${checkoutData?.address?.else}`}</p>
                </div>
              </div>

              {/* 收件人資訊 */}
              <div className={styles.infoGroup}>
                <div className={styles.infoHeader}><MdOutlinePets /><h2>收件人資訊</h2></div>
                <div className={styles.infoBody}>
                  <p><strong>姓名：</strong>{checkoutData?.recipient_name}</p>
                  <p><strong>電話：</strong>{checkoutData?.recipient_phone}</p>
                  <p><strong>電子信箱：</strong>{checkoutData?.recipient_email}</p>
                </div>
              </div>

              {/* 備註 */}
              <div className={styles.infoGroup}>
                <div className={styles.infoHeader}><MdOutlinePets /><h2>備註</h2></div>
                <p className={styles.remark}>{checkoutData?.remark}</p>
              </div>
            </div>

            {/* 商品資訊 */}
            <div className={styles.productContainer}>
              <h1 className={styles.title}>購物明細</h1>
              <div className={styles.productList}>
                {cart?.map((product, index) => (
                  <div key={index} className={styles.productItem}>
                    <Image
                      src={product.image_url || '/images/default_no_pet.jpg'}
                      alt={product.product_name}
                      width={80}
                      height={80}
                    />
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.product_name}</p>
                      <p><strong>款式：</strong>{product.variant_name}</p>
                      <p><strong>單價：</strong>${product.price}</p>
                      <p><strong>數量：</strong>{product.quantity}</p>
                      <p><strong>價格：</strong>${product.price * product.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 總計 */}
            <div className={styles.summaryContainer}>
              <div className={styles.summaryRow}><span>小計：</span><span>$ {productPrice.totalOriginalPrice}</span></div>
              <div className={styles.summaryRow}><span>優惠：</span><span>$ {productPrice.totalDiscount}</span></div>
              <div className={styles.summaryRow}><span>運費：</span><span>$ {productPrice.shippingFee}</span></div>
              <hr />
              <div className={styles.summaryTotal}><span>合計：</span><span>${productPrice.totalAmount}</span></div>
            </div>

            {/* 按鈕 */}
            <div className={styles.buttonGroup}>
              <button onClick={handleSubmitOrder}>前往付款</button>
              <button onClick={handleModifyOrder}>修改訂單</button>
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

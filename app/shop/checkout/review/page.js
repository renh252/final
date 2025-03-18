// FILEPATH: c:/iSpan/final/app/shop/checkout/review/page.js
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './review.module.css'
// 保留localStorage資料
import { useCheckoutData } from '@/app/shop/_components/useCheckoutData'
// components
import {Breadcrumbs} from '@/app/_components/breadcrumbs'
import { MdOutlinePets } from "react-icons/md";



export default function ReviewPage() {
  const [checkoutData] = useCheckoutData();
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
useEffect(() => {
  if (typeof window !== 'undefined') {
    if(!checkoutData?.delivery){
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

  // 提交订单
  const handleSubmitOrder = (e) => {
    e.preventDefault()
    // 这里可以添加提交订单的逻辑
    alert('訂單已提交！')
    // 清除存储的数据
    // localStorage.removeItem('checkoutData')  
    router.push('/shop/checkout/summary')  // 导航到订单完成页面
  }




  return (
    <form className={styles.main}>
    {checkoutData?.delivery
    ?(
      <>
      <Breadcrumbs
        title='資料確認'
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
                  <MdOutlinePets/>
                  <h1>付款資訊</h1>
                </div>
                <div className={styles.groupTitle}>
                    <div>付款方式</div>
                    <div>金額</div>
                    <div>發票</div>
                </div> 
                <div className={styles.groupBody}>
                    <div>{checkoutData?.payment_method}</div>
                    <div>**</div>
                    <div>{checkoutData?.invoice_method + checkoutData?.taxID_number + checkoutData?.mobile_barcode  }</div>
                </div>
              </div>
              <div className={styles.group}>
                <div>
                  <MdOutlinePets/>
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
                    {checkoutData?.storeName
                    ?<div>{checkoutData?.storeName}</div>
                    :
                    <div>{checkoutData?.address?.city + checkoutData?.address?.town + checkoutData?.address?.else}</div>
                    }
                    
                </div>
              </div>
              <div className={styles.group}>
                <div>
                  <MdOutlinePets/>
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
                  <MdOutlinePets/>
                  <h1>備註</h1>
                </div>
                <div className={styles.remark}>{checkoutData?.remark}</div>

              </div>

            </div>
          </div>
          
          {/* products */}
          <div className={styles.productContainer}>
            <div className={styles.containTitle}></div>
            <div className={styles.containBody}>

            </div>
          </div>
          
          {/* buttons */}
          <div className={styles.buttons}>
            <button type="button" onClick={handleModifyOrder}>修改訂單</button>
            <button type="button" onClick={handleSubmitOrder}>前往付款</button>
          </div>

        </div> 
        {/* main end */}



      </>
    )
    :''}

    </form>
  )
}


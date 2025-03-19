'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // 导入 useRouter
// styles
import styles from './checkout.module.css'
// components
import { useCheckoutData } from '@/app/shop/_components/useCheckoutData'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import areaData from '@/app/shop/_data/areaData.js'

export default function CheckoutPage() {
  const router = useRouter()
  // 表單資料
  const [checkoutData, setCheckoutData] = useCheckoutData()
  // 縣市區域
  const cities = Object.keys(areaData)
  const [districts, setDistricts] = useState([])

  console.log(cities)
  console.log(areaData['臺中市'])

  // 表單驗證錯誤信息
  const [errors, setErrors] = useState({})
  useEffect(() => {
    const storedAmount = localStorage.getItem('totalAmount')
    if (storedAmount) {
      setCheckoutData((prev) => ({
        ...prev,
        totalAmount: Number(storedAmount),
      }))
    }
  }, [])

  useEffect(() => {
    if (checkoutData.address.city) {
      setDistricts(areaData[checkoutData.address.city] || [])
    }
  }, [checkoutData.address.city])

  // 当用户输入时清除该字段的错误
  const handleInputChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    // 特殊字段的处理逻辑
    if (name === 'mobile_barcode') {
      newValue =
        value === '' ? '/' : value.startsWith('/') ? value : '/' + value
    } else if (name === 'taxID_number') {
      newValue = value.replace(/\D/g, '').slice(0, 8)
    } else if (name === 'recipient_phone') {
      newValue = value.replace(/\D/g, '')
    }

    // 地址相关字段的处理
    if (name === 'city') {
      setCheckoutData((prev) => ({
        ...prev,
        address: { ...prev.address, city: newValue, town: '' },
      }))
    } else if (name === 'town') {
      setCheckoutData((prev) => ({
        ...prev,
        address: { ...prev.address, town: newValue },
      }))
    } else if (name === 'address') {
      setCheckoutData((prev) => ({
        ...prev,
        address: { ...prev.address, else: newValue },
      }))
    } else {
      // 其他字段的处理
      setCheckoutData((prev) => ({ ...prev, [name]: newValue }))
    }

    setErrors((prev) => ({ ...prev, [name]: '' }))

    if (name === 'delivery') {
      if (value === '宅配到府') {
        setCheckoutData((prev) => ({ ...prev, storeName: '', storeId: '' }))
      }
      if (value === '7-ELEVEN') {
        setCheckoutData((prev) => ({ ...prev, storeName: '', storeId: '' }))
        setPayload({ ...Payload, CvsType: 'UNIMART' })
        SendParams()
      }
      if (value === '全家') {
        setCheckoutData((prev) => ({ ...prev, storeName: '', storeId: '' }))
        setPayload({ ...Payload, CvsType: 'FAMI' })
        SendParams()
      }
    }

    // invoice_method 的特殊处理
    if (name === 'invoice_method') {
      if (value !== '手機載具') {
        setCheckoutData((prev) => ({ ...prev, mobile_barcode: '/' }))
      }
      if (value !== '統編') {
        setCheckoutData((prev) => ({ ...prev, taxID_number: '' }))
      }
    }
  }

  // 獲取縣市區域

  // 超商
  const [isLoading, setIsLoading] = useState(false)

  const [Payload, setPayload] = useState({
    // MerchantID: "2000132",
    CvsType: '',
    CheckMacValue: '',
  })
  const CreateCMVURL = 'http://localhost:3000/api/shop/checkout'
  const APIURL = 'https://logistics-stage.ecpay.com.tw/Helper/GetStoreList'

  // ------------串超商地圖
  async function SendParams() {
    try {
      const params = {
        action: 'createCMV',
        MerchantID: '2000132',
        CvsType: Payload.CvsType,
      }
      console.log('Sending params:', params)

      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)

      setPayload((prevPayload) => ({
        ...prevPayload,
        CheckMacValue: data.result,
      }))

      return data.result
    } catch (error) {
      console.error('SendParams 錯誤：', error)
      throw error
    }
  }
  const handleSelectStore = async () => {
    try {
      setIsLoading(true)
      const checkMacValue = await SendParams()

      // 使用獲得的 CheckMacValue 進行後續操作
      // 例如，調用綠界 API
      const ecpayResponse = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MerchantID: Payload.MerchantID,
          CvsType: Payload.CvsType,
          CheckMacValue: checkMacValue,
          // 其他必要的參數
        }),
      })

      if (!ecpayResponse.ok) {
        throw new Error('Failed to get store list')
      }

      const htmlContent = await ecpayResponse.text()

      // 打開綠界的地圖選擇頁面
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      newWindow.document.write(htmlContent)

      // 監聽來自綠界頁面的消息
      window.addEventListener('message', handleStoreSelection, false)
    } catch (error) {
      console.error('選擇門市時發生錯誤：', error)
      alert('選擇門市時發生錯誤，請稍後再試。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoreSelection = (event) => {
    // 確保消息來自綠界的頁面
    if (event.origin !== 'https://logistics-stage.ecpay.com.tw') return

    const { CVSStoreID, CVSStoreName } = event.data
    setCheckoutData((prev) => ({
      ...prev,
      storeName: CVSStoreName,
      storeId: CVSStoreID,
    }))

    // 移除事件監聽器
    window.removeEventListener('message', handleStoreSelection)
  }
  // -----------------

  // 存儲表單資料到 LocalStorage
  // useEffect(() => {
  //   localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
  // }, [checkoutData]);

  // 表單驗證
  const validateForm = () => {
    let newErrors = {}

    // name
    if (!checkoutData.recipient_name.trim()) {
      newErrors.recipient_name = '* 必填'
    } else if (checkoutData.recipient_name.length > 50) {
      newErrors.recipient_name = '*格式錯誤'
    }

    // phone
    if (!checkoutData.recipient_phone.trim()) {
      newErrors.recipient_phone = '* 必填'
    } else if (
      !checkoutData.recipient_phone.startsWith('0') ||
      checkoutData.recipient_phone.length > 10
    ) {
      newErrors.recipient_phone = '* 格式錯誤'
    }

    // email
    if (!checkoutData.recipient_email.trim()) {
      newErrors.recipient_email = '* 必填'
    } else if (!/\S+@\S+\.\S+/.test(checkoutData.recipient_email)) {
      newErrors.recipient_email = '* 格式錯誤'
    }

    // payment_method
    if (!checkoutData.payment_method) {
      newErrors.payment_method = '* 必填'
    }

    // invoice_method
    if (!checkoutData.invoice_method) {
      newErrors.invoice_method = '* 必填'
    }

    // 手機載具
    if (checkoutData.invoice_method === '手機載具') {
      if (!checkoutData.mobile_barcode) {
        newErrors.mobile_barcode = '* 必填'
      } else if (checkoutData.mobile_barcode == '/') {
        newErrors.mobile_barcode = '* 必填'
      } else if (checkoutData.mobile_barcode.length !== 8) {
        newErrors.mobile_barcode = '* 格式錯誤'
      }
    }

    // 統編
    if (checkoutData.invoice_method === '統編') {
      if (!checkoutData.taxID_number) {
        newErrors.taxID_number = '* 必填'
      } else if (checkoutData.taxID_number.length !== 8) {
        newErrors.taxID_number = '* 格式錯誤'
      }
    }

    if (checkoutData.delivery === '宅配到府') {
      // 地址
      if (
        !checkoutData.address.city ||
        !checkoutData.address.town ||
        !checkoutData.address.else
      ) {
        newErrors.address = '* 必填'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // 如果没有错误返回 true
  }

  // 送出表單
  const handleSubmit = (event) => {
    event.preventDefault()

    if (validateForm()) {
      router.push('/shop/checkout/review')
    }
  }

  // 刪除localStorage並導回購物車
  const handleCancelPurchase = () => {
    localStorage.removeItem('checkoutData')
    router.push('/shop/cart')
  }

  return (
    <>
      <Breadcrumbs
        title="配送/付款方式"
        items={[
          { label: '購物車', href: '/shop/cart' },
          { label: '填寫資料', href: '/shop/checkout' },
        ]}
      />
      <form className={styles.main} onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.containTitle}>
            <p>配送方式</p>
            <div className={styles.delivery}>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="宅配到府"
                  checked={checkoutData.delivery === '宅配到府'}
                  onChange={handleInputChange}
                />
                宅配到府
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="7-ELEVEN"
                  checked={checkoutData.delivery === '7-ELEVEN'}
                  onChange={handleInputChange}
                />
                7-ELEVEN
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="全家"
                  checked={checkoutData.delivery === '全家'}
                  onChange={handleInputChange}
                />
                全家
              </label>
            </div>
          </div>
          {checkoutData.delivery ? (
            <div className={styles.containBody}>
              {checkoutData.delivery === '宅配到府' ? (
                <>
                  <label className={styles.user}>
                    <input type="checkbox" />
                    <p>帶入用戶資料</p>
                  </label>
                  <div className={styles.address}>
                    <p>配送地址</p>
                    <div className={styles.select}>
                      <select
                        id="city"
                        name="city"
                        value={checkoutData.address.city}
                        onChange={handleInputChange}
                      >
                        <option value="">縣市</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>

                      <select
                        id="town"
                        name="town"
                        value={checkoutData.address.town}
                        onChange={handleInputChange}
                        disabled={!checkoutData.address.city}
                      >
                        <option value="">區域</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      <input
                        name="address"
                        type="text"
                        value={checkoutData.address.else}
                        onChange={handleInputChange}
                        placeholder="詳細地址"
                      />
                      <span className={styles.warn}>{errors.address}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => {}}>
                    選擇門市
                  </button>
                  <label>
                    門市名稱：
                    <input
                      type="text"
                      value={checkoutData.CVSStoreName}
                      readOnly
                    />
                  </label>
                  <label>
                    門市代號：
                    <input
                      type="text"
                      value={checkoutData.CVSStoreID}
                      readOnly
                    />
                  </label>
                </>
              )}

              <label>
                <p>收件人 :</p>
                <input
                  name="recipient_name"
                  type="text"
                  value={checkoutData.recipient_name}
                  onChange={handleInputChange}
                />
                <span className={styles.warn}>{errors.recipient_name}</span>
              </label>
              <label>
                <p>電話 :</p>
                <input
                  name="recipient_phone"
                  type="text"
                  placeholder="09xxxxxxxx"
                  value={checkoutData.recipient_phone}
                  onChange={handleInputChange}
                />
                <span className={styles.warn}>{errors.recipient_phone}</span>
              </label>
              <label>
                <p>電子信箱 :</p>
                <input
                  name="recipient_email"
                  type="text"
                  value={checkoutData.recipient_email}
                  onChange={handleInputChange}
                />
                <span className={styles.warn}>{errors.recipient_email}</span>
              </label>
              <label>
                <p>備註 :</p>
                <input
                  name="remark"
                  type="text"
                  value={checkoutData.remark}
                  onChange={handleInputChange}
                />
              </label>
              <div>
                <p>付款方式 :</p>

                <div className={styles.paymentMethod}>
                  <label>
                    <input
                      name="payment_method"
                      type="radio"
                      value="信用卡"
                      checked={checkoutData.payment_method === '信用卡'}
                      onChange={handleInputChange}
                    />
                    信用卡
                  </label>
                  <label>
                    <input
                      name="payment_method"
                      type="radio"
                      value="linePay"
                      checked={checkoutData.payment_method === 'linePay'}
                      onChange={handleInputChange}
                    />
                    line pay
                  </label>
                </div>
                <span className={styles.warn}>{errors.payment_method}</span>
              </div>
              <div className={styles.invoiceMethod}>
                <div className={styles.invoiceTitle}>
                  <p>發票 :</p>
                  <span className={styles.warn}>{errors.invoice_method}</span>
                </div>
                <div className={styles.invoiceBody}>
                  <label>
                    <input
                      name="invoice_method"
                      type="radio"
                      value="紙本"
                      checked={checkoutData.invoice_method === '紙本'}
                      onChange={handleInputChange}
                    />
                    紙本
                  </label>
                  <div>
                    <label>
                      <input
                        name="invoice_method"
                        type="radio"
                        value="手機載具"
                        checked={checkoutData.invoice_method === '手機載具'}
                        onChange={handleInputChange}
                      />
                      手機載具
                    </label>
                    {checkoutData.invoice_method === '手機載具' && (
                      <div>
                        <label>
                          :
                          <input
                            type="text"
                            name="mobile_barcode"
                            value={checkoutData.mobile_barcode}
                            onChange={handleInputChange}
                          />
                        </label>
                        <span className={styles.warn}>
                          {errors.mobile_barcode}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label>
                      <input
                        name="invoice_method"
                        type="radio"
                        value="統編"
                        checked={checkoutData.invoice_method === '統編'}
                        onChange={handleInputChange}
                      />
                      統編
                    </label>
                    {checkoutData.invoice_method === '統編' && (
                      <>
                        <label>
                          :
                          <input
                            type="text"
                            name="taxID_number"
                            value={checkoutData.taxID_number}
                            onChange={handleInputChange}
                          />
                        </label>
                        <span className={styles.warn}>
                          {errors.taxID_number}
                        </span>
                      </>
                    )}
                  </div>
                  <label>
                    <input
                      name="invoice_method"
                      type="radio"
                      value="捐贈發票"
                      checked={checkoutData.invoice_method === '捐贈發票'}
                      onChange={handleInputChange}
                    />
                    捐贈發票
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.containBody}>請先選擇配送方式</div>
          )}
        </div>

        {checkoutData.delivery ? (
          <div className={styles.btns}>
            <button type="button" onClick={handleCancelPurchase}>
              返回購物車
            </button>
            <button type="submit">下一步</button>
          </div>
        ) : (
          <button type="button" onClick={handleCancelPurchase}>
            返回購物車
          </button>
        )}
      </form>
    </>
  )
}

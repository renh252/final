'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from "axios";
import { useRouter  } from 'next/navigation'  // 导入 useRouter
// styles
import styles from './checkout.module.css'
// components




function CheckoutPage(props) {
const router = useRouter()  // 初始化 router
const formRef = useRef(null);


const [delivery, setDelivery] = useState('宅配到府')
const [storeInfo, setStoreInfo] = useState({ name: "", id: "" });

// 表單資料
const [formData, setFormData] = useState(() => {
  const savedData = localStorage.getItem('checkoutFormData');
  return savedData ? JSON.parse(savedData) : {
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    remark: '',
    payment_method: '',
    invoice_method: '',
    mobile_barcode: '/',
    taxID_number: '',
    // ... 其他字段的初始值
  };
});

// 表單驗證錯誤信息
const [errors, setErrors] = useState({});

// 当用户输入时清除该字段的错误
const handleInputChange = (e) => {
  const { name, value, type } = e.target;
  let newValue = value;

  // mobile_barcode
  if (name === 'mobile_barcode') {
    // 如果用户试图删除 '/'，我们保留它
    if (!value.startsWith('/')) {
      newValue = '/' + value;
    }
    // 如果用户只输入了 '/'，我们保留它
    if (value === '') {
      newValue = '/';
    }
  }

  if (name === 'taxID_number') {
    newValue = value.replace(/\D/g, ''); // 只保留数字，最多8位
  }

  if(name === 'recipient_phone'){
    newValue = value.replace(/\D/g, '');
  }
  
  setFormData(prev => ({ ...prev, [name]: newValue }));

  // 填寫時清空該錯誤
  setErrors(prev => ({ ...prev, [name]: '' }));

  // invoice_method
  if (name === 'invoice_method') {
    if (value !== '手機載具') {
      setFormData(prev => ({ ...prev, mobile_barcode: '/' }));
    }
    if (value !== '統編') {
      setFormData(prev => ({ ...prev, taxID_number: '' }));
    }
  }
};





const [isLoading, setIsLoading] = useState(false);


const [Payload, setPayload] = useState({
  // MerchantID: "2000132",
  CvsType: "",
  CheckMacValue: "",
});
const CreateCMVURL = "http://localhost:3000/api/shop/checkout";
const APIURL = "https://logistics-stage.ecpay.com.tw/Helper/GetStoreList";

async function SendParams() {
  try {
    const params = { 
      action: 'createCMV',
      MerchantID: "2000132", 
      CvsType: Payload.CvsType 
    };
    console.log('Sending params:', params);
    
    const response = await fetch('/api/shop/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);

    setPayload(prevPayload => ({
      ...prevPayload,
      CheckMacValue: data.result,
    }));

    return data.result;
  } catch (error) {
    console.error("SendParams 錯誤：", error);
    throw error;
  }
}
const handleSelectStore = async () => {
  try {
    setIsLoading(true);
    const checkMacValue = await SendParams();
    
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
    });

    if (!ecpayResponse.ok) {
      throw new Error('Failed to get store list');
    }

    const htmlContent = await ecpayResponse.text();

    // 打開綠界的地圖選擇頁面
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    newWindow.document.write(htmlContent);

    // 監聽來自綠界頁面的消息
    window.addEventListener('message', handleStoreSelection, false);

  } catch (error) {
    console.error('選擇門市時發生錯誤：', error);
    alert('選擇門市時發生錯誤，請稍後再試。');
  } finally {
    setIsLoading(false);
  }
};

const handleStoreSelection = (event) => {
  // 確保消息來自綠界的頁面
  if (event.origin !== 'https://logistics-stage.ecpay.com.tw') return;

  const { CVSStoreID, CVSStoreName } = event.data;
  setStoreInfo({ name: CVSStoreName, id: CVSStoreID });

  // 移除事件監聽器
  window.removeEventListener('message', handleStoreSelection);
};

// 存儲表單資料到 LocalStorage
useEffect(() => {
  localStorage.setItem('checkoutFormData', JSON.stringify(formData));
}, [formData]);

// 表單驗證
const validateForm = () => {
  let newErrors = {};
  
  // name
  if (!formData.recipient_name.trim()) {
    newErrors.recipient_name = '*收件人為必填';
  }else if(formData.recipient_name.length > 50){
    newErrors.recipient_name = '*格式錯誤';
  }
  
  // phone
  if (!formData.recipient_phone.trim()) {
    newErrors.recipient_phone = '* 連絡電話為必填';
  }else if(!formData.recipient_phone.startsWith('0')){
    newErrors.recipient_phone = '* 請輸入有效的電話號碼';
  }
  
  // email
  if (!formData.recipient_email.trim()) {
    newErrors.recipient_email = '* 電子信箱為必填';
  } else if (!/\S+@\S+\.\S+/.test(formData.recipient_email)) {
    newErrors.recipient_email = '* 請輸入有效的電子信箱';
  }

  // payment_method
  if (!formData.payment_method) {
    newErrors.payment_method = '* 請選擇付款方式';
  }

  // invoice_method
  if (!formData.invoice_method) {
    newErrors.invoice_method = '* 請選擇發票方式';
  }

  // 手機載具
  if (formData.invoice_method === '手機載具') { 
    if(!formData.mobile_barcode ){
    newErrors.mobile_barcode = '* 請輸入載具號碼';}
    else if(formData.mobile_barcode.length !== 8){
    newErrors.mobile_barcode = '* 格式錯誤'}
  }

  // 統編
  if (formData.invoice_method === '統編') {
    if (!formData.taxID_number) {
      newErrors.taxID_number = '* 請輸入統編號碼';
    } else if (formData.taxID_number.length !== 8) {
      newErrors.taxID_number = '* 格式錯誤';
    }
  }



  setErrors(newErrors);
  return Object.keys(newErrors).length === 0; // 如果没有错误返回 true
};


// 送出表單
const handleSubmit = (event) => {
  event.preventDefault();
  
  if (validateForm()) {
    // 存储结算数据（这是之前用于 ReviewPage 的数据）
    localStorage.setItem('checkoutData', JSON.stringify(formData));
    
    // 导航到 review 页面
    router.push('/shop/checkout/review');
  }
};

// 刪除localStorage並導回購物車
const handleCancelPurchase = () => {
  localStorage.removeItem('checkoutFormData');
  localStorage.removeItem('checkoutData');
  router.push('/shop/cart');
};

  return (
    <form className={styles.main}  onSubmit={handleSubmit}>
      <div className={styles.container}>
        <div className={styles.containTitle}>
            <h3>配送方式</h3>
            <div className={styles.delivery}>
                <label>
                  <input type="radio" name="delivery" value="宅配到府" checked={delivery === "宅配到府"} onChange={(event) =>{ setDelivery(event.target.value);
                  setPayload({ ...Payload, CvsType: '' })}}  />
                  宅配到府
                </label>
                <label>
                  <input 
                  type="radio" 
                  name="delivery"
                  value="7-ELEVEN超商" checked={delivery === "7-ELEVEN超商"} onChange={(event) =>{ 
                    setDelivery(event.target.value);
                    setPayload({ ...Payload, CvsType: 'UNIMART'  });
                    SendParams();
                  }} />
                  7-ELEVEN超商
                </label>
                <label>
                  <input 
                  type="radio" 
                  name="delivery"
                  value="全家" checked={delivery === "全家"} onChange={(event) =>{ setDelivery(event.target.value);
                    setPayload({ ...Payload, CvsType: 'FAMI'  });
                    SendParams();
                  }}
                  />
                  全家
                </label>
            </div>
        </div>
        {delivery
        ?
        <div className={styles.containBody}>
          {delivery === '宅配到府'
          ? ''
          : 
          <>
          <button  onClick={()=>{}}> 
            選擇門市
          </button>
          <label>門市名稱：
            <input type="text" value={storeInfo.name} readOnly />
          </label>
          <label>門市代號：
            <input type="text" value={storeInfo.id} readOnly />
          </label>
          </>
          }
          <div>
            <label>收件人 :
                <input 
                name='recipient_name' 
                type="text"
                value={formData.recipient_name}
                onChange={handleInputChange}
                />
                <span className={styles.warn}>{errors.recipient_name}</span>
            </label>
            <label>電話 :
                <input 
                name='recipient_phone' 
                type="text" 
                placeholder='09xxxxxxxx'
                value={formData.recipient_phone}
                onChange={handleInputChange}
                />
                <span className={styles.warn}>{errors.recipient_phone}</span>
            </label>
            <label>電子信箱 :
                <input 
                name='recipient_email' 
                type="text" 
                value={formData.recipient_email}
                onChange={handleInputChange} 
                />
                <span className={styles.warn}>{errors.recipient_email}</span>
            </label>
            <label>備註 :
                <input 
                name='remark' 
                type="text" 
                value={formData.remark}
                onChange={handleInputChange}
                />
            </label>
            <div className={styles.paymentMethod}>
              付款方式 :
              <div>
                <label>
                    <input 
                    name='payment_method' 
                    type="radio" 
                    value='信用卡'
                    checked={formData.payment_method === '信用卡'}
                    onChange={handleInputChange}
                    />
                    信用卡
                </label>
                <label>
                    <input 
                    name='payment_method' type="radio" 
                    value='linePay'
                    checked={formData.payment_method === 'linePay'}
                    onChange={handleInputChange}
                    />
                    line pay
                </label>
              </div>
              <span className={styles.warn}>{errors.payment_method}</span>
            </div>
            <div className={styles.invoiceMethod}>
              發票 : 
              <span className={styles.warn}>{errors.invoice_method}</span>
              <div>
                <label>
                  <input 
                    name='invoice_method' 
                    type="radio" 
                    value='紙本'
                    checked={formData.invoice_method === '紙本'}
                    onChange={handleInputChange}
                  />
                  紙本
                </label>
                <div>
                  <label>
                    <input 
                      name='invoice_method' 
                      type="radio" 
                      value='手機載具'
                      checked={formData.invoice_method === '手機載具'}
                      onChange={handleInputChange}
                    />
                    手機載具
                  </label>
                  {formData.invoice_method === '手機載具' && (
                    <>
                    <label>
                      : 
                      <input 
                        type="text" 
                        name='mobile_barcode'
                        value={formData.mobile_barcode}
                        onChange={handleInputChange}
                      />
                    </label>
                    <span>{errors.mobile_barcode}</span>
                    </>
                  )}
                </div>
                <div>
                  <label>
                    <input 
                      name='invoice_method' 
                      type="radio" 
                      value='統編'
                      checked={formData.invoice_method === '統編'}
                      onChange={handleInputChange}
                    />
                    統編
                  </label>
                  {formData.invoice_method === '統編' && (
                    <>
                    <label>
                      : 
                      <input 
                        type="text" 
                        name='taxID_number'
                        value={formData.taxID_number}
                        onChange={handleInputChange}
                      />
                    </label>
                    <span>{errors.taxID_number}</span>
                    </>
                  )}
                </div>
                <label>
                  <input 
                    name='invoice_method' 
                    type="radio" 
                    value='捐贈發票'
                    checked={formData.invoice_method === '捐贈發票'}
                    onChange={handleInputChange}
                  />
                  捐贈發票
                </label>
              </div>
            </div>
          </div>
        </div>
        :<div className={styles.containBody}>請先選擇配送方式</div>
        }
      </div>

      {delivery
      ?
      <div className={styles.btns}>
      <button type="button" onClick={handleCancelPurchase}>返回購物車</button>
        <button  type="submit" >下一步</button>
      </div>
      : <button type="button" onClick={handleCancelPurchase}>返回購物車</button>
      }
    </form>


  )
}
export default CheckoutPage;
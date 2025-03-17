'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from "axios";
import { useRouter  } from 'next/navigation'  // 导入 useRouter
// styles
import styles from './checkout.module.css'
// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'



function CheckoutPage(props) {
const router = useRouter()  // 初始化 router
const formRef = useRef(null);
const [delivery, setDelivery] = useState('')
const [storeInfo, setStoreInfo] = useState({ name: "", id: "" });
const [invoiceMethod, setInvoiceMethod] = useState('');
const [isLoading, setIsLoading] = useState(false);


const [Payload, setPayload] = useState({
  MerchantID: "2000132",
  CvsType: "",
  CheckMacValue: "",
});
const CreateCMVURL = "http://localhost:3000/api/shop/checkout";
const APIURL = "https://logistics-stage.ecpay.com.tw/Helper/GetStoreList";

async function SendParams() {
  try {
    const params = { 
      action: 'createCMV',
      MerchantID: Payload.MerchantID, 
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

// 送出表單

const handleSubmit = (event) => {
  event.preventDefault(); // 这行很重要，它阻止了表单的默认提交行为

  // 收集表单数据
  const formData = new FormData(event.target);
  const formObject = Object.fromEntries(formData.entries());

  try {
    // 将表单数据存储到 LocalStorage
    localStorage.setItem('checkoutData', JSON.stringify(formObject));

    // 使用 router.push 导航到 review 页面
    router.push('/shop/checkout/review');
  } catch (error) {
    console.error('提交出错:', error);
    alert('提交失败，请稍后重试');
  }
};

  return (
    <form className={styles.main}  onSubmit={handleSubmit}>
      <Breadcrumbs
        title="配送/付款方式"
        items={[
          { label: '購物車', href: `/shop/cart` },
          { label: '配送/付款方式', href: `/shop/checkout` }
        ]}/>
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
          {delivery === 'home'
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
                <input name='recipient_name' type="text" />
            </label>
            <label>手機 :
                <input name='recipient_phone' type="text" />
            </label>
            <label>電子信箱 :
                <input name='recipient_email' type="text" />
            </label>
            <label>備註 :
                <input name='remark' type="text" />
            </label>
            <label>備註 :
                <input name='remark' type="text" />
            </label>
            <div className={styles.paymentMethod}>
              付款方式 :
              <div>
                <label>
                    <input name='payment_method' type="radio" value='creditCard'/>
                    信用卡
                </label>
                <label>
                    <input name='payment_method' type="radio" value='linePay'/>
                    line pay
                </label>
              </div>
            </div>
            <div className={styles.invoiceMethod}>
              發票 :
              <div>
                <label>
                  <input 
                    name='invoice_method' 
                    type="radio" 
                    value='paper'
                    checked={invoiceMethod === 'paper'}
                    onChange={(e) => setInvoiceMethod(e.target.value)}
                  />
                  紙本
                </label>
                <div>
                  <label>
                    <input 
                      name='invoice_method' 
                      type="radio" 
                      value='mobile'
                      checked={invoiceMethod === 'mobile'}
                      onChange={(e) => setInvoiceMethod(e.target.value)}
                    />
                    手機載具
                  </label>
                  {invoiceMethod === 'mobile' && (
                    <label>
                      : 
                      <input type="text" name='mobile_barcode'  value='/'/>
                    </label>
                  )}
                </div>
                <div>
                  <label>
                    <input 
                      name='invoice_method' 
                      type="radio" 
                      value='taxID_number'
                      checked={invoiceMethod === 'taxID_number'}
                      onChange={(e) => setInvoiceMethod(e.target.value)}
                    />
                    統編
                  </label>
                  {invoiceMethod === 'taxID_number' && (
                    <label>
                      : 
                      <input type="text" name='mobile_barcode' />
                    </label>
                  )}
                </div>
                <label>
                  <input 
                    name='invoice_method' 
                    type="radio" 
                    value='donate'
                    checked={invoiceMethod === 'donate'}
                    onChange={(e) => setInvoiceMethod(e.target.value)}
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
      <div className={styles.btns}>
        <button  type="button" >上一步</button>
        <button  type="submit" >下一步</button>
      </div>
    </form>


  )
}
export default CheckoutPage;
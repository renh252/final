'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from "axios";
// styles
import styles from './checkout.module.css'
// components
import { Breadcrumbs } from '@/app/_components/breadcrumbs'



function CheckoutPage(props) {

const formRef = useRef(null);
const [delivery, setDelivery] = useState('')
const [storeInfo, setStoreInfo] = useState({ name: "", id: "" });
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



  return (
    <div className={styles.main}>
      <Breadcrumbs
        title="配送/付款方式"
        items={[
          { label: '購物車', href: `/shop/cart` },
          { label: '配送/付款方式', href: `/shop/checkout` }
        ]}/>
      <form className={styles.container}>
        <div className={styles.containTitle}>
            <h3>配送方式</h3>
            <div className={styles.delivery}>
                <label>
                  <input type="radio" name="delivery" value="home" checked={delivery === "home"} onChange={(event) =>{ setDelivery(event.target.value);
                  setPayload({ ...Payload, CvsType: '' })}}  />
                  宅配到府
                </label>
                <label>
                  <input 
                  type="radio" 
                  name="delivery"
                  value="seven" checked={delivery === "seven"} onChange={(event) =>{ 
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
                  value="family" checked={delivery === "family"} onChange={(event) =>{ setDelivery(event.target.value);
                    setPayload({ ...Payload, CvsType: 'FAMI'  });
                    SendParams();
                  }}
                     />
                  全家
                </label>
              
            </div>
        </div>
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
        <p>收件人:</p>
        </div>
      </form>
    </div>


  )
}
export default CheckoutPage;
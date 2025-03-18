// 使用 beforeunload 事件确保在用户离开页面时（无论是关闭标签、刷新页面还是导航到其他页面）都会清除 localStorage 数据。

import { useState, useEffect } from 'react';

export function useCheckoutData() {
  const [checkoutData, setCheckoutData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('checkoutData');
      return savedData ? JSON.parse(savedData) : {
        delivery: '',
        address:{
          city: '',
          town:'',
          else:''
        },
        storeName: '',
        storeId: '',
        recipient_name: '',
        recipient_phone: '',
        recipient_email: '',
        remark: '',
        payment_method: '',
        invoice_method: '',
        mobile_barcode: '/',
        taxID_number: '',
      };
    }
    return null;
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('checkoutData');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      localStorage.removeItem('checkoutData');
    };
  }, []);

  useEffect(() => {
    if (checkoutData) {
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
  }, [checkoutData]);

  return [checkoutData, setCheckoutData];
}
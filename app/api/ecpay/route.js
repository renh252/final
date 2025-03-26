import * as crypto from 'crypto'
import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function POST(req) {
  const {
    orderType, // 用來區分是 "shop" 還是 "donation"
    userId,
    amount,
    items,
    ChoosePayment,
    selectedPaymentMode,
    petId,
    donorName,
    donorPhone,
    donorEmail,
    retry_trade_no,
    invoiceMethod,
    invoice,
    mobileBarcode,
    taxIDNumber,
    recipientName,
    recipientPhone,
    recipientEmail,
    remark,
    shippingMethod,
    shippingAddress,
  } = await req.json()

  const itemName = items

  if (!amount) {
    return new Response(JSON.stringify({ error: '缺少總金額' }), {
      status: 400,
    })
  }

  let TradeDesc = 'ECPay 線上支付'
  let tableInsertResult = null // 存放 SQL 插入結果

  // 產生 ECPay 訂單編號
  const now = new Date()
  const MerchantTradeNo =
    'od' +
    now
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14) + // 取年月日時分秒
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0') // 加上 3 碼隨機數字

  if (orderType === 'donation') {
    if (!donorName || !donorPhone || !donorEmail) {
      return NextResponse.json(
        { error: '請填寫完整的捐款人資料' },
        { status: 400 }
      )
    }
    const petIdValue = petId ? petId : null // 確保 NULL 值
    const retryTradeNo = retry_trade_no ? retry_trade_no : null // 確保 NULL 值

    // 新增捐款記錄
    let tableInsertResult = await db.query(
      `INSERT INTO donations (donation_type, pet_id, amount, donation_mode, payment_method, user_id, donor_name, donor_phone, donor_email, trade_no, transaction_status, retry_trade_no) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        items,
        petIdValue,
        amount,
        selectedPaymentMode,
        ChoosePayment,
        userId,
        donorName,
        donorPhone,
        donorEmail,
        MerchantTradeNo,
        '未付款',
        retryTradeNo,
      ]
    )

    TradeDesc = '捐款支付'
  } else if (orderType === 'shop') {
    // **處理商城交易**
    if (!userId || !recipientName || !recipientPhone || !recipientEmail) {
      return NextResponse.json({ error: '訂單資料不完整' }, { status: 400 })
    }
    // 新增訂單
    let tableInsertResult = await db.query(
      `INSERT INTO orders (order_id, user_id, total_price, order_status, payment_method, payment_status, invoice_method, invoice, mobile_barcode, taxID_number, recipient_name, recipient_phone, recipient_email, remark, shipping_method, shipping_address, tracking_number, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        MerchantTradeNo,
        userId,
        amount,
        '待付款', // 初始狀態
        '信用卡',
        '待付款', // 尚未付款
        invoiceMethod,
        invoice,
        mobileBarcode,
        taxIDNumber,
        recipientName,
        recipientPhone,
        recipientEmail,
        remark || '',
        shippingMethod,
        shippingAddress,
        null,
      ]
    )

    // 從購物車獲取商品並插入 order_items
    const [cartItems] = await db.execute(
      `
      SELECT 
        cart.id AS cart_id,
        cart.product_id,
        cart.variant_id,
        cart.quantity,
        COALESCE(variants.price, products.price) AS price,
        promo.discount_percentage
      FROM 
        shopping_cart AS cart
      JOIN 
        products ON cart.product_id = products.product_id
      LEFT JOIN 
        product_variants AS variants ON cart.variant_id = variants.variant_id
      LEFT JOIN (
        SELECT 
          pp.product_id,
          p.promotion_id,
          p.discount_percentage,
          ROW_NUMBER() OVER (PARTITION BY pp.product_id ORDER BY p.start_date DESC) as rn
        FROM 
          promotion_products pp
        JOIN 
          promotions p ON pp.promotion_id = p.promotion_id
        WHERE 
          p.start_date <= CURDATE() AND (p.end_date IS NULL OR p.end_date >= CURDATE())
      ) AS promo ON cart.product_id = promo.product_id AND promo.rn = 1
      WHERE 
        cart.user_id = ?
    `,
      [userId]
    )

    for (const item of cartItems) {
      // 计算折扣后的价格
      const discountedPrice = item.discount_percentage
        ? Math.ceil(item.price * (1 - item.discount_percentage / 100))
        : item.price

      await db.execute(
        `INSERT INTO order_items(
        order_id, 
        product_id, 
        variant_id,
        quantity,
        price) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          MerchantTradeNo,
          item.product_id,
          item.variant_id,
          item.quantity,
          discountedPrice,
        ]
      )
    }

    // 清空購物車
    await db.query('DELETE FROM shopping_cart WHERE user_id = ?', [userId])

    TradeDesc = '商城購物支付'
  } else {
    return NextResponse.json({ error: '未知的 orderType' }, { status: 400 })
  }

  // ECPay 配置
  const MerchantID = '3002607'
  const HashKey = 'pwFHCqoQZGmho4w6'
  const HashIV = 'EkRm7iFT261dpevs'
  const isStage = true // 測試環境
  const TotalAmount = Number(amount) // 總金額
  const ItemName = itemName // 商品名稱

  // 在localhost上執行
  const ReturnURL = `http://localhost:3000/api/ecpay/notify` // 目前無作用
  const OrderResultURL = 'http://localhost:3000/api/ecpay/callback'

  // 使用公開網域執行(ngrok)，無法運行請切換成localhost版本
  // const ReturnURL = `  https://b155-36-239-254-206.ngrok-free.app/api/ecpay/notify`
  // const OrderResultURL ='  https://b155-36-239-254-206.ngrok-free.app/api/ecpay/callback'

  const stage = isStage ? '-stage' : ''
  const algorithm = 'sha256'
  const digest = 'hex'
  const APIURL = `https://payment${stage}.ecpay.com.tw/Cashier/AioCheckOut/V5`

  const MerchantTradeDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const ecpayChoosePayment =
    ChoosePayment === 'CreditPeriod' ? 'Credit' : ChoosePayment

  let ParamsBeforeCMV = {
    MerchantID,
    MerchantTradeNo,
    MerchantTradeDate: MerchantTradeDate.toString(),
    PaymentType: 'aio',
    EncryptType: 1,
    TotalAmount,
    TradeDesc,
    ItemName,
    ReturnURL, //  確保 ECPay 正確通知 `notify.js`，目前暫時以callback取代功能
    ChoosePayment: ecpayChoosePayment,
    OrderResultURL, // ✅ 確保交易完成後能正確回到前端
    CustomField1: orderType, // 儲存 orderType
  }

  // 處理信用卡定期定額 (CreditPeriod)
  if (ChoosePayment === 'CreditPeriod') {
    ParamsBeforeCMV = {
      ...ParamsBeforeCMV,
      PeriodAmount: TotalAmount, // 每次扣款金額
      PeriodType: 'M', // M=每月, Y=每年, D=每日
      Frequency: 1, // 每 1 個月扣款一次
      ExecTimes: 12, // 總共扣款 12 次
    }
  }

  function CheckMacValueGen(parameters, algorithm, digest) {
    let Step0 = Object.entries(parameters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    function DotNETURLEncode(string) {
      const list = {
        '%2D': '-',
        '%5F': '_',
        '%2E': '.',
        '%21': '!',
        '%2A': '*',
        '%28': '(',
        '%29': ')',
        '%20': '+',
      }
      Object.entries(list).forEach(([encoded, decoded]) => {
        const regex = new RegExp(encoded, 'g')
        string = string.replace(regex, decoded)
      })
      return string
    }

    const Step1 = Step0.split('&')
      .sort((a, b) => {
        const keyA = a.split('=')[0]
        const keyB = b.split('=')[0]
        return keyA.localeCompare(keyB)
      })
      .join('&')

    const Step2 = `HashKey=${HashKey}&${Step1}&HashIV=${HashIV}`
    const Step3 = DotNETURLEncode(encodeURIComponent(Step2))
    const Step4 = Step3.toLowerCase()
    const Step5 = crypto.createHash(algorithm).update(Step4).digest(digest)
    return Step5.toUpperCase()
  }

  const CheckMacValue = CheckMacValueGen(ParamsBeforeCMV, algorithm, digest)

  const AllParams = { ...ParamsBeforeCMV, CheckMacValue }

  return new Response(JSON.stringify({ action: APIURL, params: AllParams }), {
    status: 200,
  })
}

'use client'

import { useRouter, useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import styles from './donationDetail.module.css'
import StatusBadge from '../../_components/StatusBadge'
import Alert from '@/app/_components/alert'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DonationDetailPage() {
  const { donationId } = useParams()
  const router = useRouter()

  // 取得捐款詳情
  const { data, error } = useSWR(`/api/donate/donations/${donationId}`, fetcher)

  if (error) return <div className={styles.error}> 加載失敗，請稍後再試</div>
  if (!data) return <div className={styles.loading}> 加載中...</div>

  const donation = data.donation

  // 取消訂單
  const handleCancelOrder = async () => {
    Alert({
      title: '確定要取消這筆訂單嗎？',
      icon: 'warning',

      // 右上關閉按鈕CloseButton:預設為false
      showCloseButton: true,
      // 確認按鈕ConfirmButton:預設為false
      showconfirmBtn: true,
      confirmBtnText: '確定',

      // 取消按鈕CancelButton:預設為false
      showCancelBtn: true,
      cancelBtnText: '取消',

      // 自動關閉時間:預設為false
      timer: 3000,

      // 確認按鈕事件(預設為false)
      function: async () => {
        const res = await fetch(`/api/donate/donations/cancel/${donation.id}`)
        if (res.ok) {
          Alert({
            title: '訂單已取消！',
            icon: 'success',
            timer: 1000,
          })
          await mutate(`/api/donate/donations/${donationId}`) // 🔁 重新抓資料
        } else {
          Alert({
            title: '取消失敗，請稍後嘗試',
            icon: 'error',
            timer: 1000,
          })
        }
      },
    })
  }

  //重新付款
  const handleRecharge = async () => {
    Alert({
      title: '確定要重新付款嗎？',
      icon: 'warning',

      // 右上關閉按鈕CloseButton:預設為false
      showCloseButton: true,
      // 確認按鈕ConfirmButton:預設為false
      showconfirmBtn: true,
      confirmBtnText: '確定',

      // 取消按鈕CancelButton:預設為false
      showCancelBtn: true,
      cancelBtnText: '取消',

      // 自動關閉時間:預設為false
      timer: 3000,

      // 確認按鈕事件(預設為false)
      function: async () => {
        const payload = {
          orderType: 'donation',
          userId: donation.user_id,
          amount: donation.amount,
          items: donation.donation_type,
          ChoosePayment: donation.payment_method,
          selectedPaymentMode: donation.donation_mode,
          petId: donation.pet_id,
          donorName: donation.donor_name,
          donorPhone: donation.donor_phone,
          donorEmail: donation.donor_email,
          retry_trade_no: donation.trade_no,
        }

        const res = await fetch('/api/ecpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result = await res.json()
        if (!res.ok) {
          Alert({
            title: '付款連線失敗，請稍後嘗試',
            icon: 'error',
            timer: 1000,
          })
          return
        }

        // ✅ 建立表單並導向至 ECPay
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = result.action

        for (const [key, value] of Object.entries(result.params)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        }

        document.body.appendChild(form)
        form.submit()
      },
    })
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>捐款詳情</h2>

      <div className={styles.detailBox}>
        <h3 className={styles.sectionTitle}>基本資訊</h3>
        <p>
          <strong>捐款編號：</strong>
          {donation.trade_no}
        </p>
        {donation.retry_trade_no && (
          <p>
            <strong>原始編號：</strong>
            {donation.retry_trade_no}
          </p>
        )}
        <p>
          <strong>金額：</strong>NT$ {donation.amount}
        </p>
        <p>
          <strong>交易狀態：</strong>
          <StatusBadge status={donation.transaction_status} />
        </p>
        <p>
          <strong>付款方式：</strong>
          {donation.payment_method}
        </p>
        <p>
          <strong>捐款方式：</strong>
          {donation.donation_mode}
        </p>
        <p>
          <strong>捐款類型：</strong>
          {donation.donation_type}
        </p>

        <hr className={styles.separator} />

        <h3 className={styles.sectionTitle}>捐款人資訊</h3>
        <p>
          <strong>姓名：</strong>
          {donation.donor_name}
        </p>
        <p>
          <strong>電話：</strong>
          {donation.donor_phone}
        </p>
        <p>
          <strong>Email：</strong>
          {donation.donor_email}
        </p>
        <p>
          <strong>是否需要收據：</strong>
          {donation.is_receipt_needed === '是' ? '✔ 需要' : '✖ 不需要'}
        </p>

        <hr className={styles.separator} />

        <h3 className={styles.sectionTitle}>時間資訊</h3>
        <p>
          <strong>捐款時間：</strong>
          {new Date(donation.create_datetime).toLocaleString()}
        </p>
      </div>

      {donation.transaction_status === '付款失敗' && (
        <div className={styles.chooseButton}>
          <button type="button" onClick={handleCancelOrder}>
            取消訂單
          </button>
          <button type="button" onClick={handleRecharge}>
            重新付款
          </button>
        </div>
      )}

      <button
        className={styles.backButton}
        onClick={() => router.push('/member/donations')}
      >
        返回捐款紀錄
      </button>
    </div>
  )
}

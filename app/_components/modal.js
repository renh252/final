import ReactDOM from 'react-dom'
import React, { useState } from 'react'
import styles from './modal.module.css'

// 彈跳視窗使用方法
/*
import Modal from '@/app/_components/modal'

const [modalContent, setModalContent] = useState(null)

function openModal() {
  setModalContent(
    <Modal
      onClose={() => setModalContent(null)}
      showCloseButton={true}
      showConfirmButton={true}
      onConfirm={(setWarn) => {
        // 在這裡處理確認邏輯
        // 如果需要顯示警告，使用 setWarn("警告訊息")
        // 返回 true 關閉 Modal，返回 false 保持 Modal 開啟
      }}
    >
    ----------- 內容 ---------------
      <h1>標題</h1>
      ...
    ----------- 內容 ---------------
    </Modal>
  )
}


return(
  <button onClick={openModal}>顯示彈跳視窗</button>
  {isModalOpen}
)
*/

export default function Modal({ 
  onClose, 
  children, 
  showCloseButton = true, 
  showConfirmButton = true, 
  onConfirm,
  initialWarn = null
}) {
  const [warn, setWarn] = useState(initialWarn)

  const handleConfirm = () => {
    const result = onConfirm(setWarn)
    if (result === true) {
      onClose()
    }
  }

  return ReactDOM.createPortal(
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <button className={styles.modal_close} onClick={onClose}>
          &times;
        </button>
        {children}
        <div className={styles.btns}>
          {showCloseButton && (
            <button className={styles.customCancel} onClick={onClose}>關閉</button>
          )}
          {showConfirmButton && (
            <button className={styles.customConfirm} onClick={handleConfirm}>確認</button>
          )}
        </div>
        {warn && <div className={styles.warn}>{warn}</div>}
      </div>
    </div>,
    document.body
  )
}
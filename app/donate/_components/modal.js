import { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import style from './modal.module.css'

export default function RescueModal({
  isOpen,
  closeModal,
  title,
  content,
  images,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Modal show={isOpen} onHide={closeModal} centered>
      <Modal.Header closeButton>
        {' '}
        <Modal.Title className="w-100 text-center mb-2">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center">
        {images.length > 0 && (
          <div className="text-center">
            <img
              src={images[currentImageIndex]}
              alt="案件圖片"
              className="w-100 rounded mb-3"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={prevImage}
                disabled={images.length <= 1}
                className={style.button_m}
              >
                ◀ 上一張
              </Button>
              <Button
                variant="secondary"
                onClick={nextImage}
                disabled={images.length <= 1}
                className={style.button_m}
              >
                下一張 ▶
              </Button>
            </div>
          </div>
        )}
        <p className="mt-3">{content}</p>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          variant="secondary"
          onClick={closeModal}
          className={style.button_c}
        >
          X 關閉
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
